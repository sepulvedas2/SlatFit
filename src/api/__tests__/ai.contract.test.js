import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/components/auth', () => ({
  getStoredToken: () => 'test-token',
  saveUser: vi.fn(),
  clearUser: vi.fn(),
  getStoredUser: vi.fn(),
}));

import * as ai from '../ai';
import { API_BASE } from '../transport';

function jsonResponse(body, { ok = true, status = 200 } = {}) {
  return { ok, status, statusText: ok ? 'OK' : 'Error', json: async () => body };
}

beforeEach(() => {
  global.fetch = vi.fn(async () => jsonResponse({ result: { ok: true } }));
});

describe('ai client contract', () => {
  it('analyzeFoodImage POSTs /ai/analyzeFoodImage with { image_url } and returns result', async () => {
    global.fetch = vi.fn(async () => jsonResponse({ result: { food_name: 'Banana' } }));

    const result = await ai.analyzeFoodImage('https://x/y.jpg');

    const [url, opts] = global.fetch.mock.calls[0];
    expect(url).toBe(`${API_BASE}/ai/analyzeFoodImage`);
    expect(opts.method).toBe('POST');
    expect(opts.headers.Authorization).toBe('Bearer test-token');
    expect(JSON.parse(opts.body)).toEqual({ image_url: 'https://x/y.jpg' });
    expect(result).toEqual({ food_name: 'Banana' });
  });

  it('chat POSTs /ai/chat with persona + message + history + context', async () => {
    global.fetch = vi.fn(async () => jsonResponse({ result: 'oi!' }));

    const result = await ai.chat({
      persona: 'nutrition',
      message: 'olá',
      history: [{ role: 'user', content: 'hi' }],
      context: { goal: 'weight_loss' },
    });

    const [url, opts] = global.fetch.mock.calls[0];
    expect(url).toBe(`${API_BASE}/ai/chat`);
    expect(JSON.parse(opts.body)).toEqual({
      persona: 'nutrition',
      message: 'olá',
      history: [{ role: 'user', content: 'hi' }],
      context: { goal: 'weight_loss' },
    });
    expect(result).toBe('oi!');
  });

  it('throws when the operation returns an { error }', async () => {
    global.fetch = vi.fn(async () => jsonResponse({ error: 'Daily AI usage limit reached' }));
    await expect(ai.workoutPlan({ frequency: 3, time: 45 })).rejects.toThrow(
      'Daily AI usage limit reached',
    );
  });

  it('uploadFile POSTs multipart to /uploads and returns { file_url }', async () => {
    global.fetch = vi.fn(async () => jsonResponse({ file_url: 'https://store/img.png' }));

    const file = new Blob(['data'], { type: 'image/png' });
    const result = await ai.uploadFile(file);

    const [url, opts] = global.fetch.mock.calls[0];
    expect(url).toBe(`${API_BASE}/uploads`);
    expect(opts.method).toBe('POST');
    expect(opts.headers.Authorization).toBe('Bearer test-token');
    // multipart: body is FormData, and we must NOT set a JSON content-type
    expect(opts.body).toBeInstanceOf(FormData);
    expect(opts.headers['Content-Type']).toBeUndefined();
    expect(result).toEqual({ file_url: 'https://store/img.png' });
  });
});
