# Dashboard di Analisi Performance Microprompt

**Versione:** 1.0
**Data:** 2025-10-07
**Progetto:** Vantyx.ai POC Website

---

## 1. Overview

Dashboard per monitorare e analizzare le performance dei microprompt attraverso metriche di feedback utente, tempi di risposta, tassi di conversione e analisi qualitative.

### 1.1 Obiettivi

- **Monitoraggio Performance**: Tracciare efficacia dei microprompt in tempo reale
- **Ottimizzazione**: Identificare microprompt da migliorare
- **Analytics**: Fornire insights data-driven per decision making
- **User Experience**: Comprendere soddisfazione utenti

---

## 2. Architettura Dashboard

### 2.1 Stack Tecnologico

```
┌─────────────────────────────────────────┐
│         Frontend Dashboard              │
│  ┌─────────────────────────────────┐   │
│  │   React + TypeScript            │   │
│  │   - Recharts (grafici)          │   │
│  │   - TailwindCSS (styling)       │   │
│  │   - React Query (data fetching) │   │
│  └──────────┬──────────────────────┘   │
└─────────────┼──────────────────────────┘
              │ HTTP/REST
              │
┌─────────────▼──────────────────────────┐
│         Analytics API                   │
│  ┌─────────────────────────────────┐   │
│  │   Flask Backend                 │   │
│  │   - Data aggregation            │   │
│  │   - Statistics computation      │   │
│  │   - Cache layer (Redis)         │   │
│  └──────────┬──────────────────────┘   │
└─────────────┼──────────────────────────┘
              │
   ┌──────────┼──────────┐
   │          │          │
┌──▼────┐ ┌──▼────┐ ┌──▼────────┐
│SQLite │ │Plaus. │ │localStorage│
│Feedbk │ │Events │ │   Cache   │
└───────┘ └───────┘ └───────────┘
```

### 2.2 Componenti Principali

1. **Dashboard Container**: Layout principale
2. **Metrics Cards**: KPI overview
3. **Charts Section**: Visualizzazioni grafiche
4. **Data Table**: Dettagli microprompt
5. **Filters Panel**: Filtri temporali e categorie

---

## 3. Metriche e KPI

### 3.1 Metriche Primarie

#### A. Feedback Score
```typescript
interface FeedbackMetrics {
  // Score generale
  satisfactionRate: number;      // % feedback positivi
  totalFeedbacks: number;         // Totale feedback ricevuti
  positiveCount: number;          // Numero feedback positivi
  negativeCount: number;          // Numero feedback negativi

  // Dettaglio per microprompt
  byMicroprompt: {
    [micropromptId: string]: {
      positive: number;
      negative: number;
      rate: number;               // % positivi
      totalResponses: number;
    }
  };
}
```

**Calcolo:**
```
Satisfaction Rate = (Positive Feedbacks / Total Feedbacks) × 100
```

#### B. Performance Metrics
```typescript
interface PerformanceMetrics {
  // Tempi di risposta
  avgResponseTime: number;        // ms, tempo medio risposta
  p50ResponseTime: number;        // ms, mediana
  p95ResponseTime: number;        // ms, 95° percentile
  p99ResponseTime: number;        // ms, 99° percentile

  // Utilizzo
  totalQueries: number;           // Totale richieste
  queriesPerDay: number;          // Media giornaliera
  peakUsageTime: string;          // Ora picco utilizzo

  // Dettaglio per microprompt
  byMicroprompt: {
    [micropromptId: string]: {
      avgTime: number;
      usageCount: number;
      successRate: number;        // % risposte senza errori
    }
  };
}
```

#### C. Engagement Metrics
```typescript
interface EngagementMetrics {
  // Conversioni
  conversationStarted: number;    // Conversazioni iniziate
  conversationCompleted: number;  // Conversazioni completate
  conversionRate: number;         // % completate

  // Durata sessione
  avgSessionDuration: number;     // Secondi
  avgMessagesPerSession: number;  // Messaggi medi
  returnUserRate: number;         // % utenti ritornanti

  // Microprompt usage
  micropromptUsageRate: {
    [micropromptId: string]: number; // % utilizzo sul totale
  };
}
```

#### D. Quality Metrics
```typescript
interface QualityMetrics {
  // Accuratezza
  accuracyScore: number;          // % risposte accurate (da feedback)
  errorRate: number;              // % errori tecnici
  retryRate: number;              // % richieste ripetute

  // User satisfaction
  nps: number;                    // Net Promoter Score (-100 a +100)
  userSatisfactionScore: number;  // 0-5 stelle

  // Dettaglio per microprompt
  byMicroprompt: {
    [micropromptId: string]: {
      accuracy: number;
      errorRate: number;
      userScore: number;
    }
  };
}
```

### 3.2 Metriche Secondarie

- **Bounce Rate**: % utenti che abbandonano dopo primo messaggio
- **Time to First Response**: Tempo prima risposta
- **Response Length**: Lunghezza media risposte
- **Query Complexity**: Complessità richieste (basata su lunghezza/parole)

---

## 4. Layout Dashboard

### 4.1 Struttura Pagina

```
┌────────────────────────────────────────────────────────────┐
│  Header                                                    │
│  Dashboard Analytics - Microprompt Performance             │
│  [Date Range Selector] [Export] [Refresh]                 │
└────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  KPI Cards (Row 1 - Overview)                               │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │Satisfact.│ │  Total   │ │Avg Resp. │ │Conversn. │      │
│  │  Rate    │ │Feedbacks │ │  Time    │ │  Rate    │      │
│  │  85.3%   │ │   1,247  │ │  1.2s    │ │  73.5%   │      │
│  │  ↑ 5.2%  │ │  ↑ 12%   │ │  ↓ 0.3s  │ │  ↑ 2.1%  │      │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  Charts Section (Row 2)                                      │
│  ┌──────────────────────────────┐ ┌────────────────────┐   │
│  │ Feedback Trend Over Time     │ │ Microprompt Usage  │   │
│  │ (Line Chart)                 │ │ (Pie Chart)        │   │
│  │                              │ │                    │   │
│  │      [Chart visualization]   │ │   [Chart visual.]  │   │
│  │                              │ │                    │   │
│  └──────────────────────────────┘ └────────────────────┘   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  Charts Section (Row 3)                                      │
│  ┌──────────────────────────────┐ ┌────────────────────┐   │
│  │ Response Time Distribution   │ │ Conversion Funnel  │   │
│  │ (Bar Chart)                  │ │ (Funnel Chart)     │   │
│  │                              │ │                    │   │
│  │      [Chart visualization]   │ │   [Chart visual.]  │   │
│  │                              │ │                    │   │
│  └──────────────────────────────┘ └────────────────────┘   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  Microprompt Performance Table (Row 4)                       │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ ID  │ Name        │ Usage │ Sat.% │ AvgTime │ Trend │   │
│  │─────┼─────────────┼───────┼───────┼─────────┼───────│   │
│  │ 001 │ Greeting    │ 342   │ 92.1% │ 0.8s    │ ↑     │   │
│  │ 002 │ Product FAQ │ 189   │ 78.3% │ 1.5s    │ ↓     │   │
│  │ 003 │ Support     │ 156   │ 81.4% │ 1.3s    │ →     │   │
│  │ ... │ ...         │ ...   │ ...   │ ...     │ ...   │   │
│  └─────────────────────────────────────────────────────┘   │
│  [Sort] [Filter] [Export CSV]                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  Insights & Recommendations (Row 5)                          │
│  🔍 Top Performers:                                          │
│     - Greeting microprompt: 92.1% satisfaction              │
│     - Response time under target (0.8s vs 1.5s target)     │
│                                                              │
│  ⚠️  Needs Attention:                                       │
│     - Product FAQ: satisfaction dropped 5% this week        │
│     - Support microprompt: high retry rate (12%)           │
│                                                              │
│  💡 Recommendations:                                         │
│     - Review Product FAQ responses for accuracy            │
│     - Optimize Support microprompt for clarity             │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 Componenti Dettagliati

#### A. KPI Cards Component
```typescript
interface KPICardProps {
  title: string;
  value: string | number;
  change: number;              // Percentuale cambiamento
  changeDirection: 'up' | 'down' | 'neutral';
  icon?: ReactNode;
  format?: 'percentage' | 'number' | 'time';
}

// Esempio KPI Card
<KPICard
  title="Satisfaction Rate"
  value={85.3}
  change={5.2}
  changeDirection="up"
  format="percentage"
  icon={<ThumbsUpIcon />}
/>
```

#### B. Charts Components

**1. Feedback Trend Line Chart**
```typescript
interface FeedbackTrendData {
  date: string;
  positive: number;
  negative: number;
  satisfactionRate: number;
}

// Visualizza andamento feedback nel tempo
// X-axis: Date
// Y-axis: Number of feedbacks / Satisfaction %
// Lines: Positive (green), Negative (red), Rate (blue)
```

**2. Microprompt Usage Pie Chart**
```typescript
interface UsageData {
  micropromptName: string;
  usageCount: number;
  percentage: number;
}

// Mostra distribuzione utilizzo microprompt
// Slices: Per ogni microprompt
// Colors: Palette gradiente
```

**3. Response Time Distribution Bar Chart**
```typescript
interface ResponseTimeData {
  micropromptName: string;
  avgTime: number;
  p95Time: number;
}

// Confronta tempi risposta microprompt
// X-axis: Microprompt names
// Y-axis: Time (ms)
// Bars: Average (blue), P95 (orange)
```

**4. Conversion Funnel Chart**
```typescript
interface FunnelData {
  stage: string;
  count: number;
  percentage: number;
}

// Mostra conversione attraverso funnel
// Stages: Pageview → Conversation Started → Message Sent → Completed
// Width: Proporzionale a count
```

#### C. Data Table Component
```typescript
interface MicropromptRow {
  id: string;
  name: string;
  category: string;
  usageCount: number;
  satisfactionRate: number;
  avgResponseTime: number;
  trend: 'up' | 'down' | 'neutral';
  lastUpdated: Date;
}

// Features:
// - Sorting per colonna
// - Filtri per categoria
// - Search bar
// - Export CSV/JSON
// - Pagination
// - Click per dettagli
```

---

## 5. Fonti Dati

### 5.1 Plausible Analytics Events

```typescript
// Eventi tracciati (da analytics-events.json)
const plausibleEvents = {
  'Conversation Started': {
    props: ['conversationType', 'userType', 'entryPoint']
  },
  'Conversation Completed': {
    props: ['messageCount', 'duration', 'outcome', 'category']
  },
  'Feedback Submitted': {
    props: ['feedbackType', 'messageId', 'timestamp']
  }
};
```

### 5.2 SQLite Feedback Database

```sql
-- Schema feedback table
CREATE TABLE feedback (
  id INTEGER PRIMARY KEY,
  message_id TEXT NOT NULL,
  feedback_type TEXT NOT NULL,
  session_id TEXT,
  timestamp TEXT NOT NULL,
  user_agent TEXT,
  ip_address TEXT,
  metadata TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Query esempio: Satisfaction rate per periodo
SELECT
  DATE(timestamp) as date,
  COUNT(*) as total,
  SUM(CASE WHEN feedback_type = 'positive' THEN 1 ELSE 0 END) as positive,
  ROUND(
    SUM(CASE WHEN feedback_type = 'positive' THEN 1 ELSE 0 END) * 100.0 / COUNT(*),
    2
  ) as satisfaction_rate
FROM feedback
WHERE timestamp >= DATE('now', '-30 days')
GROUP BY DATE(timestamp)
ORDER BY date;
```

### 5.3 localStorage Cache

```typescript
// Dati cached localmente
interface CachedAnalytics {
  lastFetch: string;
  ttl: number;                    // Time to live (ms)
  data: {
    feedbackMetrics: FeedbackMetrics;
    performanceMetrics: PerformanceMetrics;
    engagementMetrics: EngagementMetrics;
  };
}
```

---

## 6. API Endpoints

### 6.1 Analytics API

```typescript
// GET /api/analytics/overview
// Ritorna KPI overview
interface OverviewResponse {
  satisfactionRate: number;
  totalFeedbacks: number;
  avgResponseTime: number;
  conversionRate: number;
  period: string;
}

// GET /api/analytics/feedback-trend?days=30
// Ritorna trend feedback
interface FeedbackTrendResponse {
  data: Array<{
    date: string;
    positive: number;
    negative: number;
    rate: number;
  }>;
}

// GET /api/analytics/microprompt-performance
// Ritorna performance per microprompt
interface MicropromptPerformanceResponse {
  microprompts: Array<{
    id: string;
    name: string;
    usageCount: number;
    satisfactionRate: number;
    avgResponseTime: number;
    trend: 'up' | 'down' | 'neutral';
  }>;
}

// GET /api/analytics/conversion-funnel
// Ritorna dati funnel conversione
interface ConversionFunnelResponse {
  stages: Array<{
    name: string;
    count: number;
    percentage: number;
  }>;
}

// GET /api/analytics/export?format=csv
// Export dati in CSV/JSON
```

### 6.2 Rate Limiting

```
Rate Limits:
- Overview endpoint: 100 req/min
- Trend endpoints: 50 req/min
- Export endpoint: 10 req/min
```

---

## 7. Implementazione Componenti

### 7.1 Dashboard Container

```typescript
// File: src/components/dashboard/AnalyticsDashboard.tsx

import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { DateRangePicker } from './DateRangePicker';
import { KPICards } from './KPICards';
import { ChartsSection } from './ChartsSection';
import { MicropromptTable } from './MicropromptTable';
import { InsightsPanel } from './InsightsPanel';
import { analyticsAPI } from '../../services/analyticsAPI';

export const AnalyticsDashboard: React.FC = () => {
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    end: new Date(),
  });

  // Fetch overview data
  const { data: overview, isLoading } = useQuery(
    ['analytics-overview', dateRange],
    () => analyticsAPI.getOverview(dateRange),
    { refetchInterval: 60000 } // Refresh ogni minuto
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Microprompt Analytics Dashboard
        </h1>
        <div className="mt-4 flex items-center justify-between">
          <DateRangePicker
            value={dateRange}
            onChange={setDateRange}
          />
          <div className="flex gap-2">
            <button className="btn-secondary">Export</button>
            <button className="btn-primary">Refresh</button>
          </div>
        </div>
      </header>

      {/* KPI Cards */}
      <KPICards data={overview} isLoading={isLoading} />

      {/* Charts */}
      <ChartsSection dateRange={dateRange} />

      {/* Data Table */}
      <MicropromptTable dateRange={dateRange} />

      {/* Insights */}
      <InsightsPanel data={overview} />
    </div>
  );
};
```

### 7.2 KPI Cards Section

```typescript
// File: src/components/dashboard/KPICards.tsx

import React from 'react';
import { KPICard } from './KPICard';
import { ThumbsUp, MessageSquare, Clock, TrendingUp } from 'lucide-react';

interface KPICardsProps {
  data: OverviewData;
  isLoading: boolean;
}

export const KPICards: React.FC<KPICardsProps> = ({ data, isLoading }) => {
  if (isLoading) return <KPICardsSkeleton />;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <KPICard
        title="Satisfaction Rate"
        value={data.satisfactionRate}
        change={data.satisfactionChange}
        changeDirection={data.satisfactionChange > 0 ? 'up' : 'down'}
        format="percentage"
        icon={<ThumbsUp className="h-6 w-6" />}
        color="green"
      />

      <KPICard
        title="Total Feedbacks"
        value={data.totalFeedbacks}
        change={data.feedbacksChange}
        changeDirection="up"
        format="number"
        icon={<MessageSquare className="h-6 w-6" />}
        color="blue"
      />

      <KPICard
        title="Avg Response Time"
        value={data.avgResponseTime}
        change={-data.responseTimeChange}
        changeDirection="down"
        format="time"
        icon={<Clock className="h-6 w-6" />}
        color="purple"
      />

      <KPICard
        title="Conversion Rate"
        value={data.conversionRate}
        change={data.conversionChange}
        changeDirection="up"
        format="percentage"
        icon={<TrendingUp className="h-6 w-6" />}
        color="orange"
      />
    </div>
  );
};
```

### 7.3 Charts Section

```typescript
// File: src/components/dashboard/ChartsSection.tsx

import React from 'react';
import { useQuery } from 'react-query';
import { FeedbackTrendChart } from './charts/FeedbackTrendChart';
import { MicropromptUsageChart } from './charts/MicropromptUsageChart';
import { ResponseTimeChart } from './charts/ResponseTimeChart';
import { ConversionFunnelChart } from './charts/ConversionFunnelChart';
import { analyticsAPI } from '../../services/analyticsAPI';

interface ChartsSectionProps {
  dateRange: { start: Date; end: Date };
}

export const ChartsSection: React.FC<ChartsSectionProps> = ({ dateRange }) => {
  const { data: trendData } = useQuery(
    ['feedback-trend', dateRange],
    () => analyticsAPI.getFeedbackTrend(dateRange)
  );

  const { data: usageData } = useQuery(
    ['microprompt-usage', dateRange],
    () => analyticsAPI.getMicropromptUsage(dateRange)
  );

  const { data: responseTimeData } = useQuery(
    ['response-time', dateRange],
    () => analyticsAPI.getResponseTimeDistribution(dateRange)
  );

  const { data: funnelData } = useQuery(
    ['conversion-funnel', dateRange],
    () => analyticsAPI.getConversionFunnel(dateRange)
  );

  return (
    <>
      {/* Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Feedback Trend</h3>
          <FeedbackTrendChart data={trendData} />
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Microprompt Usage</h3>
          <MicropromptUsageChart data={usageData} />
        </div>
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Response Time</h3>
          <ResponseTimeChart data={responseTimeData} />
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Conversion Funnel</h3>
          <ConversionFunnelChart data={funnelData} />
        </div>
      </div>
    </>
  );
};
```

### 7.4 Microprompt Table

```typescript
// File: src/components/dashboard/MicropromptTable.tsx

import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { ArrowUp, ArrowDown, Minus, Download } from 'lucide-react';
import { analyticsAPI } from '../../services/analyticsAPI';

interface MicropromptTableProps {
  dateRange: { start: Date; end: Date };
}

export const MicropromptTable: React.FC<MicropromptTableProps> = ({ dateRange }) => {
  const [sortBy, setSortBy] = useState<string>('usageCount');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [searchQuery, setSearchQuery] = useState('');

  const { data, isLoading } = useQuery(
    ['microprompt-performance', dateRange, sortBy, sortOrder],
    () => analyticsAPI.getMicropromptPerformance(dateRange, sortBy, sortOrder)
  );

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  const handleExport = () => {
    analyticsAPI.exportData(dateRange, 'csv');
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <ArrowUp className="h-4 w-4 text-green-500" />;
      case 'down': return <ArrowDown className="h-4 w-4 text-red-500" />;
      default: return <Minus className="h-4 w-4 text-gray-400" />;
    }
  };

  const filteredData = data?.filter((row) =>
    row.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-white rounded-lg shadow mb-6">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Microprompt Performance</h3>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Search microprompts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-text"
            />
            <button onClick={handleExport} className="btn-secondary">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left cursor-pointer" onClick={() => handleSort('id')}>
                  ID
                </th>
                <th className="px-6 py-3 text-left cursor-pointer" onClick={() => handleSort('name')}>
                  Name
                </th>
                <th className="px-6 py-3 text-left cursor-pointer" onClick={() => handleSort('usageCount')}>
                  Usage
                </th>
                <th className="px-6 py-3 text-left cursor-pointer" onClick={() => handleSort('satisfactionRate')}>
                  Satisfaction
                </th>
                <th className="px-6 py-3 text-left cursor-pointer" onClick={() => handleSort('avgResponseTime')}>
                  Avg Time
                </th>
                <th className="px-6 py-3 text-left">
                  Trend
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredData?.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">{row.id}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{row.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{row.usageCount.toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      row.satisfactionRate >= 80 ? 'bg-green-100 text-green-800' :
                      row.satisfactionRate >= 60 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {row.satisfactionRate.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {row.avgResponseTime.toFixed(2)}s
                  </td>
                  <td className="px-6 py-4">
                    {getTrendIcon(row.trend)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
```

---

## 8. Calcoli e Algoritmi

### 8.1 Satisfaction Rate Calculation

```typescript
function calculateSatisfactionRate(
  positive: number,
  negative: number
): number {
  const total = positive + negative;
  if (total === 0) return 0;
  return (positive / total) * 100;
}
```

### 8.2 Trend Detection

```typescript
function detectTrend(
  currentValue: number,
  previousValue: number,
  threshold: number = 5
): 'up' | 'down' | 'neutral' {
  const change = ((currentValue - previousValue) / previousValue) * 100;

  if (Math.abs(change) < threshold) return 'neutral';
  return change > 0 ? 'up' : 'down';
}
```

### 8.3 Percentile Calculation

```typescript
function calculatePercentile(
  values: number[],
  percentile: number
): number {
  if (values.length === 0) return 0;

  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.ceil((percentile / 100) * sorted.length) - 1;

  return sorted[index];
}

// Esempio
const responseTimes = [100, 200, 150, 300, 250, 180];
const p95 = calculatePercentile(responseTimes, 95); // 300
```

### 8.4 Moving Average

```typescript
function calculateMovingAverage(
  data: number[],
  windowSize: number = 7
): number[] {
  const result: number[] = [];

  for (let i = 0; i < data.length; i++) {
    const start = Math.max(0, i - windowSize + 1);
    const window = data.slice(start, i + 1);
    const avg = window.reduce((sum, val) => sum + val, 0) / window.length;
    result.push(avg);
  }

  return result;
}
```

---

## 9. Filtri e Controlli

### 9.1 Date Range Picker

```typescript
interface DateRangePickerProps {
  value: { start: Date; end: Date };
  onChange: (range: { start: Date; end: Date }) => void;
  presets?: Array<{
    label: string;
    range: { start: Date; end: Date };
  }>;
}

// Preset comuni
const DEFAULT_PRESETS = [
  { label: 'Last 7 days', days: 7 },
  { label: 'Last 30 days', days: 30 },
  { label: 'Last 90 days', days: 90 },
  { label: 'Year to date', range: getYearToDate() },
];
```

### 9.2 Filtri Categoria

```typescript
interface CategoryFilter {
  categories: string[];
  selectedCategories: string[];
  onSelectionChange: (categories: string[]) => void;
}

// Categorie microprompt
const MICROPROMPT_CATEGORIES = [
  'Greeting',
  'Product Info',
  'Support',
  'Sales',
  'General',
  'FAQ'
];
```

### 9.3 Refresh Controls

```typescript
// Auto-refresh interval selector
const REFRESH_INTERVALS = [
  { label: 'Off', value: 0 },
  { label: '30s', value: 30000 },
  { label: '1min', value: 60000 },
  { label: '5min', value: 300000 },
];
```

---

## 10. Export e Reporting

### 10.1 Export Formati

**CSV Export**
```typescript
function exportToCSV(data: MicropromptRow[]): void {
  const headers = ['ID', 'Name', 'Usage', 'Satisfaction %', 'Avg Time (s)', 'Trend'];
  const rows = data.map(row => [
    row.id,
    row.name,
    row.usageCount,
    row.satisfactionRate,
    row.avgResponseTime,
    row.trend
  ]);

  const csv = [headers, ...rows]
    .map(row => row.join(','))
    .join('\n');

  downloadFile(csv, 'microprompt-analytics.csv', 'text/csv');
}
```

**JSON Export**
```typescript
function exportToJSON(data: any): void {
  const json = JSON.stringify({
    exportDate: new Date().toISOString(),
    version: '1.0',
    data
  }, null, 2);

  downloadFile(json, 'microprompt-analytics.json', 'application/json');
}
```

**PDF Report** (Future enhancement)
```typescript
// Utilizzare libreria come jsPDF o react-pdf
// Generare report PDF con grafici e tabelle
```

### 10.2 Scheduled Reports

```typescript
interface ScheduledReport {
  frequency: 'daily' | 'weekly' | 'monthly';
  recipients: string[];
  format: 'csv' | 'json' | 'pdf';
  includeCharts: boolean;
}

// Configurazione email automatiche con report
```

---

## 11. Ottimizzazione Performance

### 11.1 Caching Strategy

```typescript
// Cache layer con React Query
const CACHE_CONFIG = {
  overview: { staleTime: 60000, cacheTime: 300000 },      // 1min stale, 5min cache
  trends: { staleTime: 300000, cacheTime: 600000 },       // 5min stale, 10min cache
  tables: { staleTime: 120000, cacheTime: 300000 },       // 2min stale, 5min cache
};

// Prefetching per UX migliore
queryClient.prefetchQuery('analytics-overview', fetchOverview);
```

### 11.2 Data Aggregation

```typescript
// Backend: Pre-aggregare dati per periodi comuni
// Tabelle aggregate in database
CREATE TABLE analytics_daily_aggregate (
  date DATE PRIMARY KEY,
  total_feedbacks INTEGER,
  positive_feedbacks INTEGER,
  negative_feedbacks INTEGER,
  avg_response_time REAL,
  total_queries INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

// Refresh giornaliero con CRON job
```

### 11.3 Pagination

```typescript
interface PaginationConfig {
  page: number;
  pageSize: number;
  totalCount: number;
}

// Server-side pagination per tabelle grandi
// Client-side pagination per < 1000 righe
```

---

## 12. Security & Privacy

### 12.1 Access Control

```typescript
// Protezione route dashboard
// Solo admin/analytics users possono accedere

interface DashboardPermissions {
  canViewAnalytics: boolean;
  canExportData: boolean;
  canConfigureReports: boolean;
}
```

### 12.2 Data Anonymization

```typescript
// Rimozione dati personali da analytics
// Non salvare IP, user agent dettagliati in reports
// Aggregare sempre i dati prima di export
```

### 12.3 Rate Limiting

```typescript
// Limiti API per evitare abuse
const RATE_LIMITS = {
  analyticsAPI: 100,      // requests per minute
  exportAPI: 10,          // requests per minute
};
```

---

## 13. Testing

### 13.1 Unit Tests

```typescript
// Test calcoli metriche
describe('calculateSatisfactionRate', () => {
  it('should calculate correct percentage', () => {
    expect(calculateSatisfactionRate(80, 20)).toBe(80);
    expect(calculateSatisfactionRate(0, 0)).toBe(0);
  });
});
```

### 13.2 Integration Tests

```typescript
// Test API endpoints
describe('Analytics API', () => {
  it('should return overview data', async () => {
    const response = await analyticsAPI.getOverview(dateRange);
    expect(response).toHaveProperty('satisfactionRate');
  });
});
```

### 13.3 E2E Tests

```typescript
// Test flusso completo dashboard con Playwright
test('should display dashboard and export data', async ({ page }) => {
  await page.goto('/analytics');
  await expect(page.locator('h1')).toContainText('Analytics Dashboard');
  await page.click('button:has-text("Export")');
  // Verify download
});
```

---

## 14. Monitoring & Alerts

### 14.1 Alert Thresholds

```typescript
interface AlertConfig {
  satisfactionRateMin: 70;      // Alert if < 70%
  responseTimeMax: 2000;         // Alert if > 2s
  errorRateMax: 5;               // Alert if > 5%
  conversionRateMin: 60;         // Alert if < 60%
}

// Invio alert via email/Slack
```

### 14.2 Dashboard Monitoring

```typescript
// Track dashboard usage analytics
// - Pageviews dashboard
// - Export frequency
// - Most viewed charts
// - User engagement time
```

---

## 15. Future Enhancements

### 15.1 Advanced Features (v2.0)

1. **A/B Testing Dashboard**
   - Confronto performance varianti microprompt
   - Statistical significance testing
   - Automatic winner detection

2. **Predictive Analytics**
   - ML model per predire satisfaction rate
   - Anomaly detection automatica
   - Trend forecasting

3. **Real-time Updates**
   - WebSocket per dati live
   - Live charts con aggiornamenti real-time
   - Push notifications per alert

4. **Custom Dashboards**
   - Drag-and-drop dashboard builder
   - Widget personalizzabili
   - Salvataggio configurazioni

5. **Advanced Segmentation**
   - Analisi per user cohorts
   - Geographic breakdown
   - Device/browser analysis

### 15.2 Integration Enhancements

1. **Third-party Integrations**
   - Google Analytics integration
   - Mixpanel/Amplitude export
   - Slack/Teams notifications

2. **API Enhancements**
   - GraphQL API
   - Webhook support
   - Real-time streaming API

---

## 16. Deployment Checklist

- [ ] Backend API configurato e deployed
- [ ] Database inizializzato con indici
- [ ] Frontend dashboard built e deployed
- [ ] Plausible Analytics integrato
- [ ] Rate limiting configurato
- [ ] Caching layer attivo
- [ ] Monitoring e logging attivi
- [ ] Alert configurati
- [ ] Access control implementato
- [ ] Documentation completa
- [ ] Testing E2E completato
- [ ] Performance optimization validata

---

## 17. Conclusioni

### 17.1 Benefici

✅ **Visibilità completa** performance microprompt
✅ **Data-driven decisions** per ottimizzazioni
✅ **Monitoraggio real-time** soddisfazione utenti
✅ **Identificazione rapida** problemi e opportunità
✅ **Export facile** per reporting e condivisione

### 17.2 Metriche di Successo Dashboard

- **Adoption Rate**: % team che usa dashboard regolarmente
- **Data Accuracy**: Precisione dati vs realtà
- **Load Time**: < 2s per caricamento dashboard
- **User Satisfaction**: Feedback positivo team interno

---

**Fine Documento**

Versione: 1.0
Data: 2025-10-07
Autore: Claude AI
Progetto: Vantyx.ai POC Website
