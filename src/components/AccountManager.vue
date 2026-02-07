<template>
  <div class="account-manager">
    <div class="header">
      <h2>Учетные записи</h2>
      <el-button type="default" :icon="Plus" @click="addAccount">
      </el-button>
    </div>

    <div class="info-alert">
      <el-alert
        title="Для указания нескольких меток для одной пару логин\пароль используйте ;"
        type="primary"
        show-icon
        :closable="false"
      >
        <template #icon>
          <el-icon><QuestionFilled /></el-icon>
        </template>
      </el-alert>
    </div>

    <div class="account-list">
      <div v-if="accounts.length === 0" class="labels-row">
        <el-row>
          <el-col><label>Тут пока нет записей</label></el-col>
        </el-row>
      </div>
      <div v-if="accounts.length > 0" class="labels-row">
        <el-row :gutter="20">
          <el-col :span="6"><label>Метки</label></el-col>
          <el-col :span="4"><label>Тип записи</label></el-col>
          <el-col :span="6"><label>Логин</label></el-col>
          <el-col :span="6" v-if="hasLocalType"><label>Пароль</label></el-col>
        </el-row>
      </div>

      <div v-for="account in accounts" :key="account.id" class="account-item">
        <el-row :gutter="20" align="middle">
          <el-col :span="6">
            <el-input
              v-model="accountRawLabels[account.id]"
              type="textarea"
              :autosize="{ minRows: 1, maxRows: 4 }"
              maxlength="50"
              placeholder="Метка 1; Метка 2"
              @blur="handleUpdate(account)"
            />
          </el-col>
          <el-col :span="4">
            <el-select
              v-model="account.type"
              placeholder="Выберите тип"
              @change="handleUpdate(account)"
            >
              <el-option label="LDAP" value="LDAP" />
              <el-option label="Локальная" value="Локальная" />
            </el-select>
          </el-col>
          <el-col :span="account.type === 'Локальная' ? 6 : 12">
            <el-input
              v-model="account.login"
              maxlength="100"
              :class="{ 'is-error': validationErrors[account.id]?.login }"
              placeholder="Логин"
              @blur="handleUpdate(account)"
            />
          </el-col>
          <el-col :span="6" v-if="account.type === 'Локальная'">
            <el-input
              v-model="account.password"
              maxlength="100"
              show-password
              :class="{ 'is-error': validationErrors[account.id]?.password }"
              placeholder="Пароль"
              @blur="handleUpdate(account)"
            />
          </el-col>
          <el-col :span="2">
            <el-button type="danger" link @click="removeAccount(account.id)">
              <el-icon><Delete /></el-icon>
            </el-button>
          </el-col>
        </el-row>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed, onMounted } from 'vue';
import { Plus, Delete, QuestionFilled } from '@element-plus/icons-vue';
import { useAccountStore } from '../store/accountStore';
import type { Account } from '../types';

const store = useAccountStore();
const accounts = computed(() => store.accounts);

const accountRawLabels = reactive<Record<string, string>>({});
const validationErrors = reactive<Record<string, { login?: boolean; password?: boolean }>>({});

const hasLocalType = computed(() => accounts.value.some(acc => acc.type === 'Локальная'));

// Initialize raw labels from store
onMounted(() => {
  accounts.value.forEach(acc => {
    accountRawLabels[acc.id] = acc.labels.map(l => l.text).join('; ');
  });
});

const addAccount = () => {
  store.addAccount();
  const newAcc = accounts.value[accounts.value.length - 1];
  if (newAcc) {
    accountRawLabels[newAcc.id] = '';
  }
};

const removeAccount = (id: string) => {
  store.removeAccount(id);
  delete accountRawLabels[id];
  delete validationErrors[id];
};

const handleUpdate = (account: Account) => {
  // Convert labels
  const rawValue = accountRawLabels[account.id] || '';
  const labelTexts = rawValue.split(';').map(s => s.trim()).filter(s => s !== '');
  account.labels = labelTexts.map(text => ({ text }));

  // Validate
  const errors = {
    login: !account.login || account.login.length > 100,
    password: account.type === 'Локальная' && (!account.password || account.password.length > 100)
  };

  validationErrors[account.id] = errors;

  if (!errors.login && !errors.password) {
    store.updateAccount(account);
  }
};
</script>

<style scoped>
.account-manager {
  max-width: 1000px;
  margin: 20px auto;
  padding: 20px;
}

.header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
}

.info-alert {
  margin-bottom: 20px;
}

.labels-row {
  margin-bottom: 10px;
  font-weight: bold;
  color: #606266;
}

.account-item {
  margin-bottom: 15px;
}

.is-error :deep(.el-input__wrapper),
.is-error :deep(.el-textarea__inner) {
  box-shadow: 0 0 0 1px var(--el-color-danger) inset !important;
}

label {
  font-size: 14px;
}
</style>
