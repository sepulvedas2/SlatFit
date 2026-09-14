import { createClient } from '@supabase/supabase-js';

let client;
let callbackPromise;
let recoveryReady = false;

const invalidLinkMessage = 'Este link expirou, já foi usado ou foi aberto em outro navegador. Solicite um novo link.';

function getClient() {
  const url = import.meta.env.VITE_SUPABASE_URL?.trim();
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

async function exchangeRecoveryCode() {
  recoveryReady = false;
  const url = new URL(window.location.href);
  const hash = new URLSearchParams(url.hash.slice(1));
  try {
    if (url.searchParams.has('error') || hash.has('error') || !url.searchParams.get('code')) {
      throw new Error(invalidLinkMessage);
    }
    const { data, error } = await getClient().auth.exchangeCodeForSession(url.searchParams.get('code'));
    if (error || !data.session || data.redirectType !== 'recovery') throw new Error(invalidLinkMessage);
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
