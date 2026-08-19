import { invokeFunction, request } from './transport';
import { entities } from './createEntityAPI';
import { saveUser, clearUser, getStoredToken } from '@/components/auth';

async function me() {
  const json = await request('/auth/me');
  const user = json?.user;
  if (!user) throw new Error('Not authenticated');
  const token = getStoredToken();
  if (token) saveUser(user, token);
  return user;
}

async function login(email, password) {
  const { data } = await invokeFunction('supabaseAuth', { action: 'login', email, password });
  if (data?.error) throw new Error(data.error);
  saveUser(data.user, data.token);
  return data.user;
}

async function register(email, password, full_name) {
  const { data } = await invokeFunction('supabaseAuth', {
    action: 'register',
    email,
    password,
    full_name: full_name ?? email.split('@')[0],
  });
  if (data?.error) throw new Error(data.error);
  saveUser(data.user, data.token);
  return data.user;
}

function logout() {
  clearUser();
}

async function getBillingPlans() {
  return request('/billing/plans');
}

async function getSubscription() {
  const json = await request('/billing/subscription');
  return json?.subscription ?? null;
}

async function createSubscription(plan) {
  return request('/billing/create-subscription', {
    method: 'POST',
    body: { plan },
  });
}

async function createPortalSession() {
  return request('/billing/portal-session', { method: 'POST' });
}

async function requestRefund() {
  return request('/billing/refund', { method: 'POST' });
}

export const api = {
  functions: { invoke: invokeFunction },
  auth: { me, login, register, logout },
  billing: {
    getPlans: getBillingPlans,
    getSubscription,
    createSubscription,
    createPortalSession,
    requestRefund,
  },
  entities,
};
