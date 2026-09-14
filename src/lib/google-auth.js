import { createClient } from '@supabase/supabase-js';
import { clearUser, getStoredUser, saveUser } from '@/components/auth';

let client;
let callbackPromise;

function getClient() {
  const url = import.meta.env.VITE_SUPABASE_URL?.trim();
  const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();
  if (!url || !key) return null;

  client ??= createClient(url, key, {
    auth: {
      flowType: 'pkce',
      detectSessionInUrl: false,
      persistSession: true,
      autoRefreshToken: true,
      storageKey: 'slatfit_google_auth',
    },
  });
  return client;
}

export async function loginWithGoogle() {
  const supabase = getClient();
  if (!supabase) {
    throw new Error('O login com Google ainda não está disponível. Use email e senha.');
  }

  callbackPromise = undefined;
  const redirectTo = new URL('/', window.location.origin);
  redirectTo.searchParams.set('auth_callback', 'google');
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectTo.href,
      queryParams: { prompt: 'select_account' },
    },
  });
  if (error) throw new Error('Não foi possível iniciar o login com Google. Tente novamente.');
}

async function finishCallback(url) {
  try {
    const hash = new URLSearchParams(url.hash.slice(1));
    const error = url.searchParams.get('error') || hash.get('error');
    if (error === 'access_denied') {
      throw new Error('Login com Google cancelado. Você pode tentar novamente.');
    }
    if (error) throw new Error('Não foi possível entrar com Google. Tente novamente.');

    const code = url.searchParams.get('code');
    const supabase = getClient();
    if (!code || !supabase) {
      throw new Error('O login com Google não foi concluído. Tente novamente.');
    }

    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    if (exchangeError || !data.session) {
      throw new Error('O login com Google expirou ou é inválido. Tente novamente neste navegador.');
    }
    return data.session;
  } finally {
    // Keep one-time OAuth codes and provider errors out of browser history.
    window.history.replaceState(window.history.state, '', '/');
  }
}

export async function restoreGoogleSession() {
  const url = new URL(window.location.href);
  let session;
  if (url.searchParams.get('auth_callback') === 'google' || callbackPromise) {
    // React can initialize twice; a PKCE authorization code can only be used once.
    callbackPromise ??= finishCallback(url).finally(() => { callbackPromise = undefined; });
    session = await callbackPromise;
  } else {
    const supabase = getClient();
    if (!supabase) return;
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    session = data.session;
  }

  if (session) saveUser(session.user, session.access_token);
}

export function watchGoogleSession(onSignedOut) {
  const supabase = getClient();
  if (!supabase) return () => {};
  let googleUserId;
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    const stored = getStoredUser();
    if (event === 'TOKEN_REFRESHED' && session?.user.id === stored?.id) {
      saveUser(stored, session.access_token);
    }
    if (event === 'SIGNED_OUT' && googleUserId && stored?.id === googleUserId) {
      clearUser();
      onSignedOut();
    }
    if (session) googleUserId = session.user.id;
  });
  return () => subscription.unsubscribe();
}

export async function signOutGoogle() {
  callbackPromise = undefined;
  if (!client) return;
  const { error } = await client.auth.signOut({ scope: 'local' });
  if (error) throw new Error('Não foi possível encerrar a sessão. Tente novamente.');
}
