/**
 * OpenAI Usage Tracking Middleware
 *
 * Tracks token usage and costs for OpenAI API calls
 * Implements budget monitoring with $50/month limit
 */

import * as Sentry from '@sentry/node';

// Pricing per 1K tokens (as of January 2025)
const PRICING = {
  'gpt-4': {
    input: 0.03,   // $0.03 per 1K input tokens
    output: 0.06   // $0.06 per 1K output tokens
  },
  'gpt-4-turbo': {
    input: 0.01,
    output: 0.03
  },
  'gpt-3.5-turbo': {
    input: 0.0005,
    output: 0.0015
  }
};

// Budget configuration
const MONTHLY_BUDGET_LIMIT = 50; // $50 per month
const WARNING_THRESHOLDS = [0.5, 0.75, 0.9, 0.95]; // 50%, 75%, 90%, 95%

// In-memory storage for usage tracking
class UsageTracker {
  constructor() {
    this.dailyUsage = new Map(); // Store by date (YYYY-MM-DD)
    this.monthlyUsage = new Map(); // Store by month (YYYY-MM)
    this.lastAlertThreshold = new Map(); // Track last alert sent for each month
  }

  /**
   * Calculate cost based on token usage
   */
  calculateCost(model, inputTokens, outputTokens) {
    const pricing = PRICING[model];
    if (!pricing) {
      console.warn(`No pricing information for model: ${model}`);
      return 0;
    }

    const inputCost = (inputTokens / 1000) * pricing.input;
    const outputCost = (outputTokens / 1000) * pricing.output;
    return inputCost + outputCost;
  }

  /**
   * Get current month key (YYYY-MM)
   */
  getCurrentMonthKey() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }

  /**
   * Get current date key (YYYY-MM-DD)
   */
  getCurrentDateKey() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }

  /**
   * Track a request
   */
  trackRequest(model, inputTokens, outputTokens) {
    const cost = this.calculateCost(model, inputTokens, outputTokens);
    const monthKey = this.getCurrentMonthKey();
    const dateKey = this.getCurrentDateKey();

    // Update monthly usage
    const monthlyData = this.monthlyUsage.get(monthKey) || {
      totalCost: 0,
      totalRequests: 0,
      totalInputTokens: 0,
      totalOutputTokens: 0,
      models: {}
    };

    monthlyData.totalCost += cost;
    monthlyData.totalRequests += 1;
    monthlyData.totalInputTokens += inputTokens;
    monthlyData.totalOutputTokens += outputTokens;

    // Track per-model usage
    if (!monthlyData.models[model]) {
      monthlyData.models[model] = {
        requests: 0,
        cost: 0,
        inputTokens: 0,
        outputTokens: 0
      };
    }
    monthlyData.models[model].requests += 1;
    monthlyData.models[model].cost += cost;
    monthlyData.models[model].inputTokens += inputTokens;
    monthlyData.models[model].outputTokens += outputTokens;

    this.monthlyUsage.set(monthKey, monthlyData);

    // Update daily usage
    const dailyData = this.dailyUsage.get(dateKey) || {
      totalCost: 0,
      totalRequests: 0,
      totalInputTokens: 0,
      totalOutputTokens: 0
    };

    dailyData.totalCost += cost;
    dailyData.totalRequests += 1;
    dailyData.totalInputTokens += inputTokens;
    dailyData.totalOutputTokens += outputTokens;

    this.dailyUsage.set(dateKey, dailyData);

    return { cost, monthlyData, dailyData };
  }

  /**
   * Get current month usage
   */
  getMonthlyUsage() {
    const monthKey = this.getCurrentMonthKey();
    return this.monthlyUsage.get(monthKey) || {
      totalCost: 0,
      totalRequests: 0,
      totalInputTokens: 0,
      totalOutputTokens: 0,
      models: {}
    };
  }

  /**
   * Get current day usage
   */
  getDailyUsage() {
    const dateKey = this.getCurrentDateKey();
    return this.dailyUsage.get(dateKey) || {
      totalCost: 0,
      totalRequests: 0,
      totalInputTokens: 0,
      totalOutputTokens: 0
    };
  }

  /**
   * Check if budget threshold has been exceeded
   */
  checkBudgetThreshold() {
    const monthlyUsage = this.getMonthlyUsage();
    const currentSpend = monthlyUsage.totalCost;
    const percentUsed = (currentSpend / MONTHLY_BUDGET_LIMIT) * 100;

    const monthKey = this.getCurrentMonthKey();
    const lastAlertLevel = this.lastAlertThreshold.get(monthKey) || 0;

    // Find the highest threshold exceeded
    let newThresholdExceeded = 0;
    for (const threshold of WARNING_THRESHOLDS) {
      if (percentUsed >= threshold * 100 && threshold > lastAlertLevel) {
        newThresholdExceeded = threshold;
      }
    }

    return {
      exceeded: newThresholdExceeded > 0,
      threshold: newThresholdExceeded,
      percentUsed,
      currentSpend,
      remainingBudget: MONTHLY_BUDGET_LIMIT - currentSpend
    };
  }

  /**
   * Send budget alert
   */
  sendBudgetAlert(budgetInfo) {
    const monthKey = this.getCurrentMonthKey();

    console.warn('⚠️  BUDGET ALERT ⚠️');
    console.warn(`Month: ${monthKey}`);
    console.warn(`Threshold: ${(budgetInfo.threshold * 100).toFixed(0)}% of monthly budget`);
    console.warn(`Current Spend: $${budgetInfo.currentSpend.toFixed(4)}`);
    console.warn(`Budget Limit: $${MONTHLY_BUDGET_LIMIT}`);
    console.warn(`Remaining: $${budgetInfo.remainingBudget.toFixed(4)}`);
    console.warn(`Percent Used: ${budgetInfo.percentUsed.toFixed(2)}%`);

    // Send alert to Sentry
    if (process.env.SENTRY_DSN) {
      Sentry.captureMessage(`OpenAI Budget Alert: ${(budgetInfo.threshold * 100)}% threshold exceeded`, {
        level: budgetInfo.threshold >= 0.9 ? 'error' : 'warning',
        tags: {
          month: monthKey,
          threshold: `${(budgetInfo.threshold * 100)}%`,
          alert_type: 'budget_monitoring'
        },
        extra: {
          currentSpend: budgetInfo.currentSpend,
          budgetLimit: MONTHLY_BUDGET_LIMIT,
          remainingBudget: budgetInfo.remainingBudget,
          percentUsed: budgetInfo.percentUsed
        }
      });
    }

    // Update last alert level
    this.lastAlertThreshold.set(monthKey, budgetInfo.threshold);
  }

  /**
   * Clean old data (keep last 3 months)
   */
  cleanOldData() {
    const now = new Date();
    const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);

    // Clean monthly data
    for (const [key, _] of this.monthlyUsage) {
      const [year, month] = key.split('-').map(Number);
      const keyDate = new Date(year, month - 1, 1);
      if (keyDate < threeMonthsAgo) {
        this.monthlyUsage.delete(key);
        this.lastAlertThreshold.delete(key);
      }
    }

    // Clean daily data (keep last 30 days)
    const thirtyDaysAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);
    for (const [key, _] of this.dailyUsage) {
      const [year, month, day] = key.split('-').map(Number);
      const keyDate = new Date(year, month - 1, day);
      if (keyDate < thirtyDaysAgo) {
        this.dailyUsage.delete(key);
      }
    }
  }
}

// Global tracker instance
const usageTracker = new UsageTracker();

// Clean old data daily
setInterval(() => {
  usageTracker.cleanOldData();
}, 24 * 60 * 60 * 1000); // Every 24 hours

/**
 * Middleware to track OpenAI API usage
 * Wraps the OpenAI client to intercept requests and track usage
 */
export function trackOpenAIUsage(openaiClient) {
  const originalCreate = openaiClient.chat.completions.create.bind(openaiClient.chat.completions);

  openaiClient.chat.completions.create = async function(params) {
    const startTime = Date.now();
    const model = params.model;
    let inputTokens = 0;
    let outputTokens = 0;

    try {
      // Estimate input tokens (rough approximation: 1 token ≈ 4 characters)
      if (params.messages) {
        const totalChars = params.messages.reduce((sum, msg) => {
          return sum + (msg.content?.length || 0);
        }, 0);
        inputTokens = Math.ceil(totalChars / 4);
      }

      // Call original method
      const response = await originalCreate(params);

      // Handle streaming vs non-streaming
      if (params.stream) {
        // For streaming, we need to wrap the iterator
        return (async function* () {
          let streamedTokens = 0;

          for await (const chunk of response) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
              streamedTokens += Math.ceil(content.length / 4);
            }
            yield chunk;
          }

          // Track usage after stream completes
          outputTokens = streamedTokens;
          const trackingResult = usageTracker.trackRequest(model, inputTokens, outputTokens);

          // Log usage
          logUsage(model, inputTokens, outputTokens, trackingResult.cost, Date.now() - startTime);

          // Check budget threshold
          const budgetCheck = usageTracker.checkBudgetThreshold();
          if (budgetCheck.exceeded) {
            usageTracker.sendBudgetAlert(budgetCheck);
          }
        })();
      } else {
        // Non-streaming response
        outputTokens = response.usage?.completion_tokens || 0;
        inputTokens = response.usage?.prompt_tokens || inputTokens;

        const trackingResult = usageTracker.trackRequest(model, inputTokens, outputTokens);

        // Log usage
        logUsage(model, inputTokens, outputTokens, trackingResult.cost, Date.now() - startTime);

        // Check budget threshold
        const budgetCheck = usageTracker.checkBudgetThreshold();
        if (budgetCheck.exceeded) {
          usageTracker.sendBudgetAlert(budgetCheck);
        }

        return response;
      }
    } catch (error) {
      console.error('Error in OpenAI usage tracking:', error);
      throw error;
    }
  };

  return openaiClient;
}

/**
 * Log usage information
 */
function logUsage(model, inputTokens, outputTokens, cost, duration) {
  const monthlyUsage = usageTracker.getMonthlyUsage();
  const dailyUsage = usageTracker.getDailyUsage();

  console.log('📊 OpenAI API Usage:');
  console.log(`  Model: ${model}`);
  console.log(`  Input Tokens: ${inputTokens.toLocaleString()}`);
  console.log(`  Output Tokens: ${outputTokens.toLocaleString()}`);
  console.log(`  Request Cost: $${cost.toFixed(6)}`);
  console.log(`  Duration: ${duration}ms`);
  console.log(`  Today's Total: $${dailyUsage.totalCost.toFixed(4)} (${dailyUsage.totalRequests} requests)`);
  console.log(`  Month's Total: $${monthlyUsage.totalCost.toFixed(4)} (${monthlyUsage.totalRequests} requests)`);
  console.log(`  Remaining Budget: $${(MONTHLY_BUDGET_LIMIT - monthlyUsage.totalCost).toFixed(4)}`);
}

/**
 * Get usage statistics endpoint handler
 */
export function getUsageStats(req, res) {
  const monthlyUsage = usageTracker.getMonthlyUsage();
  const dailyUsage = usageTracker.getDailyUsage();
  const budgetInfo = usageTracker.checkBudgetThreshold();

  res.json({
    daily: {
      ...dailyUsage,
      date: usageTracker.getCurrentDateKey()
    },
    monthly: {
      ...monthlyUsage,
      month: usageTracker.getCurrentMonthKey(),
      budgetLimit: MONTHLY_BUDGET_LIMIT,
      remainingBudget: MONTHLY_BUDGET_LIMIT - monthlyUsage.totalCost,
      percentUsed: (monthlyUsage.totalCost / MONTHLY_BUDGET_LIMIT) * 100
    },
    budget: {
      limit: MONTHLY_BUDGET_LIMIT,
      thresholds: WARNING_THRESHOLDS.map(t => t * 100),
      ...budgetInfo
    }
  });
}

export default usageTracker;
