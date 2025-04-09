<!-- src/views/Login.vue -->
<template>
    <div class="page-container">
        <h1 class="page-title">登入</h1>
        <el-form :model="form" ref="formRef" class="form-card" @submit.native.prevent="handleSubmit">
            <el-row :gutter="20">
                <el-col :span="6">
                    <div class="label-wrapper">使用者名稱</div>
                </el-col>
                <el-col :span="15">
                    <el-form-item prop="username" label-width="0">
                        <el-input v-model="form.username" placeholder="請輸入使用者名稱" />
                    </el-form-item>
                </el-col>
                <el-col :span="6"></el-col>
            </el-row>
            <el-row :gutter="20">
                <el-col :span="6">
                    <div class="label-wrapper">密碼</div>
                </el-col>
                <el-col :span="15">
                    <el-form-item prop="password" label-width="0">
                        <el-input type="password" v-model="form.password" placeholder="請輸入密碼" />
                    </el-form-item>
                </el-col>
                <el-col :span="6"></el-col>
            </el-row>
            <el-row :gutter="20">
                <el-col :span="21">
                    <el-form-item class="button-item" label-width="0">
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
    import { useUserStore } from '~/stores/userStore'; // 引入 Pinia store
    import { loginUser } from '~/api/userService'; // 引入 loginUser 函數
    import { ElNotification } from 'element-plus';

    const form = ref({
      username: '',
      password: '',
    });
    const router = useRouter();
    const userStore = useUserStore(); // 使用用戶狀態管理

    const handleSubmit = async () => {
      try {
        const response = await loginUser(form.value.username, form.value.password);
        if (response.data) { // 假設後端返回的資料中有 token
          localStorage.setItem('jwtToken', response.data); // 儲存 token
          userStore.login(); // 更新登錄狀態
          ElNotification({
            title: '成功',
            message: '登入成功',
            type: 'success',
          });
          router.push('/'); // 登入成功後跳轉到主頁
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
    .page-container {
      width: 50%; /* 表單寬度設為畫面的 1/2 */
      margin: 0 auto; /* 保持居中 */
    }

    .label-wrapper {
      text-align: right;
      padding-right: 20px;
      color: #666;
      line-height: 40px; /* 與輸入框高度對齊 */
    }

    .button-item {
      text-align: right;
      margin-bottom: 0; /* 移除 el-form-item 的底部間距 */
    }

    /* 確保按鈕完全靠右 */
    .button-item :deep(.el-form-item__content) {
      display: flex;
      justify-content: flex-end;
      padding-right: 0; /* 移除可能存在的右內邊距 */
    }

    /* 移除 el-form-item 的偽元素影響 */
    .button-item :deep(.el-form-item__content::after) {
      display: none;
    }
</style>