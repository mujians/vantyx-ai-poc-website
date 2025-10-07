# Vantyx.ai POC Website - Maintenance Handoff Kit

**Document Version:** 1.0
**Last Updated:** 2025-10-07
**Target Audience:** Development & Operations Team

---

## 📋 Document Purpose

Questo documento fornisce tutte le informazioni necessarie per il team di manutenzione per gestire, monitorare e aggiornare l'applicazione Vantyx.ai POC Website.

---

## 🎯 System Overview

### Application Summary
- **Type:** Single Page Application (SPA) con backend API
- **Architecture:** React frontend + Express backend + OpenAI integration
- **Hosting:** Render.com
- **Repository:** [Git URL here]
- **Production URL:** https://vantyx-poc.onrender.com

### Technology Stack
```
Frontend: React 18 + TypeScript + TailwindCSS + Zustand
Backend: Express 5 + Node.js 18+
External APIs: OpenAI GPT-3.5-turbo
Testing: Vitest + Playwright + Artillery
CI/CD: GitHub Actions
Monitoring: Sentry
Analytics: Plausible (optional)
```

---

## 🔑 Access & Credentials

### Required Accounts

| Service | Purpose | Access Level |
|---------|---------|--------------|
| Render.com | Hosting & Deployment | Admin |
| GitHub | Code Repository & CI/CD | Write |
| OpenAI | API Access | API Key Owner |
| Sentry | Error Tracking | Admin |
| Plausible | Analytics (optional) | Admin |

### Environment Variables

Production environment variables are configured in Render Dashboard:

```bash
ENVIRONMENT=production
NODE_ENV=production
PORT=10000
OPENAI_API_KEY=sk-...  # SENSITIVE
SENTRY_DSN=https://...  # Optional
VITE_SENTRY_DSN=https://...  # Optional
VITE_PLAUSIBLE_DOMAIN=vantyx-poc.onrender.com  # Optional
```

**⚠️ CRITICAL:** Never commit `.env` files with real API keys to Git!

---

## 🚀 Deployment Procedures

### Automatic Deployment (Recommended)

**Production Deploy:**
```bash
git checkout master
git pull origin master
# Make changes
git commit -m "feat: your changes"
git push origin master
# Render auto-deploys
```

**Staging Deploy:**
```bash
git checkout -b feature/my-feature
# Make changes
git push origin feature/my-feature
# Render creates preview environment automatically
```

### Manual Deployment

If automatic deployment fails:

1. **Login to Render Dashboard**
2. Navigate to `vantyx-poc` service
3. Click "Manual Deploy" → "Deploy latest commit"
4. Monitor deployment logs
5. Verify health check passes

### Rollback Procedure

See [rollback-strategy.md](./rollback-strategy.md) for detailed steps.

**Quick Rollback:**
```bash
# Method 1: Render Dashboard
1. Go to Render Dashboard
2. Select service
3. Click "Rollback" → Select previous deploy
4. Confirm rollback

# Method 2: Git revert
git revert HEAD
git push origin master
```

---

## 🔍 Monitoring & Health Checks

### Health Check Endpoint

```bash
# Check application health
curl https://vantyx-poc.onrender.com/api/health

# Expected response:
{
  "status": "healthy",
  "timestamp": "2025-10-07T12:00:00Z",
  "uptime": 3600
}
```

### Monitoring Tools

1. **Render Dashboard**
   - URL: https://dashboard.render.com
   - Check: CPU, Memory, Request rate
   - Alerts: Email notifications for downtime

2. **Sentry (Error Tracking)**
   - URL: https://sentry.io
   - Monitor: JavaScript errors, API failures
   - Alerts: Critical errors via email/Slack

3. **Performance Metrics**
   - Lighthouse: Run monthly performance audits
   - Artillery: Run load tests before major releases

### Key Metrics to Monitor

| Metric | Normal Range | Alert Threshold |
|--------|--------------|-----------------|
| Response Time | <100ms | >500ms |
| Error Rate | <0.1% | >1% |
| CPU Usage | <50% | >80% |
| Memory Usage | <512MB | >900MB |
| OpenAI API Latency | <2s | >5s |

---

## 🐛 Common Issues & Solutions

### 1. Application Won't Start

**Symptoms:**
- Render shows "Deploy failed"
- Health check fails

**Diagnostic Steps:**
```bash
# Check Render logs
# Look for:
- Missing environment variables
- npm install errors
- Port binding errors
```

**Solutions:**
1. Verify all environment variables set in Render
2. Check `package.json` scripts are correct
3. Ensure Node version compatibility (>=18.0.0)
4. Review recent commits for breaking changes

---

### 2. OpenAI API Errors

**Symptoms:**
- Chatbot not responding
- Error: "OpenAI API key invalid"
- 429 Rate Limit errors

**Solutions:**
```bash
# Verify API key
curl https://vantyx-poc.onrender.com/api/health

# Check OpenAI billing
1. Login to platform.openai.com
2. Navigate to Billing
3. Verify payment method active
4. Check usage limits not exceeded

# Rotate API key if compromised
1. Generate new key on OpenAI platform
2. Update OPENAI_API_KEY in Render
3. Trigger manual redeploy
```

---

### 3. High Memory Usage

**Symptoms:**
- Render shows memory >900MB
- Application slow or crashes

**Solutions:**
1. **Restart Service**
   ```bash
   # Render Dashboard → Service → Restart
   ```

2. **Clear Caches**
   - localStorage cache limit: 100 entries
   - Check if frontend cache growing too large

3. **Investigate Memory Leaks**
   - Review recent code changes
   - Check for unclosed connections
   - Monitor Zustand store size

---

### 4. CORS Errors

**Symptoms:**
- Frontend can't connect to backend
- Browser console: "CORS policy blocked"

**Solutions:**
```javascript
// server.js - Verify CORS configuration
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://vantyx-poc.onrender.com',
    'https://your-frontend-domain.com'
  ],
  credentials: true
}));
```

---

## 🔄 Routine Maintenance Tasks

### Daily
- [ ] Check Render service status
- [ ] Review Sentry errors (if any)
- [ ] Verify health check endpoint responding

### Weekly
- [ ] Review OpenAI API usage and costs
- [ ] Check application performance metrics
- [ ] Review and address any Dependabot alerts

### Monthly
- [ ] Run Lighthouse performance audit
- [ ] Update dependencies (`npm outdated`)
- [ ] Review and rotate API keys if needed
- [ ] Backup configuration and environment variables
- [ ] Run full E2E test suite

### Quarterly
- [ ] Conduct security audit
- [ ] Review and update documentation
- [ ] Load test with Artillery (100 concurrent users)
- [ ] Update Node.js version if new LTS available

---

## 📦 Dependency Management

### Update Dependencies

```bash
# Check outdated packages
npm outdated

# Update all dependencies (careful!)
npm update

# Update specific package
npm install package-name@latest

# Test after updates
npm test
npm run build
```

### Security Vulnerabilities

```bash
# Audit dependencies
npm audit

# Fix vulnerabilities automatically
npm audit fix

# Fix with breaking changes (careful!)
npm audit fix --force
```

### Critical Dependencies

| Package | Purpose | Breaking Changes Risk |
|---------|---------|----------------------|
| react | Core framework | HIGH |
| express | Backend server | MEDIUM |
| openai | API client | MEDIUM |
| zustand | State management | LOW |
| vite | Build tool | MEDIUM |

**⚠️ Always test in staging before updating critical dependencies!**

---

## 🔐 Security Considerations

### API Keys
- **Never** commit API keys to Git
- Rotate OpenAI API key quarterly
- Use environment variables for all secrets
- Review API key permissions regularly

### Rate Limiting
- Current limit: 20 requests/hour per IP
- Configured in `server.js`
- Whitelist trusted IPs if needed

### Content Security Policy (CSP)
- Headers configured in `server.js`
- Review CSP violations in Sentry
- Update policy if new domains needed

### Input Sanitization
- All user input sanitized with DOMPurify
- Validation with Zod schemas
- Never trust client-side validation alone

---

## 📈 Scaling Considerations

### Current Limits
- **Render Instance:** 512MB RAM, 0.5 CPU
- **OpenAI Rate:** 20 req/hour per IP
- **Concurrent Users:** ~100 tested

### When to Scale

**Indicators:**
- Memory usage consistently >80%
- Response time p95 >500ms
- Error rate >1%
- OpenAI costs >$100/month

**Scaling Options:**

1. **Vertical Scaling (Render)**
   - Upgrade to higher tier instance
   - More RAM and CPU

2. **Horizontal Scaling**
   - Add more Render instances
   - Implement load balancer
   - Use Redis for shared state

3. **Optimize Code**
   - Implement caching layer (Redis)
   - Optimize database queries (if added)
   - Code splitting and lazy loading

---

## 🧪 Testing Procedures

### Before Deployment

```bash
# 1. Run unit tests
npm test

# 2. Run E2E tests
npx playwright test

# 3. Build verification
npm run build

# 4. Manual testing checklist
- [ ] Chatbot responds correctly
- [ ] Windows open/close properly
- [ ] Voice input works (Chrome/Edge)
- [ ] Microprompts display
- [ ] Mobile responsive
```

### After Deployment

```bash
# 1. Smoke tests
curl https://vantyx-poc.onrender.com/api/health
# Should return: {"status":"healthy"}

# 2. Functional tests
- [ ] Open production URL
- [ ] Send test message to chatbot
- [ ] Verify response received
- [ ] Check browser console for errors

# 3. Performance check
# Run Lighthouse audit
# Verify score >90
```

---

## 📞 Escalation Procedures

### Issue Severity Levels

| Level | Description | Response Time | Contact |
|-------|-------------|---------------|---------|
| P0 - Critical | Site down, data breach | Immediate | On-call engineer |
| P1 - High | Major feature broken | 1 hour | Team lead |
| P2 - Medium | Minor feature issue | 4 hours | Assigned developer |
| P3 - Low | Cosmetic issue | Next sprint | Product backlog |

### Contact Information

```
Tech Lead: [Name] - [email] - [phone]
DevOps: [Name] - [email] - [phone]
Product Owner: [Name] - [email]
On-Call Rotation: [PagerDuty/Slack channel]
```

### Incident Response Steps

1. **Identify & Triage**
   - Determine severity level
   - Check monitoring dashboards
   - Review recent deployments

2. **Communicate**
   - Notify stakeholders
   - Update status page
   - Create incident channel (Slack)

3. **Investigate**
   - Check logs (Render + Sentry)
   - Review recent changes
   - Isolate root cause

4. **Resolve**
   - Apply fix or rollback
   - Verify resolution
   - Monitor for recurrence

5. **Post-Mortem**
   - Document incident
   - Identify preventive measures
   - Update runbooks

---

## 📚 Additional Resources

### Documentation
- [README.md](../README.md) - Getting started
- [DEPLOY.md](../DEPLOY.md) - Deployment guide
- [API Documentation](./api-documentation.md)
- [Troubleshooting Guide](./troubleshooting-guide.md)
- [Rollback Strategy](./rollback-strategy.md)

### External Resources
- [Render Documentation](https://render.com/docs)
- [OpenAI API Docs](https://platform.openai.com/docs)
- [React Documentation](https://react.dev)
- [Express Documentation](https://expressjs.com)

### Support Channels
- GitHub Issues: [Repository URL]/issues
- Team Slack: #vantyx-support
- Email: support@vantyx.ai

---

## ✅ Handoff Checklist

Before completing handoff, ensure:

- [ ] All team members have Render access
- [ ] GitHub repository access configured
- [ ] Environment variables documented
- [ ] API keys securely shared (1Password/Vault)
- [ ] Monitoring tools configured
- [ ] Sentry access granted
- [ ] On-call rotation established
- [ ] Runbooks reviewed
- [ ] Emergency contacts updated
- [ ] Training session completed

---

## 📝 Change Log

| Date | Version | Changes | Author |
|------|---------|---------|--------|
| 2025-10-07 | 1.0 | Initial handoff document | Claude Orchestrator |

---

**Document Maintained By:** Development Team
**Review Frequency:** Quarterly
**Next Review Date:** 2026-01-07

---

**Status:** ✅ Ready for Handoff
