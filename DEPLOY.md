# Deploy Backend - Vantyx POC

Questa guida documenta il processo di deploy del backend Express.js su Render.

## Prerequisiti

- Account Render (https://render.com)
- Chiave API OpenAI
- Repository Git connesso a Render

## Opzione 1: Deploy su Render (Consigliato)

### 1. Configurazione Render

Il progetto include un file `render.yaml` pre-configurato che automatizza il deploy:

```yaml
services:
  - type: web
    name: vantyx-poc-backend
    runtime: node
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
      - key: OPENAI_API_KEY
        sync: false
      - key: PRODUCTION_DOMAIN
        sync: false
    healthCheckPath: /health
```

### 2. Steps di Deploy

1. **Crea un nuovo Web Service su Render**
   - Vai su https://dashboard.render.com
   - Clicca "New +" → "Web Service"
   - Connetti il tuo repository Git

2. **Configura il servizio**
   - Nome: `vantyx-poc-backend`
   - Runtime: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Branch: `master` (o il tuo branch principale)

3. **Configura le variabili d'ambiente**

   Vai su "Environment" e aggiungi:

   | Variabile | Valore | Descrizione |
   |-----------|--------|-------------|
   | `NODE_ENV` | `production` | Ambiente di esecuzione |
   | `PORT` | `10000` | Porta del server (Render default) |
   | `OPENAI_API_KEY` | `sk-...` | La tua chiave API OpenAI |
   | `PRODUCTION_DOMAIN` | `https://yourdomain.com` | Il dominio del tuo frontend |

4. **Deploy**
   - Clicca "Create Web Service"
   - Render inizierà automaticamente il build e il deploy
   - Il processo richiede circa 2-5 minuti

### 3. Verifica il Deploy

Una volta completato il deploy:

1. **Health Check**
   ```bash
   curl https://your-service.onrender.com/health
   ```

   Risposta attesa:
   ```json
   {
     "status": "ok",
     "timestamp": "2025-10-07T..."
   }
   ```

2. **Test Chat Endpoint**
   ```bash
   curl -X POST https://your-service.onrender.com/api/chat \
     -H "Content-Type: application/json" \
     -d '{
       "messages": [{"role": "user", "content": "Hello"}],
       "model": "gpt-3.5-turbo"
     }'
   ```

### 4. Configurazione CORS

Il backend è configurato per accettare richieste da:
- `http://localhost:5173` (sviluppo locale)
- Il dominio specificato in `PRODUCTION_DOMAIN`

Assicurati di impostare correttamente `PRODUCTION_DOMAIN` con l'URL del tuo frontend in produzione.

## Opzione 2: Deploy su Vercel

### 1. Installazione Vercel CLI

```bash
npm install -g vercel
```

### 2. Crea vercel.json

Crea un file `vercel.json` nella root del progetto:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "server.js"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

### 3. Deploy

```bash
vercel --prod
```

### 4. Configura le variabili d'ambiente

Tramite dashboard Vercel o CLI:

```bash
vercel env add OPENAI_API_KEY
vercel env add PRODUCTION_DOMAIN
```

## Monitoraggio e Manutenzione

### Logs

**Su Render:**
- Vai su Dashboard → Service → Logs
- I logs sono disponibili in tempo reale

**Su Vercel:**
```bash
vercel logs [deployment-url]
```

### Metriche

Entrambe le piattaforme forniscono:
- Uptime monitoring
- Response time
- Memory usage
- CPU usage

### Rate Limiting

Il backend ha un rate limit di **20 richieste per ora per IP** sull'endpoint `/api/chat`.

Se necessiti di aumentare il limite, modifica `server.js:41-47`:

```javascript
const limiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // aumenta a 50 richieste
  // ...
});
```

## Sicurezza

### Variabili d'ambiente sensibili

**MAI committare nel repository:**
- `OPENAI_API_KEY`
- Altre chiavi API
- Secrets

Le variabili d'ambiente sono gestite direttamente su Render/Vercel.

### HTTPS

Entrambe le piattaforme forniscono automaticamente certificati SSL/TLS.

### Headers di sicurezza

Considera di aggiungere headers di sicurezza in `server.js`:

```javascript
import helmet from 'helmet';
app.use(helmet());
```

## Troubleshooting

### Errore: "Not allowed by CORS"

Verifica che `PRODUCTION_DOMAIN` sia configurato correttamente e includa il protocollo (`https://`).

### Errore: "Authentication error - Invalid API key"

Controlla che `OPENAI_API_KEY` sia impostata correttamente nelle variabili d'ambiente.

### Il servizio non risponde

1. Verifica i logs per errori
2. Controlla l'health check: `/health`
3. Verifica che tutte le variabili d'ambiente siano configurate

### Rate limit troppo basso

Modifica la configurazione in `server.js` e rideploya.

## Costi

### Render
- Free tier: disponibile con limitazioni (servizio si addormenta dopo inattività)
- Starter: $7/mese per 1 servizio sempre attivo

### Vercel
- Hobby: gratis con limitazioni
- Pro: $20/mese con maggiori limiti

## Aggiornamenti

Per deployare nuove versioni:

**Render:**
- Push su Git → deploy automatico

**Vercel:**
```bash
vercel --prod
```

## URL del servizio

Dopo il deploy, il tuo backend sarà disponibile a:

- **Render**: `https://vantyx-poc-backend.onrender.com`
- **Vercel**: `https://your-project.vercel.app`

Usa questo URL come `VITE_API_BASE_URL` nel frontend.
