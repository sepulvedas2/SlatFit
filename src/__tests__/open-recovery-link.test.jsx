// @vitest-environment jsdom
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { beforeEach, afterEach, describe, it, expect, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import OpenRecoveryLink, { parseRecoveryVerifyUrl } from '../pages/OpenRecoveryLink';

describe('parseRecoveryVerifyUrl', () => {
  it('accepts supabase auth verify urls from the hash', () => {
    expect(parseRecoveryVerifyUrl('#https://abc.supabase.co/auth/v1/verify?token=x&type=recovery'))
      .toBe('https://abc.supabase.co/auth/v1/verify?token=x&type=recovery');
  });

  it('rejects open redirects and non-verify paths', () => {
    expect(parseRecoveryVerifyUrl('#https://evil.example/phish')).toBeNull();
    expect(parseRecoveryVerifyUrl('#https://abc.supabase.co/rest/v1/')).toBeNull();
    expect(parseRecoveryVerifyUrl('#')).toBeNull();
  });
});

describe('OpenRecoveryLink', () => {
  let root;
  let container;
  beforeEach(() => {
    vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
    container = document.createElement('div');
    document.body.append(container);
    root = createRoot(container);
  });
  afterEach(async () => {
    await act(async () => root.unmount());
    container.remove();
  });

  it('requires a click before leaving for supabase', async () => {
    const assign = vi.fn();
    vi.stubGlobal('location', { ...window.location, hash: '#https://abc.supabase.co/auth/v1/verify?token=1&type=recovery', assign });
    await act(async () => root.render(
      <MemoryRouter>
        <Routes>
          <Route path="*" element={<OpenRecoveryLink />} />
        </Routes>
      </MemoryRouter>,
    ));
    expect(container.textContent).toContain('Continuar para redefinir senha');
    expect(assign).not.toHaveBeenCalled();
    await act(async () => container.querySelector('button').click());
    expect(assign).toHaveBeenCalledWith('https://abc.supabase.co/auth/v1/verify?token=1&type=recovery');
  });
});
