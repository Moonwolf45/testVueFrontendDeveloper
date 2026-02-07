import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import ElementPlus from 'element-plus';
import AccountManager from '../components/AccountManager.vue';
import { useAccountStore } from '../store/accountStore';

// Mock crypto.randomUUID
vi.stubGlobal('crypto', {
  randomUUID: vi.fn(() => 'test-uuid-' + Math.random())
});

describe('AccountManager.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
  });

  it('renders correctly and allows adding an account', async () => {
    const wrapper = mount(AccountManager, {
      global: {
        plugins: [ElementPlus]
      }
    });

    expect(wrapper.text()).toContain('Учетные записи');
    
    const addButton = wrapper.find('.header .el-button');
    await addButton.trigger('click');

    const store = useAccountStore();
    expect(store.accounts.length).toBe(1);
    
    // Check if one account item is rendered
    await wrapper.vm.$nextTick();
    expect(wrapper.findAll('.account-item').length).toBe(1);
  });

  it('shows password field only for "Локальная" type', async () => {
    const store = useAccountStore();
    store.addAccount();
    
    const wrapper = mount(AccountManager, {
      global: {
        plugins: [ElementPlus]
      }
    });

    // Default type is "Локальная" in store
    expect(wrapper.find('input[placeholder="Пароль"]').exists()).toBe(true);

    // Change type to LDAP
    store.accounts[0].type = 'LDAP';
    await wrapper.vm.$nextTick();
    
    expect(wrapper.find('input[placeholder="Пароль"]').exists()).toBe(false);
  });

  it('validates required fields on blur', async () => {
    const store = useAccountStore();
    store.addAccount();
    
    const wrapper = mount(AccountManager, {
      global: {
        plugins: [ElementPlus]
      }
    });

    const loginInput = wrapper.find('input[placeholder="Логин"]');
    await loginInput.trigger('blur');

    // Check for error class
    expect(wrapper.find('.is-error').exists()).toBe(true);
  });

  it('removes account on delete button click', async () => {
    const store = useAccountStore();
    store.addAccount();
    
    const wrapper = mount(AccountManager, {
      global: {
        plugins: [ElementPlus]
      }
    });

    expect(wrapper.findAll('.account-item').length).toBe(1);
    
    const deleteButton = wrapper.find('.el-button--danger');
    await deleteButton.trigger('click');

    expect(store.accounts.length).toBe(0);
    await wrapper.vm.$nextTick();
    expect(wrapper.findAll('.account-item').length).toBe(0);
  });
});
