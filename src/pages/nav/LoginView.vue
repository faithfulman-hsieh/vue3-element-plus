<template>
  <div class="page-container">
    <h1 class="page-title">登入</h1>
    <el-form :model="form" ref="formRef" class="form-card" @submit.native.prevent="handleSubmit">
      <el-row :gutter="20">
        <el-col :span="8">
          <div class="label-wrapper">使用者名稱</div>
        </el-col>
        <el-col :span="8">
          <el-form-item prop="username" label-width="0">
            <el-input v-model="form.username" placeholder="請輸入使用者名稱" :disabled="loading" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="8">
          <div class="label-wrapper">密碼</div>
        </el-col>
        <el-col :span="8">
          <el-form-item prop="password" label-width="0">
            <el-input 
              type="password" 
              v-model="form.password" 
              placeholder="請輸入密碼" 
              show-password
              :disabled="loading" 
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="16">
          <el-form-item label-width="0" class="button-form-item">
            <el-button type="primary" native-type="submit" :loading="loading" style="width: 100px;">
              登入
            </el-button>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '~/stores/userStore';
import { authApi } from '~/api/client';
import { ElMessage } from 'element-plus'; 
import type { AuthRequest } from '~/api/models';

const form = ref<AuthRequest>({
  username: '',
  password: '',
});
const loading = ref(false);
const router = useRouter();
const userStore = useUserStore();

const handleSubmit = async () => {
  localStorage.removeItem('jwtToken');
  loading.value = true;

  try {
    const response = await authApi.login({ authRequest: form.value });

    if (response.data) {
      localStorage.setItem('jwtToken', response.data);
      userStore.login();
      ElMessage.success('登入成功，歡迎回來！');
      router.push('/');
    }
  } catch (error: any) {
    console.log('捕獲到登入錯誤:', error);

    let showMsg = '';
    const responseData = error.response?.data;

    if (responseData) {
        if (typeof responseData === 'object' && responseData.message) {
            showMsg = responseData.message;
        } 
        else if (typeof responseData === 'string') {
            showMsg = responseData;
        }
        else {
            showMsg = JSON.stringify(responseData);
        }
    } else {
        showMsg = error.message || '無法連接伺服器';
    }

    console.log('準備顯示錯誤訊息:', showMsg);
    ElMessage.error(showMsg);

  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.page-container {
  padding: 24px;
  max-width: 800px;
  margin: 0 auto;
  /* 確保背景色適應 */
  background-color: var(--el-bg-color);
}

.page-title {
  text-align: center;
  margin-bottom: 30px;
  font-size: 28px;
  /* Dark Mode 修正 */
  color: var(--el-text-color-primary);
}

.label-wrapper {
  text-align: right;
  line-height: 32px;
  font-weight: 500;
  /* Dark Mode 修正 */
  color: var(--el-text-color-regular);
}

.button-form-item {
  margin-bottom: 0;
  text-align: center;
  margin-top: 20px;
}

@media (max-width: 768px) {
  .label-wrapper {
    text-align: left;
    margin-bottom: 8px;
  }
}
</style>