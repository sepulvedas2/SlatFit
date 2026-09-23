import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/components/auth', () => ({
  getStoredToken: () => 'test-token',
  saveUser: vi.fn(),
  clearUser: vi.fn(),
  getStoredUser: vi.fn(),
}));

import { api } from '../client';
import { API_BASE } from '../transport';

function jsonResponse(body, { ok = true, status = 200 } = {}) {
  return { ok, status, statusText: ok ? 'OK' : 'Error', json: async () => body };
}

beforeEach(() => {
  vi.restoreAllMocks();
});

describe('api.billing contract', () => {
  it('getSubscription() GETs minimal billing state with bearer auth', async () => {
    const subscription = { plan: 'monthly', status: 'active', hasAccess: true };
    global.fetch = vi.fn(async () => jsonResponse({ subscription }));

    const result = await api.billing.getSubscription();

    const [url, opts] = global.fetch.mock.calls[0];
    expect(url).toBe(`${API_BASE}/billing/subscription`);
    expect(opts.method).toBe('GET');
    expect(opts.headers.Authorization).toBe('Bearer test-token');
    expect(result).toEqual(subscription);
  });

  it('createSubscription() sends only the selected plan key', async () => {
    global.fetch = vi.fn(async () => jsonResponse({ clientSecret: 'pi_secret_123' }));

    await api.billing.createSubscription('annual');

    const [url, opts] = global.fetch.mock.calls[0];
    expect(url).toBe(`${API_BASE}/billing/create-subscription`);
    expect(opts.method).toBe('POST');
    expect(JSON.parse(opts.body)).toEqual({ plan: 'annual' });
  });

  it('createPortalSession() and requestRefund() use backend-only billing endpoints', async () => {
    global.fetch = vi.fn(async () => jsonResponse({ url: 'https://billing.stripe.test/session' }));
    await api.billing.createPortalSession();
    const [portalUrl, portalOpts] = global.fetch.mock.calls[0];
    expect(portalUrl).toBe(`${API_BASE}/billing/portal-session`);
    expect(portalOpts.method).toBe('POST');
    expect(portalOpts.headers['Content-Type']).toBe('application/json');
    expect(JSON.parse(portalOpts.body)).toEqual({});

    global.fetch = vi.fn(async () => jsonResponse({ subscription: { hasAccess: false } }));
    await api.billing.requestRefund();
    const [refundUrl, refundOpts] = global.fetch.mock.calls[0];
    expect(refundUrl).toBe(`${API_BASE}/billing/refund`);
    expect(JSON.parse(refundOpts.body)).toEqual({});
  });
});
