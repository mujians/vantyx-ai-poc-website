# Rollback Strategy - Vantyx.ai POC

## Overview
This document outlines the rollback strategy for the Vantyx.ai POC website, ensuring quick recovery from deployment issues or production incidents.

## Quick Rollback Decision Matrix

| Issue Severity | Action | Time Target | Responsibility |
|---------------|--------|-------------|----------------|
| **Critical** (Site down, data loss) | Immediate rollback | < 5 minutes | On-call engineer |
| **High** (Major feature broken) | Rollback after verification | < 15 minutes | Team lead approval |
| **Medium** (Minor bug, degraded UX) | Fix forward or schedule rollback | < 1 hour | Development team |
| **Low** (Cosmetic issue) | Fix in next release | N/A | Product owner |

## Rollback Methods

### 1. Render Platform Rollback (Recommended)

#### Via Render Dashboard
1. Navigate to [Render Dashboard](https://dashboard.render.com)
2. Select the affected service (production)
3. Go to "Events" or "Deploys" tab
4. Find the last stable deployment
5. Click "Rollback to this version"
6. Confirm rollback action

**Time to complete:** ~2-3 minutes

#### Via Render CLI
```bash
# Install Render CLI if not already installed
npm install -g render-cli

# Login to Render
render login

# List recent deployments
render deploys list --service <service-id>

# Rollback to specific deploy
render rollback --service <service-id> --deploy <deploy-id>
```

**Time to complete:** ~1-2 minutes

### 2. Git-Based Rollback

#### Revert Last Commit
```bash
# Create revert commit
git revert HEAD

# Push to trigger new deployment
git push origin master
```

#### Revert Multiple Commits
```bash
# Revert last N commits
git revert HEAD~N..HEAD

# Or revert to specific commit
git revert --no-commit <commit-hash>..HEAD
git commit -m "Rollback to stable version <commit-hash>"

# Push changes
git push origin master
```

**Time to complete:** ~3-5 minutes + deployment time

#### Reset to Previous Version (Use with caution)
```bash
# Only for emergency situations
git reset --hard <last-stable-commit>
git push --force origin master
```

**⚠️ WARNING:** Force push should only be used in critical situations and requires team lead approval.

### 3. Manual Deployment Rollback

If automated rollback fails:

1. **Checkout stable version locally**
   ```bash
   git checkout <last-stable-commit>
   ```

2. **Deploy manually via Render**
   - Render will automatically detect the commit and deploy

3. **Verify deployment**
   ```bash
   # Run smoke tests
   npm run test:e2e:smoke -- --headed
   ```

## Pre-Rollback Checklist

Before initiating a rollback:

- [ ] Document the issue (error messages, affected features, user impact)
- [ ] Notify team via Slack/communication channel
- [ ] Identify the last known stable deployment
- [ ] Verify the issue is deployment-related (not infrastructure)
- [ ] Check if issue can be hotfixed faster than rollback
- [ ] Obtain approval if required (based on severity matrix)

## Post-Rollback Procedure

### Immediate Actions (0-15 minutes)
- [ ] Verify service is restored
  ```bash
  # Run smoke tests on production
  npm run test:e2e:smoke -- --headed
  ```
- [ ] Check error monitoring (Sentry) for new errors
- [ ] Monitor analytics for user activity recovery
- [ ] Verify API response times are normal

### Short-term Actions (15-60 minutes)
- [ ] Document rollback in incident log
- [ ] Communicate status to stakeholders
- [ ] Identify root cause of the issue
- [ ] Create fix branch from stable version
- [ ] Update deployment documentation if needed

### Long-term Actions (1-24 hours)
- [ ] Conduct post-mortem meeting
- [ ] Document lessons learned
- [ ] Update deployment checklist
- [ ] Implement preventive measures
- [ ] Schedule fix deployment through staging

## Rollback Verification Steps

After any rollback, verify:

1. **Application Health**
   ```bash
   curl https://vantyx-ai-poc.onrender.com
   # Should return 200 OK
   ```

2. **Critical User Journeys**
   - Homepage loads correctly
   - Analytics tracking works
   - Forms submit successfully
   - All pages are accessible

3. **Performance Metrics**
   ```bash
   # Run Lighthouse audit
   npm run lighthouse
   # Performance score should be > 90
   ```

4. **Error Monitoring**
   - Check Sentry dashboard for error rate
   - Verify no critical errors in last 15 minutes

5. **API Response Times**
   ```bash
   # Test OpenAI API integration
   node -e "
   const start = Date.now();
   fetch('https://vantyx-ai-poc.onrender.com/api/test')
     .then(() => console.log('API response time:', Date.now() - start, 'ms'));
   "
   ```

## Emergency Contacts

| Role | Contact | Availability |
|------|---------|-------------|
| Technical Lead | [Name/Email] | 24/7 |
| DevOps Engineer | [Name/Email] | Business hours |
| Product Owner | [Name/Email] | Business hours |

## Database Rollback (If Applicable)

Currently, the POC does not have a database. If database migrations are added in the future:

1. **Backup before deployment**
   ```bash
   # Create database backup
   pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql
   ```

2. **Rollback migrations**
   ```bash
   # Revert last migration
   npm run migrate:down
   ```

3. **Restore from backup if needed**
   ```bash
   psql $DATABASE_URL < backup_YYYYMMDD_HHMMSS.sql
   ```

## Known Rollback Scenarios

### Scenario 1: Breaking Change in API Integration
**Symptoms:** 500 errors, API failures
**Action:** Immediate rollback via Render dashboard
**Verification:** Check Sentry for API error rate

### Scenario 2: Performance Degradation
**Symptoms:** Slow page loads, high response times
**Action:** Verify with Lighthouse, rollback if score < 70
**Verification:** Run performance audit

### Scenario 3: Analytics Tracking Broken
**Symptoms:** No events in Plausible dashboard
**Action:** Medium priority - fix forward if possible
**Verification:** Check browser console and Plausible dashboard

### Scenario 4: CSP Policy Too Restrictive
**Symptoms:** Resources blocked, console CSP errors
**Action:** Rollback or hotfix CSP headers
**Verification:** Check browser console for CSP violations

## Preventing Future Rollbacks

1. **Always deploy to staging first**
   - Run full E2E test suite
   - Perform manual QA
   - Check performance metrics

2. **Use feature flags for risky changes**
   ```javascript
   if (FEATURE_FLAGS.newFeature) {
     // New code
   } else {
     // Stable code
   }
   ```

3. **Implement gradual rollout**
   - Deploy to staging
   - Monitor for 24 hours
   - Deploy to production during low-traffic hours

4. **Maintain comprehensive monitoring**
   - Sentry for errors
   - Plausible for user behavior
   - Lighthouse for performance
   - Uptime monitoring

## Rollback History Log

Track all rollbacks for continuous improvement:

```markdown
| Date | Time | Trigger | Method | Duration | Root Cause |
|------|------|---------|--------|----------|------------|
| YYYY-MM-DD | HH:MM | Description | Render/Git | Xmin | Reason |
```

## Testing Rollback Procedures

Regularly test rollback procedures in staging:

```bash
# 1. Deploy a test breaking change to staging
# 2. Practice rollback using different methods
# 3. Time the rollback process
# 4. Document any issues encountered
# 5. Update this document
```

**Recommended frequency:** Monthly or after major changes

## Additional Resources

- [Render Rollback Documentation](https://render.com/docs/deploys#rolling-back)
- [Git Revert Documentation](https://git-scm.com/docs/git-revert)
- [Incident Response Best Practices](https://response.pagerduty.com/)
- Staging Environment Documentation: `staging_environment.md`
- Deployment Guide: `DEPLOY.md`

---

**Last Updated:** 2025-10-07
**Version:** 1.0
**Owner:** Development Team
