import { defineStore } from 'pinia';
import type { Account, AccountState } from '../types';

export const useAccountStore = defineStore('account', {
  state: (): AccountState => ({
    accounts: JSON.parse(localStorage.getItem('accounts') || '[]'),
  }),
  actions: {
    addAccount() {
      const newAccount: Account = {
        id: crypto.randomUUID(),
        labels: [],
        type: 'Локальная',
        login: '',
        password: '',
      };
      this.accounts.push(newAccount);
      this.saveToLocalStorage();
    },
    removeAccount(id: string) {
      this.accounts = this.accounts.filter(acc => acc.id !== id);
      this.saveToLocalStorage();
    },
    updateAccount(updatedAccount: Account) {
      const index = this.accounts.findIndex(acc => acc.id === updatedAccount.id);
      if (index !== -1) {
        if (updatedAccount.type === 'LDAP') {
          updatedAccount.password = null;
        }
        this.accounts[index] = { ...updatedAccount };
        this.saveToLocalStorage();
      }
    },
    saveToLocalStorage() {
      localStorage.setItem('accounts', JSON.stringify(this.accounts));
    },
  },
});
