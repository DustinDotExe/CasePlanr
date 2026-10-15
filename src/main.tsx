import {StrictMode, Suspense, lazy} from 'react';
import {createRoot} from 'react-dom/client';
import {BrowserRouter, Routes, Route} from 'react-router-dom';
import './index.css';

const LandingPage = lazy(() => import('./components/LandingPage.tsx'));
const PrivacyPolicy = lazy(() => import('./components/PrivacyPolicy.tsx'));
const TermsOfService = lazy(() => import('./components/TermsOfService.tsx'));
const ParticipantPortal = lazy(() => import('./components/ParticipantPortal.tsx'));
const App = lazy(() => import('./App.tsx'));

function RouteFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-slate-500 rounded-full animate-spin" />
        <p className="text-sm font-medium">Loading…</p>
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/p/:token" element={<ParticipantPortal />} />
          <Route path="*" element={<App />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  </StrictMode>,
);
