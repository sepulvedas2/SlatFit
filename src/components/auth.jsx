import { base44 } from "@/api/base44Client";

const AUTH_KEY = 'slatfit_auth';

export function saveUser(user, token) {
  localStorage.setItem(AUTH_KEY, JSON.stringify({ user, token }));
}

export function clearUser() {
  localStorage.removeItem(AUTH_KEY);
}

export function getStoredUser() {
  try {
    const data = localStorage.getItem(AUTH_KEY);
    if (!data) return null;
    return JSON.parse(data).user;
  } catch {
    return null;
  }
}

export function getStoredToken() {
  try {
    const data = localStorage.getItem(AUTH_KEY);
    if (!data) return null;
    return JSON.parse(data).token;
  } catch {
    return null;
  }
}

// Substitui base44.auth.me() pelo usuário do Supabase salvo no localStorage.
// Isso permite que todas as páginas existentes funcionem sem alteração.
base44.auth.me = async () => {
  const user = getStoredUser();
  if (!user) throw new Error('Not authenticated');
  return user;
};