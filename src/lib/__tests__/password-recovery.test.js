// @vitest-environment jsdom
import { beforeEach, afterEach, describe, it, expect, vi } from 'vitest';

const { createClient, auth } = vi.hoisted(() => {
  const auth = { resetPasswordForEmail: vi.fn(), exchangeCodeForSession: vi.fn(), updateUser: vi.fn(), signOut: vi.fn() };
  return { auth, createClient: vi.fn(() => ({ auth })) };
});
vi.mock('@supabase/supabase-js', () => ({ createClient }));

beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
  vi.stubEnv('VITE_SUPABASE_URL', 'https://example.supabase.co');
  vi.stubEnv('VITE_SUPABASE_PUBLISHABLE_KEY', 'sb_publishable_test');
  window.history.replaceState({}, '', '/RedefinirSenha?code=one-time-code');
  auth.resetPasswordForEmail.mockResolvedValue({ data: {}, error: null });
  auth.exchangeCodeForSession.mockResolvedValue({ data: { session: { user: { id: 'verified-user' } }, redirectType: 'recovery' }, error: null });
  auth.updateUser.mockResolvedValue({ data: {}, error: null });
  auth.signOut.mockResolvedValue({ error: null });
});
afterEach(() => vi.unstubAllEnvs());

describe('password recovery', () => {
  it('sends to Supabase with the current frontend origin and isolated PKCE storage', async () => {
    const { requestPasswordReset } = await import('../password-recovery');
    await requestPasswordReset(' test@example.com ');
    expect(auth.resetPasswordForEmail).toHaveBeenCalledWith('test@example.com', { redirectTo: `${window.location.origin}/RedefinirSenha` });
    expect(createClient.mock.calls[0][2].auth).toMatchObject({ flowType: 'pkce', storageKey: 'slatfit_password_recovery', detectSessionInUrl: false });
    expect(auth.updateUser).not.toHaveBeenCalled();
  });

  it('handles missing configuration and email rate limits without provider details', async () => {
    const { requestPasswordReset } = await import('../password-recovery');
    vi.stubEnv('VITE_SUPABASE_PUBLISHABLE_KEY', '');
    await expect(requestPasswordReset('test@example.com')).rejects.toThrow('indisponível');
    vi.stubEnv('VITE_SUPABASE_PUBLISHABLE_KEY', 'sb_publishable_test');
    auth.resetPasswordForEmail.mockResolvedValue({ error: { status: 429, message: 'provider details' } });
    await expect(requestPasswordReset('test@example.com')).rejects.toThrow('Muitas tentativas');
  });

  it('requires a verified recovery link before updating a password', async () => {
    const recovery = await import('../password-recovery');
    await expect(recovery.updateRecoveredPassword('new-password')).rejects.toThrow('Solicite um novo link');
    expect(auth.updateUser).not.toHaveBeenCalled();
  });

  it('consumes the code only once and does not leave it in browser history', async () => {
    const recovery = await import('../password-recovery');
    await Promise.all([recovery.validateRecoveryLink(), recovery.validateRecoveryLink()]);
    expect(auth.exchangeCodeForSession).toHaveBeenCalledOnce();
    expect(auth.exchangeCodeForSession).toHaveBeenCalledWith('one-time-code');
    expect(window.location.search).toBe('');
    await recovery.updateRecoveredPassword('new-password');
    expect(auth.updateUser).toHaveBeenCalledWith({ password: 'new-password' });
    expect(auth.signOut).toHaveBeenCalledWith({ scope: 'local' });
    await expect(recovery.updateRecoveredPassword('another-password')).rejects.toThrow('Solicite um novo link');
  });

  it.each([
    '/RedefinirSenha',
    '/RedefinirSenha?error=access_denied&error_description=untrusted',
    '/RedefinirSenha#access_token=forged&refresh_token=forged&type=recovery',
  ])('rejects missing or forged recovery links: %s', async (url) => {
    window.history.replaceState({}, '', url);
    const recovery = await import('../password-recovery');
    await expect(recovery.validateRecoveryLink()).rejects.toThrow('Solicite um novo link');
    expect(auth.exchangeCodeForSession).not.toHaveBeenCalled();
    expect(window.location.search + window.location.hash).toBe('');
  });

  it.each(['signup', null])('does not accept a non-recovery session: %s', async (redirectType) => {
    auth.exchangeCodeForSession.mockResolvedValue({ data: { session: { user: { id: 'user' } }, redirectType }, error: null });
    const recovery = await import('../password-recovery');
    await expect(recovery.validateRecoveryLink()).rejects.toThrow('Solicite um novo link');
    await expect(recovery.updateRecoveredPassword('new-password')).rejects.toThrow();
    expect(auth.updateUser).not.toHaveBeenCalled();
  });

  it('keeps the form retryable for weak passwords and reports saved passwords despite a cleanup network failure', async () => {
    const recovery = await import('../password-recovery');
    await recovery.validateRecoveryLink();
    await expect(recovery.updateRecoveredPassword('short')).rejects.toThrow('8 caracteres');
    expect(auth.updateUser).not.toHaveBeenCalled();
    auth.updateUser.mockResolvedValueOnce({ error: { code: 'weak_password' } });
    await expect(recovery.updateRecoveredPassword('new-password')).rejects.toThrow('mais forte');
    auth.signOut.mockRejectedValueOnce(new Error('Offline'));
    await expect(recovery.updateRecoveredPassword('better-password')).resolves.toBeUndefined();
  });
});
