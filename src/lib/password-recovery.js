import { createClient } from '@supabase/supabase-js';

let client;
let callbackPromise;
let recoveryReady = false;

const invalidLinkMessage = 'Este link expirou, já foi usado ou foi aberto em outro navegador. Solicite um novo link.';
const usedOrPrefetchedMessage = 'Este link já foi usado (às vezes o provedor de email abre o link sozinho). Solicite um novo email e use o botão Continuar na página do SlatFit.';
const wrongBrowserMessage = 'Abra o link no mesmo navegador em que você pediu a recuperação. Solicite um novo email se mudou de aparelho ou janela anônima.';

/** Project root only — strip accidental /rest/v1 (PostgREST path) so Auth hits /auth/v1/*. */
function normalizeSupabaseUrl(raw) {
  const trimmed = raw?.trim();
  if (!trimmed) return '';
  try {
    const parsed = new URL(trimmed);
    parsed.pathname = parsed.pathname.replace(/\/rest\/v1\/?$/i, '').replace(/\/$/, '') || '';
    parsed.search = '';
    parsed.hash = '';
    return parsed.origin + (parsed.pathname === '/' ? '' : parsed.pathname);
  } catch {
    return trimmed.replace(/\/rest\/v1\/?$/i, '').replace(/\/$/, '');
  }
}

function getClient() {
  const url = normalizeSupabaseUrl(import.meta.env.VITE_SUPABASE_URL);
  const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();
  if (!url || !key) throw new Error('A recuperação de senha está indisponível no momento. Tente novamente mais tarde.');

  client ??= createClient(url, key, {
    auth: {
      flowType: 'pkce',
      detectSessionInUrl: false,
      autoRefreshToken: false,
      persistSession: true,
      storageKey: 'slatfit_password_recovery',
    },
  });
  return client;
}

export async function requestPasswordReset(email) {
  recoveryReady = false;
  callbackPromise = undefined;
  const { error } = await getClient().auth.resetPasswordForEmail(email.trim(), {
    redirectTo: new URL('/RedefinirSenha', window.location.origin).href,
  });
  if (error?.status === 429) throw new Error('Muitas tentativas. Aguarde alguns minutos antes de solicitar outro email.');
  if (error) throw new Error('Não foi possível enviar o email agora. Tente novamente mais tarde.');
}

function mapExchangeError(error) {
  const code = error?.code || '';
  const message = (error?.message || '').toLowerCase();
  if (code === 'pkce_code_verifier_not_found' || message.includes('code verifier')) return wrongBrowserMessage;
  if (
    code === 'otp_expired'
    || code === 'flow_state_expired'
    || code === 'flow_state_not_found'
    || message.includes('expired')
    || message.includes('already been used')
    || message.includes('invalid')
  ) {
    return usedOrPrefetchedMessage;
  }
  return invalidLinkMessage;
}

async function exchangeRecoveryCode() {
  recoveryReady = false;
  const url = new URL(window.location.href);
  const hash = new URLSearchParams(url.hash.slice(1));
  try {
    if (url.searchParams.has('error') || hash.has('error') || !url.searchParams.get('code')) {
      throw new Error(usedOrPrefetchedMessage);
    }
    const { data, error } = await getClient().auth.exchangeCodeForSession(url.searchParams.get('code'));
    if (error) throw new Error(mapExchangeError(error));
    if (!data.session || data.redirectType !== 'recovery') throw new Error(invalidLinkMessage);
    recoveryReady = true;
  } finally {
    window.history.replaceState(window.history.state, '', '/RedefinirSenha');
  }
}

export function validateRecoveryLink() {
  // A one-time code may be consumed only once, including during React remounts.
  callbackPromise ??= exchangeRecoveryCode();
  return callbackPromise;
}

export async function updateRecoveredPassword(password) {
  if (!recoveryReady) throw new Error(invalidLinkMessage);
  if (password.length < 8) throw new Error('A senha deve ter pelo menos 8 caracteres.');

  const { error } = await getClient().auth.updateUser({ password });
  if (error?.code === 'same_password') throw new Error('Escolha uma senha diferente da anterior.');
  if (error?.code === 'weak_password') throw new Error('Escolha uma senha mais forte, com letras, números e símbolos.');
  if (error?.status === 401 || error?.status === 403) {
    recoveryReady = false;
    throw new Error(invalidLinkMessage);
  }
  if (error) throw new Error('Não foi possível atualizar a senha. Tente novamente.');

  recoveryReady = false;
  callbackPromise = undefined;
  // Password update succeeded even if the cleanup request loses connectivity.
  await client.auth.signOut({ scope: 'local' }).catch(() => {});
}
