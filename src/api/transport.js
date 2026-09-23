import { getStoredToken } from '@/components/auth';

const RENDER_BE = 'https://slatfit-be-upsu.onrender.com';

function resolveApiBase() {
  if (typeof window !== 'undefined' && window.location?.hostname) {
    const host = window.location.hostname.toLowerCase();
    if (host.includes('beautiful') || host.includes('illustrious')) {
      return RENDER_BE;
    }
  }

  const envBase =
    typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL;
  if (envBase != null && String(envBase).trim() !== '') {
    return String(envBase).trim().replace(/\/+$/, '');
  }

  // Empty = same origin (Vite dev proxy → localhost:3000)
  return '';
}

export const API_BASE = resolveApiBase();

const isDev = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.DEV;

export async function request(path, { method = 'GET', body, auth = true, headers = {} } = {}) {
  const url = `${API_BASE}${path}`;
  const methodUpper = String(method).toUpperCase();
  // Fastify rejects POST/PUT/PATCH with Content-Type: application/json and an empty body.
  const sendJsonBody =
    body !== undefined ||
    methodUpper === 'POST' ||
    methodUpper === 'PUT' ||
    methodUpper === 'PATCH';
  const finalHeaders = { ...headers };
  if (sendJsonBody && finalHeaders['Content-Type'] == null) {
    finalHeaders['Content-Type'] = 'application/json';
  }

  if (auth) {
    const token = getStoredToken();
    if (token) finalHeaders.Authorization = `Bearer ${token}`;
  }

  const serializedBody = sendJsonBody
    ? JSON.stringify(body !== undefined ? body : {})
    : undefined;

  if (isDev) {
    console.log('[transport] →', method, url, {
      auth: !!finalHeaders.Authorization,
      body: body !== undefined ? body : sendJsonBody ? {} : null,
    });
  }

  let res;
  try {
    res = await fetch(url, {
      method,
      headers: finalHeaders,
      body: serializedBody,
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
