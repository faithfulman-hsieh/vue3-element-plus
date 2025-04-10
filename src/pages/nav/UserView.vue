<!-- src/views/UserView.vue -->
<template>
  <div class="page-container">
    <h1 class="page-title">使用者管理</h1>

    <!-- 新增使用者表單 -->
    <el-form :model="newUser" class="form-card">
      <el-row :gutter="20">
        <el-col :span="8">
          <div class="label-wrapper">名字</div>
        </el-col>
        <el-col :span="8">
          <el-form-item :error="nameError" label-width="0">
            <el-input v-model="newUser.name" placeholder="請輸入名字" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="8">
          <div class="label-wrapper">電子郵件</div>
        </el-col>
        <el-col :span="8">
          <el-form-item :error="emailError" label-width="0">
            <el-input v-model="newUser.email" placeholder="請輸入電子郵件" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="8">
          <div class="label-wrapper">密碼</div>
        </el-col>
        <el-col :span="8">
          <el-form-item :error="passwordError" label-width="0">
            <el-input v-model="newUser.password" type="password" placeholder="請輸入密碼" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="8">
          <div class="label-wrapper">角色</div>
        </el-col>
        <el-col :span="8">
          <el-form-item :error="roleError" label-width="0">
            <el-select v-model="newUser.selectedRole" placeholder="選擇角色">
              <el-option v-for="role in roleOptions" :key="role.id" :label="role.name" :value="role.id" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="16">
          <el-form-item label-width="0" class="button-form-item">
            <el-button type="primary" @click="handleAddUser">新增使用者</el-button>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <!-- 使用者清單表格：左右各空 1 格，表格佔 22 格 -->
    <el-row :gutter="20">
      <el-col :span="22" :offset="1">
        <el-table :data="users" class="table-card" border stripe>
          <el-table-column type="index" label="#" min-width="50" />
          <el-table-column prop="name" label="名字" min-width="200" />
          <el-table-column prop="email" label="電子郵件" min-width="300" />
        </el-table>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElNotification } from 'element-plus';
import { addUser } from '~/api/userService';

// 新增使用者表單資料
const newUser = ref({
  name: '',
  email: '',
  password: '',
  selectedRole: null as number | null,
});
const roleOptions = ref([
  { id: 1, name: 'ADMIN' },
  { id: 2, name: 'USER' },
]);
const nameError = ref('');
const emailError = ref('');
const passwordError = ref('');
const roleError = ref('');

// 使用者清單資料
const users = ref([
  { name: 'user', email: 'user@example.com' },
  { name: 'admin', email: 'admin@example.com' },
]);

// 驗證電子郵件格式
const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// 處理新增使用者
const handleAddUser = async () => {
  nameError.value = '';
  emailError.value = '';
  passwordError.value = '';
  roleError.value = '';

  if (newUser.value.name === '') {
    nameError.value = '名字不能為空';
    return;
  }
  if (newUser.value.email === '') {
    emailError.value = '電子郵件不能為空';
    return;
  }
  if (!validateEmail(newUser.value.email)) {
    emailError.value = '電子郵件格式不正確';
    return;
  }
  if (newUser.value.password === '') {
    passwordError.value = '密碼不能為空';
    return;
  }
  if (!newUser.value.selectedRole) {
    roleError.value = '請選擇角色';
    return;
  }

  try {
    const role = roleOptions.value.find((r) => r.id === newUser.value.selectedRole);
    if (!role) {
      roleError.value = '無效的角色';
      return;
    }

    const response = await addUser(newUser.value.name, newUser.value.email, newUser.value.password, [role]);

    if (response.status === 200) {
      ElNotification({
        title: '成功',
        message: '使用者增加成功',
        type: 'success',
      });
      users.value.push({
        name: newUser.value.name,
        email: newUser.value.email,
      });
      newUser.value = { name: '', email: '', password: '', selectedRole: null };
    } else {
      ElNotification({
        title: '錯誤',
        message: '使用者增加失敗',
        type: 'error',
      });
    }
  } catch (error) {
    ElNotification({
      title: '系統異常',
      message: '系統異常，請稍後再試',
      type: 'error',
    });
  }
};

// 頁面載入時獲取使用者清單（可選）
onMounted(() => {
  // 這裡可以從後端獲取資料
});
</script>

<style scoped>
.label-wrapper {
  text-align: right;
  line-height: 40px; /* 與輸入框高度對齊 */
}
</style>