const AUTH_KEY = 'slatfit_auth';

const safeStorage = () => {
  try {
    return typeof localStorage !== 'undefined' ? localStorage : null;
  } catch {
    return null;
  }
};

export function saveUser(user, token) {
  const storage = safeStorage();
  if (!storage) return;
  storage.setItem(AUTH_KEY, JSON.stringify({ user, token }));
}

export function clearUser() {
  const storage = safeStorage();
  if (!storage) return;
  storage.removeItem(AUTH_KEY);
}

export function getStoredUser() {
  try {
    const storage = safeStorage();
    const data = storage?.getItem(AUTH_KEY);
    if (!data) return null;
    return JSON.parse(data).user;
  } catch {
    return null;
  }
}

export function getStoredToken() {
  try {
    const storage = safeStorage();
    const data = storage?.getItem(AUTH_KEY);
    if (!data) return null;
    return JSON.parse(data).token;
  } catch {
    return null;
  }
}
