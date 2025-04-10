<!-- src/views/Login.vue -->
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
            <el-input v-model="form.username" placeholder="請輸入使用者名稱" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="8">
          <div class="label-wrapper">密碼</div>
        </el-col>
        <el-col :span="8">
          <el-form-item prop="password" label-width="0">
            <el-input type="password" v-model="form.password" placeholder="請輸入密碼" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="16">
          <el-form-item label-width="0" class="button-form-item">
            <el-button type="primary" native-type="submit">登入</el-button>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '~/stores/userStore';
import { loginUser } from '~/api/userService';
import { ElNotification } from 'element-plus';

const form = ref({
  username: '',
  password: '',
});
const router = useRouter();
const userStore = useUserStore();

const handleSubmit = async () => {
  try {
    const response = await loginUser(form.value.username, form.value.password);
    if (response.data) {
      localStorage.setItem('jwtToken', response.data);
      userStore.login();
      ElNotification({
        title: '成功',
        message: '登入成功',
        type: 'success',
      });
      router.push('/');
    }
  } catch (error) {
    ElNotification({
      title: '登入失敗',
      message: '請檢查您的帳號或密碼',
      type: 'error',
    });
  }
};
</script>

<style scoped>
.label-wrapper {
  text-align: right;
  line-height: 40px; /* 與輸入框高度對齊 */
}

.button-form-item {
  margin-bottom: 0; /* 移除預設下邊距 */
}
</style>