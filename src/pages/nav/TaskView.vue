<!-- src/pages/nav/TaskView.vue -->
<template>
    <div class="page-container">
        <h1 class="page-title">我的待辦任務</h1>

        <!-- 篩選 -->
        <el-form class="form-card">
            <el-row :gutter="20">
                <el-col :span="8">
                    <div class="label-wrapper">任務名稱</div>
                </el-col>
                <el-col :span="8">
                    <el-form-item prop="searchName" label-width="0">
                        <el-input v-model="searchName" placeholder="輸入任務名稱" />
                    </el-form-item>
                </el-col>
                <el-col :span="6"></el-col>
            </el-row>
            <el-row :gutter="20">
                <el-col :span="16">
                    <el-form-item label-width="0" class="button-form-item">
                        <el-button type="primary" @click="fetchTasks">查詢</el-button>
                    </el-form-item>
                </el-col>
            </el-row>
        </el-form>

        <!-- 任務列表 -->
        <el-row :gutter="20">
            <el-col :span="22" :offset="1">
                <el-table :data="tasks" class="table-card" border stripe>
                    <el-table-column prop="name" label="任務名稱" min-width="100" />
                    <el-table-column prop="processName" label="流程名稱" min-width="100" />
                    <el-table-column prop="assignee" label="執行者" min-width="60" />
                    <el-table-column prop="createTime" label="創建時間" min-width="100" />
                    <el-table-column label="操作" min-width="200">
                        <template #default="{ row }">
                            <div class="action-buttons">
                                <el-button type="info" size="small" @click="showTaskForm(row.id)">
                                    查看表單
                                </el-button>
                                <el-button type="warning" size="small" @click="reassignTask(row.id)">
                                    重新分配
                                </el-button>
                            </div>
                        </template>
                    </el-table-column>
                </el-table>
            </el-col>
        </el-row>

        <!-- 動態表單對話框 -->
        <el-dialog title="任務表單" v-model="formVisible" width="50%">
            <el-form :model="taskForm" class="form-card">
                <el-row v-for="field in taskFormFields" :key="field.key" :gutter="20">
                    <el-col :span="8">
                        <div class="label-wrapper">{{ field.label }}</div>
                    </el-col>
                    <el-col :span="8">
                        <el-form-item :prop="field.key" label-width="0">
                            <el-input v-if="field.type === 'text'" v-model="taskForm[field.key]" :placeholder="'輸入' + field.label" />
                            <el-select v-if="field.type === 'select'" v-model="taskForm[field.key]" :placeholder="'選擇' + field.label">
                                <el-option v-for="option in field.options" :key="option.value" :label="option.label" :value="option.value" />
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="6"></el-col>
                </el-row>
                <el-row :gutter="20">
                    <el-col :span="16">
                        <el-form-item label-width="0" class="button-form-item">
                            <el-button type="primary" @click="submitTaskForm">提交</el-button>
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
    const tasks = ref([
      // 模擬數據
      { id: 1, name: '審批請假', processName: '請假流程', assignee: '張三', createTime: '2025-04-14' },
      { id: 2, name: '確認報銷', processName: '報銷流程', assignee: '李四', createTime: '2025-04-13' },
    ]);
    const formVisible = ref(false);
    const taskForm = ref({});
    const taskFormFields = ref([] as { key: string; label: string; type: string; options?: { label: string; value: string }[] }[]);

    const fetchTasks = () => {
      // TODO: 調用 API 查詢任務
      ElMessage.success('查詢成功');
    };

    const showTaskForm = (id: number) => {
      // TODO: 調用 API 獲取表單結構
      taskFormFields.value = [
        { key: 'reason', label: '請假原因', type: 'text' },
        { key: 'status', label: '審批結果', type: 'select', options: [
          { label: '通過', value: 'approve' },
          { label: '拒絕', value: 'reject' },
        ]},
      ];
      taskForm.value = { reason: '', status: '' };
      formVisible.value = true;
    };

    const submitTaskForm = () => {
      // TODO: 調用 API 提交表單
      ElMessage.success('表單提交成功');
      formVisible.value = false;
    };

    const reassignTask = (id: number) => {
      // TODO: 調用 API 重新分配
      ElMessage.success('任務已重新分配');
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