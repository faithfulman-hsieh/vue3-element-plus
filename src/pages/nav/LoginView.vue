<template>
  <div class="page-container">
    <h1 class="page-title">登入</h1>
    <el-form :model="form" ref="formRef" class="form-card" @submit.native.prevent="handleSubmit">
      <el-row :gutter="20">
        <el-col :xs="24" :sm="8">
          <div class="label-wrapper">使用者名稱</div>
        </el-col>
        <el-col :xs="24" :sm="8">
          <el-form-item prop="username" label-width="0">
            <el-input v-model="form.username" placeholder="請輸入使用者名稱" :disabled="loading" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :xs="24" :sm="8">
          <div class="label-wrapper">密碼</div>
        </el-col>
        <el-col :xs="24" :sm="8">
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
        <el-col :xs="24" :sm="16">
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
import { useUserStore } from '../../stores/userStore';
import { authApi, userApi } from '../../api/client';
import { ElMessage, ElMessageBox } from 'element-plus'; // ★★★ [FCM] 引入 ElMessageBox ★★★
import type { AuthRequest } from '../../api/models';
import { initFirebaseMessaging } from '../../utils/firebase'; // ★★★ [FCM] 引入初始化函式 ★★★

const form = ref<AuthRequest>({
  username: '',
  password: '',
});
const loading = ref(false);
const router = useRouter();
const userStore = useUserStore();

const handleSubmit = async () => {
  sessionStorage.removeItem('jwtToken');
  sessionStorage.removeItem('username');
  loading.value = true;

  try {
    const response = await authApi.login({ authRequest: form.value });

    if (response.data) {
      sessionStorage.setItem('jwtToken', response.data);
      // 修改：將使用者輸入的帳號傳入 login 方法
      userStore.login(form.value.username);

      // ★★★ [FCM Logic Start] 登入成功後的權限詢問與 Token 上傳 ★★★
      
      // 1. iOS/PWA 權限詢問：利用確認視窗創造「使用者手勢」
      if ('Notification' in window && Notification.permission === 'default') {
        try {
          await ElMessageBox.confirm(
            '為了能即時收到來電與訊息通知，請允許通知權限。',
            '登入成功',
            {
              confirmButtonText: '開啟通知 (建議)',
              cancelButtonText: '稍後再說',
              type: 'info',
              center: true,
              showClose: false,
              closeOnClickModal: false
            }
          );
          // 使用者點擊「開啟」，觸發初始化
          await initFirebaseMessaging();
          ElMessage.success('通知已啟用');
        } catch (e) {
          // 使用者拒絕或點稍後
          console.log('使用者暫不開啟通知');
        }
      } else if (Notification.permission === 'granted') {
         // 已經有權限，直接初始化確保 Token 是新的
         initFirebaseMessaging().catch(err => console.error('FCM init error', err));
      }

      // 2. 上傳 Token (無論是剛拿到的還是快取舊的)
      // 給一點時間讓 initFirebaseMessaging 寫入 sessionStorage
      setTimeout(() => {
          const currentToken = sessionStorage.getItem('fcmToken');
          if (currentToken) {
              console.log('[LoginView] 準備上傳 FCM Token:', currentToken.substring(0, 10) + '...');
              userApi.updateFcmToken(currentToken)
                  .then(() => console.log('[LoginView] FCM Token 上傳成功'))
                  .catch((err: any) => console.error('[LoginView] FCM Token 上傳失敗', err));
          }
      }, 1000); // 延遲 1 秒確保 Token 已就緒

      // ★★★ [FCM Logic End] ★★★

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
  background-color: var(--el-bg-color);
}

.page-title {
  text-align: center;
  margin-bottom: 30px;
  font-size: 28px;
  color: var(--el-text-color-primary);
}

.label-wrapper {
  text-align: right;
  line-height: 32px;
  font-weight: 500;
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