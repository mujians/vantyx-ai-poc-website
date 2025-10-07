# E2E Testing Checklist

Questa checklist documenta l'intero flusso di end-to-end testing per il sito web Vantyx.ai POC.

## Pre-Test Setup

- [ ] Ambiente staging attivo su Render
- [ ] Variabili d'ambiente configurate correttamente
- [ ] Browser compatibili installati (Chrome, Firefox, Safari, Edge)
- [ ] Playwright configurato e dipendenze installate
- [ ] File `.env` presente con configurazioni di test

## 1. Chatbot Testing

### 1.1 Apertura e Chiusura
- [ ] Il chatbot si apre cliccando sul pulsante "Chat with AI"
- [ ] Il chatbot si chiude cliccando sul pulsante di chiusura (X)
- [ ] Il chatbot si chiude cliccando fuori dall'area del chatbot
- [ ] L'animazione di apertura/chiusura funziona correttamente

### 1.2 Interfaccia Chatbot
- [ ] Il placeholder del campo di input è visibile
- [ ] Il pulsante di invio è presente e cliccabile
- [ ] Il pulsante di input vocale è presente
- [ ] L'area messaggi è scrollabile
- [ ] I messaggi dell'utente sono allineati a destra
- [ ] I messaggi dell'AI sono allineati a sinistra

### 1.3 Invio Messaggi
- [ ] Il messaggio viene inviato premendo Enter
- [ ] Il messaggio viene inviato cliccando sul pulsante di invio
- [ ] Il campo di input si svuota dopo l'invio
- [ ] Il messaggio appare nell'area chat
- [ ] La risposta dell'AI viene visualizzata
- [ ] Il pulsante di invio è disabilitato durante l'elaborazione

### 1.4 Validazione Input
- [ ] Non è possibile inviare messaggi vuoti
- [ ] Gli spazi bianchi vengono rimossi prima dell'invio
- [ ] I caratteri speciali vengono gestiti correttamente (XSS protection)
- [ ] I messaggi lunghi vanno a capo correttamente

### 1.5 Cronologia Conversazione
- [ ] I messaggi precedenti rimangono visibili
- [ ] Lo scroll automatico porta all'ultimo messaggio
- [ ] La cronologia persiste durante la sessione
- [ ] La cronologia viene preservata quando si riapre il chatbot

## 2. Finestre/Modali Testing

### 2.1 Apertura Finestre
- [ ] Le finestre si aprono cliccando sui link appropriati
- [ ] Le finestre hanno titoli corretti
- [ ] Le finestre hanno contenuto appropriato
- [ ] L'animazione di apertura funziona correttamente

### 2.2 Chiusura Finestre
- [ ] Le finestre si chiudono cliccando sul pulsante di chiusura (X)
- [ ] Le finestre si chiudono cliccando sul backdrop/overlay
- [ ] Le finestre si chiudono premendo ESC
- [ ] L'animazione di chiusura funziona correttamente

### 2.3 Gestione Multiple Finestre
- [ ] È possibile aprire più finestre contemporaneamente (se supportato)
- [ ] Le finestre si sovrappongono correttamente (z-index)
- [ ] La finestra attiva è in primo piano
- [ ] La chiusura di una finestra non influenza le altre

### 2.4 Responsive Behavior
- [ ] Le finestre si adattano alle dimensioni dello schermo
- [ ] Le finestre sono scrollabili su schermi piccoli
- [ ] Il contenuto è leggibile su dispositivi mobili

## 3. Input Vocale Testing

### 3.1 Attivazione Input Vocale
- [ ] Il pulsante microfono è visibile
- [ ] Il pulsante microfono cambia stato quando attivato
- [ ] Appare un indicatore visivo durante la registrazione
- [ ] Il browser richiede il permesso per il microfono (prima volta)

### 3.2 Registrazione Audio
- [ ] La registrazione inizia cliccando sul pulsante microfono
- [ ] La registrazione si ferma cliccando nuovamente
- [ ] L'audio viene trascritto correttamente
- [ ] Il testo trascritto appare nel campo di input

### 3.3 Gestione Errori
- [ ] Errore quando il permesso microfono è negato
- [ ] Messaggio di errore appropriato se il microfono non è disponibile
- [ ] Gestione corretta su browser che non supportano Web Speech API
- [ ] Fallback appropriato se la trascrizione fallisce

### 3.4 Integrazioni
- [ ] Il testo trascritto può essere modificato prima dell'invio
- [ ] Il testo trascritto può essere inviato premendo Enter
- [ ] L'input vocale funziona con il chatbot
- [ ] L'input vocale funziona con altri campi di input (se applicabile)

## 4. Microprompt Testing

### 4.1 Visualizzazione Microprompts
- [ ] I microprompts sono visibili nell'interfaccia
- [ ] I microprompts hanno testo appropriato
- [ ] I microprompts hanno styling corretto
- [ ] I microprompts sono cliccabili

### 4.2 Interazione Microprompts
- [ ] Cliccando su un microprompt si popola il campo di input
- [ ] Il testo del microprompt viene inviato automaticamente (se configurato)
- [ ] I microprompts scompaiono dopo l'utilizzo (se configurato)
- [ ] Nuovi microprompts appaiono basati sul contesto

### 4.3 Microprompts Contestuali
- [ ] I microprompts cambiano in base alla pagina corrente
- [ ] I microprompts cambiano in base alla conversazione
- [ ] I microprompts sono rilevanti per l'utente
- [ ] I microprompts sono in lingua italiana

### 4.4 Analytics Microprompts
- [ ] Il click sui microprompts viene tracciato
- [ ] I dati analytics sono inviati a Plausible
- [ ] Gli eventi includono il testo del microprompt
- [ ] Gli eventi includono il contesto (pagina, sezione)

## 5. URL Routing Testing

### 5.1 Navigazione Base
- [ ] La homepage (`/`) carica correttamente
- [ ] Le pagine interne caricano correttamente
- [ ] I link di navigazione funzionano
- [ ] Il pulsante "back" del browser funziona

### 5.2 Gestione Parametri URL
- [ ] I parametri query string sono preservati
- [ ] Gli hash fragment funzionano correttamente
- [ ] I parametri vengono passati tra le pagine
- [ ] I parametri influenzano il contenuto della pagina

### 5.3 Gestione Errori 404
- [ ] Le URL non esistenti mostrano una pagina 404
- [ ] La pagina 404 ha un messaggio appropriato
- [ ] La pagina 404 ha link per tornare alla homepage
- [ ] Il codice di stato HTTP è 404

### 5.4 Deep Linking
- [ ] È possibile condividere URL dirette a sezioni specifiche
- [ ] Le URL con hash portano alla sezione corretta
- [ ] Le URL condivise aprono la pagina corretta
- [ ] Lo stato dell'applicazione si riflette nell'URL

### 5.5 SEO e Meta Tags
- [ ] Ogni pagina ha un title appropriato
- [ ] Ogni pagina ha meta description appropriata
- [ ] Le meta tags Open Graph sono presenti
- [ ] Le meta tags Twitter Card sono presenti

## 6. Cross-Browser Testing

### 6.1 Chrome
- [ ] Tutte le funzionalità funzionano su Chrome desktop
- [ ] Tutte le funzionalità funzionano su Chrome mobile
- [ ] Il rendering è corretto
- [ ] Le performance sono accettabili

### 6.2 Firefox
- [ ] Tutte le funzionalità funzionano su Firefox desktop
- [ ] Tutte le funzionalità funzionano su Firefox mobile
- [ ] Il rendering è corretto
- [ ] Le performance sono accettabili

### 6.3 Safari
- [ ] Tutte le funzionalità funzionano su Safari desktop
- [ ] Tutte le funzionalità funzionano su Safari mobile (iOS)
- [ ] Il rendering è corretto
- [ ] Le performance sono accettabili

### 6.4 Edge
- [ ] Tutte le funzionalità funzionano su Edge desktop
- [ ] Il rendering è corretto
- [ ] Le performance sono accettabili

## 7. Responsive Testing

### 7.1 Desktop (>1024px)
- [ ] Layout a più colonne funziona correttamente
- [ ] Gli elementi sono ben spaziati
- [ ] Il chatbot si posiziona correttamente
- [ ] Le finestre modali sono centrate

### 7.2 Tablet (768px - 1024px)
- [ ] Il layout si adatta correttamente
- [ ] Il menu di navigazione è accessibile
- [ ] Il chatbot è utilizzabile
- [ ] Le finestre modali sono leggibili

### 7.3 Mobile (< 768px)
- [ ] Il layout è single-column
- [ ] Il menu hamburger funziona (se presente)
- [ ] Il chatbot occupa l'intera schermata quando aperto
- [ ] Le finestre modali sono fullscreen
- [ ] Gli elementi touch sono sufficientemente grandi (min 44x44px)

## 8. Performance Testing

### 8.1 Tempi di Caricamento
- [ ] La homepage carica in < 3 secondi
- [ ] Le pagine interne caricano in < 2 secondi
- [ ] Le risposte del chatbot arrivano in < 5 secondi
- [ ] Le transizioni/animazioni sono fluide (60fps)

### 8.2 Ottimizzazione Risorse
- [ ] Le immagini sono ottimizzate
- [ ] I file CSS sono minificati
- [ ] I file JavaScript sono minificati
- [ ] Le risorse statiche hanno cache headers appropriati

### 8.3 Lighthouse Scores
- [ ] Performance score > 90
- [ ] Accessibility score > 90
- [ ] Best Practices score > 90
- [ ] SEO score > 90

## 9. Accessibility Testing

### 9.1 Keyboard Navigation
- [ ] Tutti gli elementi interattivi sono accessibili via tastiera
- [ ] L'ordine di tab è logico
- [ ] Il focus è sempre visibile
- [ ] È possibile chiudere modali/chatbot con ESC

### 9.2 Screen Reader
- [ ] I link hanno testi descrittivi
- [ ] Le immagini hanno alt text appropriati
- [ ] Gli heading sono in ordine gerarchico
- [ ] Gli elementi ARIA sono utilizzati correttamente

### 9.3 Contrasto e Leggibilità
- [ ] Il contrasto testo/sfondo è sufficiente (WCAG AA)
- [ ] Il testo è leggibile su tutti i dispositivi
- [ ] I pulsanti hanno dimensioni minime appropriate
- [ ] Gli stati hover/focus sono visibili

## 10. Security Testing

### 10.1 XSS Protection
- [ ] Gli input utente sono sanitizzati
- [ ] Il contenuto HTML viene escaped
- [ ] Gli script inline non vengono eseguiti
- [ ] La CSP (Content Security Policy) è attiva

### 10.2 HTTPS
- [ ] Tutte le connessioni usano HTTPS
- [ ] I certificati SSL sono validi
- [ ] Non ci sono risorse caricate via HTTP (mixed content)

### 10.3 Privacy e GDPR
- [ ] Il cookie banner appare al primo accesso
- [ ] Il consenso viene registrato correttamente
- [ ] L'analytics è disabilitato senza consenso
- [ ] La privacy policy è accessibile

## 11. Error Handling

### 11.1 Network Errors
- [ ] Messaggio appropriato se l'API non risponde
- [ ] Messaggio appropriato se la connessione cade
- [ ] Possibilità di ritentare in caso di errore
- [ ] Gli errori non bloccano l'intera applicazione

### 11.2 Client Errors
- [ ] Gli errori JavaScript vengono catturati
- [ ] Gli errori sono loggati (Sentry)
- [ ] L'utente vede messaggi di errore user-friendly
- [ ] La pagina non va in crash

### 11.3 Fallback e Resilienza
- [ ] Funzionamento degradato se alcune funzionalità non sono disponibili
- [ ] Messaggi informativi invece di errori tecnici
- [ ] Possibilità di continuare a usare l'app dopo un errore

## 12. Integration Testing

### 12.1 OpenAI API
- [ ] Le chiamate API funzionano correttamente
- [ ] I rate limits sono gestiti
- [ ] Gli errori API sono gestiti
- [ ] Le risposte sono formattate correttamente

### 12.2 Plausible Analytics
- [ ] Gli eventi pageview sono tracciati
- [ ] Gli eventi custom sono tracciati
- [ ] I dati appaiono nella dashboard Plausible
- [ ] Il tracking rispetta il consenso GDPR

### 12.3 Sentry Error Tracking
- [ ] Gli errori vengono inviati a Sentry
- [ ] Gli errori includono context appropriato
- [ ] Gli errori sono raggruppati correttamente
- [ ] Le source maps funzionano

## Post-Test Actions

- [ ] Documentare i bug trovati
- [ ] Creare issue per i problemi critici
- [ ] Aggiornare i test automatici basati sui risultati
- [ ] Comunicare lo stato dei test al team
- [ ] Aggiornare la documentazione se necessario

## Test Automation Status

### Smoke Tests (Playwright)
- [ ] Homepage loading
- [ ] Chatbot interaction
- [ ] Navigation
- [ ] Responsive behavior

### Integration Tests
- [ ] API calls
- [ ] Database interactions (se applicabile)
- [ ] Third-party services

### Visual Regression Tests
- [ ] Screenshot comparison
- [ ] Layout verification

## Notes

- Eseguire questa checklist prima di ogni deployment in produzione
- Testare su ambiente staging prima di produzione
- Documentare eventuali deviazioni o problemi noti
- Aggiornare la checklist basandosi sui risultati dei test
