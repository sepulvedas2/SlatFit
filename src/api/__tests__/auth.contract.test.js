import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/components/auth', () => ({
  getStoredToken: () => 'test-token',
  saveUser: vi.fn(),
  clearUser: vi.fn(),
  getStoredUser: vi.fn(),
}));

import { api } from '../client';
import { API_BASE } from '../transport';
import * as authStore from '@/components/auth';

function jsonResponse(body, { ok = true, status = 200 } = {}) {
  return { ok, status, statusText: ok ? 'OK' : 'Error', json: async () => body };
}

beforeEach(() => {
  authStore.saveUser.mockClear();
  authStore.clearUser.mockClear();
});

describe('api.auth contract', () => {
  it('me() GETs /auth/me with bearer, returns user, refreshes stored user', async () => {
    const user = { id: '1', email: 'a@b.c', role: 'authenticated', lastSignInAt: null };
    global.fetch = vi.fn(async () => jsonResponse({ user }));

    const result = await api.auth.me();

    const [url, opts] = global.fetch.mock.calls[0];
    expect(url).toBe(`${API_BASE}/auth/me`);
    expect(opts.method).toBe('GET');
    expect(opts.headers.Authorization).toBe('Bearer test-token');
    expect(result).toEqual(user);
    expect(authStore.saveUser).toHaveBeenCalledWith(user, 'test-token');
  });

  it('me() throws when no user is returned', async () => {
    global.fetch = vi.fn(async () => jsonResponse({}));
    await expect(api.auth.me()).rejects.toThrow('Not authenticated');
  });

  it('login() invokes supabaseAuth with action=login and stores { user, token }', async () => {
    const user = { id: '1', email: 'a@b.c' };
    global.fetch = vi.fn(async () => jsonResponse({ user, token: 'tok-123' }));

    const result = await api.auth.login('a@b.c', 'secret');

    const [url, opts] = global.fetch.mock.calls[0];
    expect(url).toBe(`${API_BASE}/functions/supabaseAuth`);
    expect(JSON.parse(opts.body)).toEqual({ action: 'login', email: 'a@b.c', password: 'secret' });
    expect(authStore.saveUser).toHaveBeenCalledWith(user, 'tok-123');
    expect(result).toEqual(user);
  });

  it('register() invokes supabaseAuth with action=register and a default full_name', async () => {
    const user = { id: '2', email: 'new@b.c' };
    global.fetch = vi.fn(async () => jsonResponse({ user, token: 'tok-2' }));

    await api.auth.register('new@b.c', 'secret');

    const [, opts] = global.fetch.mock.calls[0];
    expect(JSON.parse(opts.body)).toEqual({
      action: 'register',
      email: 'new@b.c',
      password: 'secret',
      full_name: 'new',
    });
  });

  it('login() throws when the function returns an { error }', async () => {
    global.fetch = vi.fn(async () => jsonResponse({ error: 'Invalid credentials' }));
    await expect(api.auth.login('a@b.c', 'bad')).rejects.toThrow('Invalid credentials');
    expect(authStore.saveUser).not.toHaveBeenCalled();
  });

  it('logout() clears the stored session', () => {
    api.auth.logout();
    expect(authStore.clearUser).toHaveBeenCalledTimes(1);
  });
});
