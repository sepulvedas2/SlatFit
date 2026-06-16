import { getStoredToken } from '@/components/auth';

export const API_BASE =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL) ||
  'http://192.168.2.166:3000';

export async function request(path, { method = 'GET', body, auth = true, headers = {} } = {}) {
  const finalHeaders = { 'Content-Type': 'application/json', ...headers };

  if (auth) {
    const token = getStoredToken();
    if (token) finalHeaders.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: finalHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

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
    throw error;
  }

  return json;
}

// Mirrors the Base44 SDK `functions.invoke(name, payload)` contract:
// resolves to an axios-like response where `data` is the function's JSON body.
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
