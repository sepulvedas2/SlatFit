// @vitest-environment jsdom
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { beforeEach, afterEach, describe, it, expect, vi } from 'vitest';
import App from '../App';
import * as recovery from '@/lib/password-recovery';

vi.mock('@/lib/password-recovery', () => ({
  requestPasswordReset: vi.fn(), validateRecoveryLink: vi.fn(), updateRecoveredPassword: vi.fn(),
}));
vi.mock('../ProtectedApp', () => { throw new Error('Recovery must not initialize auth or billing'); });

let root;
let container;
beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  vi.stubGlobal('fetch', vi.fn(() => { throw new Error('Unexpected backend request'); }));
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
  recovery.requestPasswordReset.mockResolvedValue(undefined);
  recovery.validateRecoveryLink.mockResolvedValue(undefined);
  recovery.updateRecoveredPassword.mockResolvedValue(undefined);
});
afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
  vi.unstubAllGlobals();
});
async function render(path) {
  window.history.replaceState({}, '', path);
  await act(async () => root.render(<App />));
}
async function fill(id, value) {
  const input = container.querySelector(`#${id}`);
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, value);
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
}
async function submit() {
  await act(async () => container.querySelector('form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })));
}

describe('public password recovery screens', () => {
  it('lets unpaid or anonymous users request recovery without loading the app', async () => {
    await render('/RecuperarSenha');
    await fill('recovery-email', 'test@example.com');
    await submit();
    expect(recovery.requestPasswordReset).toHaveBeenCalledWith('test@example.com');
    expect(container.querySelector('[role="status"]').textContent).toContain('Se houver uma conta');
    expect(container.querySelector('button[type="submit"]').disabled).toBe(true);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('shows an actionable error and no password form for expired links', async () => {
    recovery.validateRecoveryLink.mockRejectedValue(new Error('Link expirado.'));
    await render('/RedefinirSenha?code=expired');
    expect(container.querySelector('[role="alert"]').textContent).toBe('Link expirado.');
    expect(container.querySelector('input[type="password"]')).toBeNull();
    expect(container.querySelector('a[href="/RecuperarSenha"]')).not.toBeNull();
    expect(fetch).not.toHaveBeenCalled();
  });

  it('requires matching passwords and returns to the app without granting paid access', async () => {
    await render('/RedefinirSenha?code=valid');
    await fill('new-password', 'new-password');
    await fill('confirm-password', 'wrong-password');
    await submit();
    expect(container.querySelector('[role="alert"]').textContent).toContain('não coincidem');
    expect(recovery.updateRecoveredPassword).not.toHaveBeenCalled();
    await fill('confirm-password', 'new-password');
    await submit();
    expect(recovery.updateRecoveredPassword).toHaveBeenCalledWith('new-password');
    expect(container.querySelector('[role="status"]').textContent).toContain('Sua senha foi atualizada');
    expect(container.querySelector('input')).toBeNull();
    expect(window.location.pathname).toBe('/RedefinirSenha');
    expect(fetch).not.toHaveBeenCalled();
  });
});
