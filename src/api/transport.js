import { getStoredToken } from '@/components/auth';

// Empty string = same origin (Vite dev proxy → localhost:3000). Set VITE_API_BASE_URL
// only for production builds or when the API runs on a different host.
const envBase =
  typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL;
export const API_BASE = envBase != null && String(envBase).trim() !== '' ? envBase : '';

const isDev = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.DEV;

export async function request(path, { method = 'GET', body, auth = true, headers = {} } = {}) {
  const url = `${API_BASE}${path}`;
  const finalHeaders = { 'Content-Type': 'application/json', ...headers };

  if (auth) {
    const token = getStoredToken();
    if (token) finalHeaders.Authorization = `Bearer ${token}`;
  }

  if (isDev) {
    console.log('[transport] →', method, url, { auth: !!finalHeaders.Authorization, body: body ?? null });
  }

  let res;
  try {
    res = await fetch(url, {
      method,
      headers: finalHeaders,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    if (isDev) {
      console.error(
        `[transport] ✗ network error for ${method} ${url} — API_BASE=${API_BASE || '(same origin/proxy)'} unreachable? (CORS/down/wrong IP)`,
        err,
      );
    }
    throw err;
  }

  if (isDev) {
    console.log('[transport] ←', res.status, method, url);
  }

  let json = null;
  try {
    json = await res.json();
  } catch {
    json = null;
  }

  if (!res.ok) {
    const error = new Error(json?.message || json?.error || res.statusText || 'Request failed');
    error.status = res.status;
    error.data = json;
    if (isDev) {
      console.error('[transport] ✗', res.status, method, url, json);
    }
    throw error;
  }

  return json;
}

// Resolves to an axios-like response where `data` is the function's JSON body.
export async function invokeFunction(name, payload) {
  const data = await request(`/functions/${name}`, { method: 'POST', body: payload ?? {} });
  return { data };
}

// Multipart upload to SlatFit BE. Do NOT set Content-Type so the browser adds
// the multipart boundary itself. Returns the backend JSON body, e.g. { file_url }.
export async function uploadFile(file) {
  const form = new FormData();
  form.append('file', file);

  const finalHeaders = {};
  const token = getStoredToken();
  if (token) finalHeaders.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/uploads`, {
    method: 'POST',
    headers: finalHeaders,
    body: form,
  });

  let json = null;
  try {
    json = await res.json();
  } catch {
    json = null;
  }

  if (!res.ok) {
    const error = new Error(json?.message || json?.error || res.statusText || 'Upload failed');
    error.status = res.status;
    error.data = json;
    throw error;
  }

  return json;
}
