import { describe, it, expect, vi, beforeEach } from 'vitest';

// Lock the token so we can assert the Authorization header contract.
vi.mock('@/components/auth', () => ({
  getStoredToken: () => 'test-token',
  saveUser: vi.fn(),
  clearUser: vi.fn(),
  getStoredUser: vi.fn(),
}));

import { invokeFunction, request, API_BASE } from '../transport';

function jsonResponse(body, { ok = true, status = 200 } = {}) {
  return { ok, status, statusText: ok ? 'OK' : 'Error', json: async () => body };
}

beforeEach(() => {
  vi.restoreAllMocks();
});

describe('functions.invoke transport contract', () => {
  it('POSTs to /functions/{name} with JSON body + bearer token and wraps body in { data }', async () => {
    global.fetch = vi.fn(async () => jsonResponse({ data: [{ id: 1 }] }));

    const res = await invokeFunction('supabase', { action: 'select', table: 'workouts' });

    expect(global.fetch).toHaveBeenCalledTimes(1);
    const [url, opts] = global.fetch.mock.calls[0];
    expect(url).toBe(`${API_BASE}/functions/supabase`);
    expect(opts.method).toBe('POST');
    expect(opts.headers['Content-Type']).toBe('application/json');
    expect(opts.headers.Authorization).toBe('Bearer test-token');
    expect(JSON.parse(opts.body)).toEqual({ action: 'select', table: 'workouts' });
    expect(res).toEqual({ data: { data: [{ id: 1 }] } });
  });

  it.each([
    ['supabaseAuth', { action: 'login', email: 'a@b.c', password: 'x' }],
    ['supabase', { action: 'select', table: 'workouts' }],
    ['addXP', { amount: 10, source: 'habit', reference_id: 'h1' }],
    ['updateXP', { xp_ganho: 10, tipo_acao: 'habito' }],
    ['searchFoodsDatabase', { query: 'arroz' }],
    ['getRankingSnapshot', {}],
    ['completeChallengeCheckIn', { userChallengeId: '1', challengeMeta: {} }],
    ['seedExercises', {}],
  ])('preserves the frozen payload for %s', async (name, payload) => {
    global.fetch = vi.fn(async () => jsonResponse({ ok: true }));

    await invokeFunction(name, payload);

    const [url, opts] = global.fetch.mock.calls[0];
    expect(url).toBe(`${API_BASE}/functions/${name}`);
    expect(opts.method).toBe('POST');
    expect(JSON.parse(opts.body)).toEqual(payload);
  });

  it('defaults an empty body when payload is omitted', async () => {
    global.fetch = vi.fn(async () => jsonResponse({}));

    await invokeFunction('seedExercises');

    const [, opts] = global.fetch.mock.calls[0];
    expect(JSON.parse(opts.body)).toEqual({});
  });

  it('throws an Error carrying status + body on non-2xx responses', async () => {
    global.fetch = vi.fn(async () => jsonResponse({ error: 'nope' }, { ok: false, status: 400 }));

    await expect(invokeFunction('supabase', { action: 'select' })).rejects.toMatchObject({
      message: 'nope',
      status: 400,
      data: { error: 'nope' },
    });
  });
});

describe('request helper', () => {
  it('omits Authorization when no token is present', async () => {
    // Re-mock for this assertion only.
    global.fetch = vi.fn(async () => jsonResponse({ ok: true }));
    await request('/health', { auth: false });
    const [, opts] = global.fetch.mock.calls[0];
    expect(opts.headers.Authorization).toBeUndefined();
  });
});
