// @vitest-environment jsdom
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { getStoredToken, getStoredUser, saveUser } from '@/components/auth';

const { createClient, auth } = vi.hoisted(() => {
  const auth = {
    signInWithOAuth: vi.fn(),
    exchangeCodeForSession: vi.fn(),
    getSession: vi.fn(),
    onAuthStateChange: vi.fn(),
    signOut: vi.fn(),
  };
  return { auth, createClient: vi.fn(() => ({ auth })) };
});
vi.mock('@supabase/supabase-js', () => ({ createClient }));

const session = { user: { id: 'google-user', email: 'test@example.com' }, access_token: 'supabase-token' };

beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
  vi.stubEnv('VITE_SUPABASE_URL', 'https://example.supabase.co');
  vi.stubEnv('VITE_SUPABASE_PUBLISHABLE_KEY', 'sb_publishable_test');
  const storage = new Map();
  vi.stubGlobal('localStorage', {
    getItem: (key) => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, value),
    removeItem: (key) => storage.delete(key),
  });
  window.history.replaceState({}, '', '/');
  auth.signInWithOAuth.mockResolvedValue({ error: null });
  auth.exchangeCodeForSession.mockResolvedValue({ data: { session }, error: null });
  auth.getSession.mockResolvedValue({ data: { session: null }, error: null });
  auth.signOut.mockResolvedValue({ error: null });
});
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

describe('Google OAuth session', () => {
  it('starts PKCE on the current frontend origin with no billing or identity claims', async () => {
    const { loginWithGoogle } = await import('../google-auth');
    await loginWithGoogle();
    expect(createClient).toHaveBeenCalledWith('https://example.supabase.co', 'sb_publishable_test', {
      auth: { flowType: 'pkce', detectSessionInUrl: false, persistSession: true, autoRefreshToken: true, storageKey: 'slatfit_google_auth' },
    });
    expect(auth.signInWithOAuth).toHaveBeenCalledWith({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/?auth_callback=google`, queryParams: { prompt: 'select_account' } },
    });
  });

  it('keeps password login usable without Google configuration', async () => {
    vi.stubEnv('VITE_SUPABASE_PUBLISHABLE_KEY', '');
    const google = await import('../google-auth');
    await google.restoreGoogleSession();
    await expect(google.loginWithGoogle()).rejects.toThrow('Use email e senha');
    expect(createClient).not.toHaveBeenCalled();
  });

  it('exchanges a callback only once and removes the code from history', async () => {
    window.history.replaceState({}, '', '/?auth_callback=google&code=single-use');
    const { restoreGoogleSession } = await import('../google-auth');
    await Promise.all([restoreGoogleSession(), restoreGoogleSession()]);
    expect(auth.exchangeCodeForSession).toHaveBeenCalledOnce();
    expect(auth.exchangeCodeForSession).toHaveBeenCalledWith('single-use');
    expect(getStoredToken()).toBe('supabase-token');
    expect(window.location.search).toBe('');

    auth.getSession.mockResolvedValue({ data: { session: { ...session, access_token: 'renewed-token' } }, error: null });
    await restoreGoogleSession();
    expect(getStoredToken()).toBe('renewed-token');
  });

  it('reports cancellation without exchanging codes or showing provider error contents', async () => {
    window.history.replaceState({}, '', '/?auth_callback=google#error=access_denied&error_description=private-details');
    const { restoreGoogleSession } = await import('../google-auth');
    await expect(restoreGoogleSession()).rejects.toThrow('Login com Google cancelado');
    expect(auth.exchangeCodeForSession).not.toHaveBeenCalled();
    expect(getStoredToken()).toBeNull();
    expect(window.location.hash).toBe('');
  });

  it('rejects invalid callback codes and does not trust URL access flags or tokens', async () => {
    window.history.replaceState({}, '', '/?auth_callback=google&code=invalid&hasAccess=true#access_token=forged');
    auth.exchangeCodeForSession.mockResolvedValue({ data: { session: null }, error: new Error('Invalid verifier') });
    const { restoreGoogleSession } = await import('../google-auth');
    await expect(restoreGoogleSession()).rejects.toThrow('expirou ou é inválido');
    expect(getStoredToken()).toBeNull();
  });

  it('does not consume Stripe return parameters as an OAuth callback', async () => {
    window.history.replaceState({}, '', '/Subscription?payment_intent=test&redirect_status=succeeded');
    const { restoreGoogleSession } = await import('../google-auth');
    await restoreGoogleSession();
    expect(auth.exchangeCodeForSession).not.toHaveBeenCalled();
    expect(window.location.search).toContain('payment_intent=test');
  });

  it('renews only the matching app session and propagates Google signout', async () => {
    let notify;
    const unsubscribe = vi.fn();
    auth.onAuthStateChange.mockImplementation((callback) => {
      notify = callback;
      return { data: { subscription: { unsubscribe } } };
    });
    const { watchGoogleSession } = await import('../google-auth');
    const onSignedOut = vi.fn();
    const stop = watchGoogleSession(onSignedOut);
    saveUser(session.user, session.access_token);
    notify('INITIAL_SESSION', session);
    notify('TOKEN_REFRESHED', { ...session, access_token: 'refreshed' });
    expect(getStoredToken()).toBe('refreshed');
    notify('SIGNED_OUT', null);
    expect(getStoredUser()).toBeNull();
    expect(onSignedOut).toHaveBeenCalledOnce();

    saveUser({ id: 'password-user' }, 'password-token');
    notify('TOKEN_REFRESHED', session);
    notify('SIGNED_OUT', null);
    expect(getStoredToken()).toBe('password-token');
    stop();
    expect(unsubscribe).toHaveBeenCalledOnce();
  });
});
