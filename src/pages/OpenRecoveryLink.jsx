import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Loader2 } from 'lucide-react';

const buttonClass = 'flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#E3EF26] px-4 py-3 text-sm font-semibold text-[#080626] hover:bg-[#d6e21c] disabled:cursor-not-allowed disabled:opacity-60';

/** Only allow navigating to Supabase Auth verify URLs (blocks open redirects). */
export function parseRecoveryVerifyUrl(hash) {
  const raw = (hash || '').replace(/^#/, '').trim();
  if (!raw) return null;
  try {
    const url = new URL(raw);
    if (url.protocol !== 'https:') return null;
    if (!url.hostname.endsWith('.supabase.co')) return null;
    if (!url.pathname.includes('/auth/v1/verify')) return null;
    return url.href;
  } catch {
    return null;
  }
}

/**
 * Email scanners often prefetch {{ .ConfirmationURL }} and burn the one-time token.
 * The email should link here with the verify URL in the hash; only a real click continues.
 */
export default function OpenRecoveryLink() {
  const verifyUrl = useMemo(() => parseRecoveryVerifyUrl(window.location.hash), []);
  const [leaving, setLeaving] = useState(false);

  function continueToSupabase() {
    if (!verifyUrl || leaving) return;
    setLeaving(true);
    window.location.assign(verifyUrl);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0F1C1B] px-4 py-8">
      <div className="w-full max-w-md rounded-2xl bg-white px-5 py-9 shadow-xl sm:px-8">
        <Link to="/" className="mb-8 block text-center text-3xl font-extrabold text-gray-950">SlatFit</Link>
        <h1 className="text-2xl font-bold text-gray-900">Continuar redefinição</h1>
        {!verifyUrl ? (
          <>
            <p role="alert" className="mt-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              Este link está incompleto ou inválido. Solicite um novo email de recuperação e abra-o neste mesmo navegador.
            </p>
            <Link to="/RecuperarSenha" className={`${buttonClass} mt-6`}>Solicitar novo link</Link>
          </>
        ) : (
          <>
            <p className="mt-4 text-sm text-gray-700">
              Por segurança, confirme abaixo para abrir o link do Supabase. Isso evita que o email “gaste” o link antes de você clicar.
            </p>
            <p className="mt-2 text-sm text-gray-600">
              Use o mesmo navegador em que você pediu a recuperação de senha.
            </p>
            <button type="button" onClick={continueToSupabase} disabled={leaving} className={`${buttonClass} mt-6`}>
              {leaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <ExternalLink className="h-4 w-4" />}
              {leaving ? 'Abrindo...' : 'Continuar para redefinir senha'}
            </button>
          </>
        )}
        <Link to="/" className="mt-7 flex items-center justify-center gap-2 text-sm font-medium text-[#0B3936] hover:underline">
          <ArrowLeft className="h-4 w-4" /> Voltar para entrar
        </Link>
      </div>
    </main>
  );
}
