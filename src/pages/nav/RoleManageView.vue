<!-- src/pages/nav/RoleManageView.vue -->
<template>
    <div class="page-container">
        <h1 class="page-title">角色與權限管理</h1>

        <!-- 篩選 -->
        <el-form class="form-card">
            <el-row :gutter="20">
                <el-col :span="8">
                    <div class="label-wrapper">用戶名</div>
                </el-col>
                <el-col :span="8">
                    <el-form-item prop="searchName" label-width="0">
                        <el-input v-model="searchName" placeholder="輸入用戶名" />
                    </el-form-item>
                </el-col>
                <el-col :span="6"></el-col>
            </el-row>
            <el-row :gutter="20">
                <el-col :span="16">
                    <el-form-item label-width="0" class="button-form-item">
                        <el-button type="primary" @click="fetchUsers">查詢</el-button>
                    </el-form-item>
                </el-col>
            </el-row>
        </el-form>

        <!-- 用戶列表 -->
        <el-row :gutter="20">
            <el-col :span="22" :offset="1">
                <el-table :data="users" class="table-card" border stripe>
                    <el-table-column prop="username" label="用戶名" min-width="100" />
                    <el-table-column prop="name" label="姓名" min-width="100" />
                    <el-table-column prop="roles" label="角色" min-width="100" />
                    <el-table-column label="操作" min-width="100">
                        <template #default="{ row }">
                            <div class="action-buttons">
                                <el-button type="primary" size="small" @click="editRoles(row.id)">
                                    編輯角色
                                </el-button>
                            </div>
                        </template>
                    </el-table-column>
                </el-table>
            </el-col>
        </el-row>

        <!-- 編輯角色對話框 -->
        <el-dialog title="編輯角色" v-model="roleVisible" width="50%">
            <el-form :model="roleForm" class="form-card">
                <el-row :gutter="20">
                    <el-col :span="8">
                        <div class="label-wrapper">角色</div>
                    </el-col>
                    <el-col :span="8">
                        <el-form-item prop="roles" label-width="0">
                            <el-select v-model="roleForm.roles" multiple placeholder="選擇角色">
                                <el-option label="員工" value="employee" />
                                <el-option label="主管" value="manager" />
                                <el-option label="管理員" value="admin" />
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="6"></el-col>
                </el-row>
                <el-row :gutter="20">
                    <el-col :span="16">
                        <el-form-item label-width="0" class="button-form-item">
                            <el-button type="primary" @click="submitRoles">提交</el-button>
                        </el-form-item>
                    </el-col>
                </el-row>
            </el-form>
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
    import { ref } from 'vue';
    import { ElMessage } from 'element-plus';

    const searchName = ref('');
    const users = ref([
      // 模擬數據
      { id: 1, username: 'zhangsan', name: '張三', roles: '員工' },
      { id: 2, username: 'lisi', name: '李四', roles: '主管' },
    ]);
    const roleVisible = ref(false);
    const roleForm = ref({ roles: [] as string[] });

    const fetchUsers = () => {
      // TODO: 調用 API 查詢用戶
      ElMessage.success('查詢成功');
    };

    const editRoles = (id: number) => {
      const user = users.value.find((u) => u.id === id);
      if (user) {
        roleForm.value.roles = user.roles.split(',').map((r) => r.trim());
        roleVisible.value = true;
      }
    };

    const submitRoles = () => {
      if (!roleForm.value.roles.length) {
        ElMessage.warning('請選擇至少一個角色');
        return;
      }
      // TODO: 調用 API 更新角色
      ElMessage.success('角色更新成功');
      roleVisible.value = false;
    };
</script>

<style scoped>
    .label-wrapper {
      text-align: right;
      line-height: 40px;
    }
    .action-buttons {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: nowrap;
    }
</style>