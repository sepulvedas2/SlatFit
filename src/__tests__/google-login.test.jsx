// @vitest-environment jsdom
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { beforeAll, beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { queryClientInstance } from '@/lib/query-client';

const { auth } = vi.hoisted(() => ({ auth: {
  getSession: vi.fn(), exchangeCodeForSession: vi.fn(),
  onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
  signInWithOAuth: vi.fn(), signOut: vi.fn(),
} }));
vi.mock('@supabase/supabase-js', () => ({ createClient: () => ({ auth }) }));
vi.mock('@/lib/VisualEditAgent', () => ({ default: () => null }));
vi.mock('@/Layout', () => ({ default: ({ children }) => <>{children}</> }));

let App;
let root;
let container;
const session = { user: { id: 'google-id', email: 'google@example.com' }, access_token: 'google-session-token' };
const response = (data, status = 200) => ({ ok: status === 200, status, json: async () => data });

beforeAll(async () => {
  for (const name of ['Dashboard', 'Subscription', 'FoodScanner', 'Habits', 'Learning', 'MealPlans', 'Progresso', 'SmartNutrition', 'WorkoutProgress', 'Workouts', 'Profile', 'AdminSetup']) {
    vi.doMock(`@/pages/${name}`, () => ({ default: () => <div data-page={name}>{name}</div> }));
  }
  App = (await import('../App')).default;
});

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  const storage = new Map();
  vi.stubGlobal('localStorage', {
    getItem: (key) => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, value),
    removeItem: (key) => storage.delete(key),
  });
  vi.stubEnv('DEV', false);
  vi.stubEnv('VITE_SUPABASE_URL', 'https://example.supabase.co');
  vi.stubEnv('VITE_SUPABASE_PUBLISHABLE_KEY', 'sb_publishable_test');
  window.history.replaceState({}, '', '/?auth_callback=google&code=google-code');
  auth.exchangeCodeForSession.mockResolvedValue({ data: { session }, error: null });
  auth.getSession.mockResolvedValue({ data: { session }, error: null });
  queryClientInstance.clear();
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
});

afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
  queryClientInstance.clear();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

async function render() {
  await act(async () => root.render(<App />));
  await act(async () => { await new Promise((resolve) => setTimeout(resolve, 20)); });
}

describe('Google login through the real auth and billing route guard', () => {
  it.each([true, false])('routes by confirmed backend access: %s', async (hasAccess) => {
    vi.stubGlobal('fetch', vi.fn(async (url, options) => {
      expect(options.headers.Authorization).toBe('Bearer google-session-token');
      if (url.endsWith('/auth/me')) return response({ user: session.user });
      if (url.endsWith('/billing/subscription')) return response({ subscription: { hasAccess } });
      throw new Error(`Unexpected request: ${url}`);
    }));
    await render();
    expect(window.location.pathname).toBe(hasAccess ? '/Dashboard' : '/Subscription');
    expect(container.querySelector('[data-page]')?.dataset.page).toBe(hasAccess ? 'Dashboard' : 'Subscription');
  });

  it('does not grant dashboard access when billing cannot be confirmed', async () => {
    vi.stubGlobal('fetch', vi.fn(async (url) => url.endsWith('/auth/me')
      ? response({ user: session.user })
      : response({ error: 'Unavailable' }, 503)));
    await render();
    expect(window.location.pathname).toBe('/Subscription');
    expect(container.querySelector('[data-page="Dashboard"]')).toBeNull();
  });

  it('does not treat a Google callback as authenticated when the backend rejects its session', async () => {
    const fetch = vi.fn(async () => response({ error: 'Invalid session' }, 401));
    vi.stubGlobal('fetch', fetch);
    await render();
    expect(container.textContent).toContain('Continuar com Google');
    expect(container.querySelector('[data-page]')).toBeNull();
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('shows cancellation on the login screen without contacting the app API', async () => {
    window.history.replaceState({}, '', '/?auth_callback=google&error=access_denied');
    vi.stubGlobal('fetch', vi.fn());
    await render();
    expect(container.querySelector('[role="alert"]')?.textContent).toContain('cancelado');
    expect(fetch).not.toHaveBeenCalled();
  });
});
