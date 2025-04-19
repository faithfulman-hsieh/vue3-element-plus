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
                                <el-button type="warning" size="small" @click="showReassignDialog(row.id)">
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

        <!-- 重新分配對話框 -->
        <el-dialog title="重新分配任務" v-model="reassignVisible" width="30%">
            <el-form :model="reassignForm" class="form-card">
                <el-row :gutter="20">
                    <el-col :span="8">
                        <div class="label-wrapper">新執行者</div>
                    </el-col>
                    <el-col :span="8">
                        <el-form-item prop="assignee" label-width="0">
                            <el-select v-model="reassignForm.assignee" placeholder="選擇用戶">
                                <el-option v-for="user in users" :key="user.value" :label="user.label" :value="user.value" />
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="6"></el-col>
                </el-row>
                <el-row :gutter="20">
                    <el-col :span="16">
                        <el-form-item label-width="0" class="button-form-item">
                            <el-button type="primary" @click="reassignTask">確認</el-button>
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
import { taskApi } from '~/api/client';
import type { Task } from '~/api/models';

const searchName = ref('');
const tasks = ref<Task[]>([]);
const formVisible = ref(false);
const taskForm = ref({});
const taskFormFields = ref([] as { key: string; label: string; type: string; options?: { label: string; value: string }[] }[]);
const reassignVisible = ref(false);
const reassignForm = ref({ assignee: '', taskId: '' });
const users = ref([
    { label: '張三', value: 'zhangsan' },
    { label: '李四', value: 'lisi' },
]);

const fetchTasks = async () => {
    try {
        const response = await taskApi.getMyTasks();
        tasks.value = response.data.filter(task => 
            !searchName.value || task.name?.toLowerCase().includes(searchName.value.toLowerCase())
        );
        ElMessage.success('查詢成功');
    } catch (error) {
        ElMessage.error('查詢任務失敗');
        console.error(error);
    }
};

const showTaskForm = async (id: string) => {
    try {
        const response = await taskApi.getTaskForm({ id });
        taskFormFields.value = response.data;
        taskForm.value = {};
        taskFormFields.value.forEach(field => {
            taskForm.value[field.key] = '';
        });
        formVisible.value = true;
    } catch (error) {
        ElMessage.error('獲取表單失敗');
        console.error(error);
    }
};

const submitTaskForm = async () => {
    try {
        const taskId = tasks.value.find(t => t.id && taskFormFields.value.length > 0)?.id;
        if (!taskId) {
            throw new Error('無效的任務ID');
        }
        await taskApi.submitTaskForm({ id: taskId, taskFormRequest: { formData: taskForm.value } });
        ElMessage.success('表單提交成功');
        formVisible.value = false;
        await fetchTasks(); // 刷新任務列表
    } catch (error) {
        ElMessage.error('表單提交失敗');
        console.error(error);
    }
};

const showReassignDialog = (id: string) => {
    reassignForm.value = { assignee: '', taskId: id };
    reassignVisible.value = true;
};

const reassignTask = async () => {
    if (!reassignForm.value.assignee) {
        ElMessage.error('請選擇新執行者');
        return;
    }
    try {
        await taskApi.reassignTask({ 
            id: reassignForm.value.taskId, 
            taskReassignRequest: { assignee: reassignForm.value.assignee } 
        });
        ElMessage.success('任務已重新分配');
        reassignVisible.value = false;
        await fetchTasks(); // 刷新任務列表
    } catch (error) {
        ElMessage.error('任務重新分配失敗');
        console.error(error);
    }
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