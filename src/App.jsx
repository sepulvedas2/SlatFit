import './App.css';
import { lazy, Suspense } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { queryClientInstance } from '@/lib/query-client';
import PasswordRecovery from '@/pages/PasswordRecovery';
import OpenRecoveryLink from '@/pages/OpenRecoveryLink';

// Recovery does not initialize the app session, billing requests, or Stripe.js.
const ProtectedApp = lazy(() => import('./ProtectedApp'));

export default function App() {
  return (
    <QueryClientProvider client={queryClientInstance}>
      <BrowserRouter>
        <Suspense fallback={<div role="status" aria-label="Carregando" className="min-h-screen bg-[#0B3936]" />}>
          <Routes>
            <Route path="/RecuperarSenha" element={<PasswordRecovery key="request" mode="request" />} />
            <Route path="/AbrirRecuperacao" element={<OpenRecoveryLink />} />
            <Route path="/RedefinirSenha" element={<PasswordRecovery key="reset" mode="reset" />} />
            <Route path="*" element={<ProtectedApp />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
      <Toaster />
    </QueryClientProvider>
  );
}
