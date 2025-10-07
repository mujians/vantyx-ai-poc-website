# Staging Environment Documentation

## Overview
L'ambiente di staging di Vantyx.ai POC è configurato su Render per testare modifiche prima del deploy in produzione.

## URL Staging
- **Service Name**: `vantyx-poc-backend-staging`
- **URL**: Generato automaticamente da Render per ogni preview branch
- **Preview URL Pattern**: `https://vantyx-poc-backend-staging-[branch-name].onrender.com`
- **Health Check Endpoint**: `/health`

## Processo di Deployment Automatico

### Trigger Deployment
Il deployment automatico avviene quando:
- Viene creato un nuovo branch da `master`
- Viene fatto push di commit su un branch esistente (non `master`)
- Il sistema di preview è abilitato (`previewsEnabled: true`)

### Branch Strategy
- **Production**: `master` → `vantyx-poc-backend`
- **Staging**: Tutti gli altri branch → `vantyx-poc-backend-staging` (preview environments)

### Lifecycle Preview Environments
- **Durata**: Le preview scadono automaticamente dopo **7 giorni** (`previewsExpireAfterDays: 7`)
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Runtime**: Node.js

## Isolamento da Produzione

### 1. Environment Variables
Staging e produzione utilizzano configurazioni separate:

| Variabile | Production | Staging |
|-----------|-----------|---------|
| `NODE_ENV` | `production` | `development` |
| `ENVIRONMENT` | `production` | `staging` |
| `OPENAI_API_KEY` | Chiave produzione | Chiave staging separata |
| `PRODUCTION_DOMAIN` / `STAGING_DOMAIN` | Domain produzione | Domain staging |
| `SENTRY_DSN` | DSN produzione | DSN staging separato |

### 2. Database Isolation
- **Production Database**: Database dedicato per l'ambiente di produzione
- **Staging Database**: Database separato per testing (se applicabile)
- **Nota**: Configurare variabili d'ambiente separate per connessioni database in Render dashboard

### 3. API Keys & Third-Party Services
Utilizzare credenziali separate per:
- **OpenAI API**: Chiave separata per staging (quota e monitoraggio indipendenti)
- **Sentry**: DSN separato per error tracking in staging
- **Analytics**: Configurazione separata o disabilitata in staging
- **Payment Gateways**: Utilizzare modalità sandbox/test in staging

### 4. CORS & Security
- Dominio staging configurato separatamente
- CSP policies appropriate per l'ambiente
- Rate limiting configurato con limiti più permissivi per testing

## Configurazione in Render

### Setup Variabili d'Ambiente
Per configurare l'ambiente staging in Render dashboard:

1. Navigate to **vantyx-poc-backend-staging** service
2. Go to **Environment** tab
3. Aggiungi le seguenti variabili:

```
NODE_ENV=development
ENVIRONMENT=staging
OPENAI_API_KEY=[staging-api-key]
STAGING_DOMAIN=[staging-domain-url]
SENTRY_DSN=[staging-sentry-dsn]
VITE_SENTRY_DSN=[staging-sentry-frontend-dsn]
```

### File di Configurazione
La configurazione è definita in `render.yaml`:
- Service name: `vantyx-poc-backend-staging`
- Preview enabled: `true`
- Auto-deploy su push a branch non-master
- Health check attivo su `/health`

## Workflow di Testing

### 1. Creare Feature Branch
```bash
git checkout -b feature/nuova-funzionalita
```

### 2. Push per Deploy Staging
```bash
git push origin feature/nuova-funzionalita
```

### 3. Accesso Preview Environment
- Render creerà automaticamente un preview environment
- URL disponibile nel Render dashboard sotto la sezione "Preview Environments"
- Health check verificherà che il servizio sia attivo

### 4. Testing in Staging
- Testare tutte le funzionalità usando API keys di staging
- Verificare integrazioni con servizi esterni (modalità test)
- Controllare logs in Sentry (ambiente staging)

### 5. Merge in Production
```bash
git checkout master
git merge feature/nuova-funzionalita
git push origin master
```

## Best Practices

### ✅ Da Fare
- Testare sempre in staging prima di mergiare in master
- Utilizzare API keys separate per staging
- Monitorare Sentry staging per errori
- Verificare health check endpoint prima del merge
- Documentare eventuali cambiamenti alle variabili d'ambiente

### ❌ Da Evitare
- Non utilizzare API keys di produzione in staging
- Non connettersi a database di produzione
- Non processare dati reali di utenti in staging
- Non disabilitare security features per comodità

## Monitoring & Debugging

### Logs
- Accedi ai logs tramite Render dashboard
- Filtro per severity level (error, warning, info)
- Real-time streaming durante deploy

### Health Checks
```bash
curl https://[staging-url]/health
```

Expected response:
```json
{
  "status": "healthy",
  "environment": "staging",
  "timestamp": "2025-10-07T..."
}
```

### Sentry Error Tracking
- Environment tag: `staging`
- Separato da produzione per analisi isolata
- Alert configurati per errori critici

## Troubleshooting

### Deploy Fallisce
1. Controllare logs di build in Render
2. Verificare `package.json` dependencies
3. Controllare variabili d'ambiente richieste

### Preview Non Si Crea
1. Verificare che `previewsEnabled: true` in `render.yaml`
2. Controllare che il branch non sia `master`
3. Verificare account Render limits

### Errori Runtime
1. Controllare Sentry staging environment
2. Verificare logs in Render dashboard
3. Testare health check endpoint

## Sicurezza

### Secrets Management
- Mai committare API keys in repository
- Utilizzare Render environment variables
- Rotazione periodica delle credenziali staging
- Accesso limitato al Render dashboard

### Data Protection
- No dati personali reali in staging
- Utilizzare dati di test anonimi
- GDPR compliance anche in staging
- Backup separati da produzione

## Contatti & Support
Per problemi con l'ambiente staging:
1. Controllare questa documentazione
2. Verificare logs in Render e Sentry
3. Consultare [Render Documentation](https://render.com/docs)
