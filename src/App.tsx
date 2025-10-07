import { BrowserRouter, Routes, Route, useSearchParams } from 'react-router-dom';
import { useEffect } from 'react';
import { initSentry } from './sentry';
import { useOffline } from './hooks/useOffline';
import { OfflineBanner } from './components/ui/OfflineBanner';

// Initialize Sentry
initSentry();

function MainContent() {
  const [searchParams] = useSearchParams();
  const { isOffline, wasOffline } = useOffline();

  const showModuli = searchParams.has('moduli');
  const showInvest = searchParams.has('invest');

  return (
    <>
      <OfflineBanner isOffline={isOffline} wasOffline={wasOffline} />
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold text-center mb-8">
            Vantyx.ai POC
          </h1>

          {showModuli && (
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
              <h2 className="text-2xl font-semibold mb-4">Moduli</h2>
              <p className="text-gray-600">Sezione Moduli attiva</p>
            </div>
          )}

          {showInvest && (
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
              <h2 className="text-2xl font-semibold mb-4">Invest</h2>
              <p className="text-gray-600">Sezione Invest attiva</p>
            </div>
          )}

          {!showModuli && !showInvest && (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <p className="text-gray-600 text-center">
                Aggiungi ?moduli o ?invest all'URL per visualizzare le sezioni
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainContent />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
