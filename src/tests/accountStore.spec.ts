import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useAccountStore } from '../store/accountStore';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value.toString(); },
    clear: () => { store = {}; },
    removeItem: (key: string) => { delete store[key]; }
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock crypto.randomUUID
vi.stubGlobal('crypto', {
  randomUUID: vi.fn(() => 'test-uuid-' + Math.random())
});

describe('Account Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
  });

  it('initializes with empty accounts if localStorage is empty', () => {
    const store = useAccountStore();
    expect(store.accounts).toEqual([]);
  });

  it('adds a new account', () => {
    const store = useAccountStore();
    store.addAccount();
    expect(store.accounts.length).toBe(1);
    expect(store.accounts[0]).toMatchObject({
      labels: [],
      type: 'Локальная',
      login: '',
      password: ''
    });
  });

  it('removes an account', () => {
    const store = useAccountStore();
    store.addAccount();
    const id = store.accounts[0].id;
    store.removeAccount(id);
    expect(store.accounts.length).toBe(0);
  });

  it('updates an account', () => {
    const store = useAccountStore();
    store.addAccount();
    const account = { ...store.accounts[0], login: 'new-login' };
    store.updateAccount(account);
    expect(store.accounts[0].login).toBe('new-login');
  });

  it('sets password to null when type is LDAP', () => {
    const store = useAccountStore();
    store.addAccount();
    const account = { ...store.accounts[0], type: 'LDAP' as const, password: 'some-password' };
    store.updateAccount(account);
    expect(store.accounts[0].password).toBeNull();
  });

  it('saves to localStorage on changes', () => {
    const store = useAccountStore();
    store.addAccount();
    const saved = JSON.parse(localStorage.getItem('accounts') || '[]');
    expect(saved.length).toBe(1);
  });
});
