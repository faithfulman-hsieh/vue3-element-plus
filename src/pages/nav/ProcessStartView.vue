<template>
    <div class="page-container">
        <div class="header">
            <h1 class="page-title">發起申請</h1>
            <span class="subtitle">選擇下方的流程開始新的申請作業</span>
        </div>

        <el-row :gutter="20" v-loading="loading">
            <el-col 
                :xs="24" :sm="12" :md="8" :lg="6" 
                v-for="proc in processList" 
                :key="proc.id"
                class="mb-4"
            >
                <el-card shadow="hover" class="process-card">
                    <template #header>
                        <div class="card-header">
                            <span class="process-name">{{ proc.name }}</span>
                            <el-tag size="small" :type="proc.status === 'active' ? 'success' : 'info'">
                                v{{ proc.version }}
                            </el-tag>
                        </div>
                    </template>
                    
                    <div class="card-content">
                        <p class="description">
                            {{ proc.description || '點擊下方按鈕填寫表單並送出申請。' }}
                        </p>
                        <div class="button-wrapper">
                            <el-button 
                                type="primary" 
                                round 
                                @click="openStartDialog(proc)"
                                :disabled="proc.status === 'suspended'"
                            >
                                <el-icon class="mr-1"><VideoPlay /></el-icon> 
                                {{ proc.status === 'suspended' ? '維護中' : '立即申請' }}
                            </el-button>
                        </div>
                    </div>
                </el-card>
            </el-col>
            
            <el-col :span="24" v-if="processList.length === 0 && !loading">
                <el-empty description="目前沒有可用的流程" />
            </el-col>
        </el-row>

        <el-dialog v-model="startDialogVisible" title="填寫申請資訊" width="600px" destroy-on-close>
            <div v-loading="formLoading">
                <DynamicForm 
                    v-if="formFields.length > 0" 
                    ref="dynamicFormRef"
                    :fields="formFields"
                    @submit="handleStartProcess"
                    @cancel="startDialogVisible = false"
                    submitText="確認送出"
                />

                <div v-else class="no-form-state">
                    <el-alert 
                        title="此流程未定義啟動表單" 
                        type="info" 
                        show-icon 
                        :closable="false"
                        class="mb-4"
                    >
                        您可以直接啟動，或輸入自訂參數。
                    </el-alert>
                    
                    <el-form label-width="100px">
                        <el-form-item label="啟動參數">
                            <el-input 
                                v-model="fallbackJson" 
                                type="textarea" 
                                :rows="4" 
                                placeholder='{"key": "value"}' 
                            />
                        </el-form-item>
                    </el-form>
                    
                    <div class="dialog-footer">
                        <el-button @click="startDialogVisible = false">取消</el-button>
                        <el-button type="primary" @click="handleFallbackStart">強制啟動</el-button>
                    </div>
                </div>
            </div>
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { VideoPlay } from '@element-plus/icons-vue';
import { processApi } from '../../api/client';
import DynamicForm from '../../components/DynamicForm.vue';

const loading = ref(false);
const formLoading = ref(false);
const processList = ref<any[]>([]);
const startDialogVisible = ref(false);
const currentProcessId = ref('');
const formFields = ref<any[]>([]);
const dynamicFormRef = ref();
const fallbackJson = ref('{}');

const loadProcesses = async () => {
    loading.value = true;
    try {
        const res = await processApi.getAllDefinitions();
        processList.value = (res.data || []).filter((p: any) => p.status !== 'suspended');
    } catch (err) {
        ElMessage.error('載入流程列表失敗');
    } finally {
        loading.value = false;
    }
};

const openStartDialog = async (row: any) => {
    currentProcessId.value = row.id;
    startDialogVisible.value = true;
    formLoading.value = true;
    formFields.value = [];
    fallbackJson.value = '{}';

    try {
        const res = await processApi.getProcessFormFields({ id: row.id });
        if (res.data && res.data.length > 0) {
            formFields.value = res.data;
        } else {
            if (row.key === 'purchaseProcess') {
                formFields.value = [
                    { key: 'itemName', label: '採購項目', type: 'text', required: true },
                    { key: 'amount', label: '金額', type: 'number', required: true }
                ];
            } else if (row.key === 'leaveProcess') {
                formFields.value = [
                    { key: 'day', label: '請假天數', type: 'number', required: true },
                    { key: 'reason', label: '請假事由', type: 'text', required: true }
                ];
            }
        }
    } catch (err) {
        ElMessage.warning('無法讀取表單定義，使用預設模式');
    } finally {
        formLoading.value = false;
    }
};

const handleStartProcess = async (formData: any) => {
    try {
        await processApi.startProcess({
            processRequest: {
                processDefinitionId: currentProcessId.value,
                variables: formData
            }
        });
        ElMessage.success('申請已送出');
        startDialogVisible.value = false;
    } catch (err: any) {
        ElMessage.error('啟動失敗');
    }
};

const handleFallbackStart = async () => {
    try {
        const variables = JSON.parse(fallbackJson.value);
        await handleStartProcess(variables);
    } catch (e) {
        ElMessage.error('JSON 格式錯誤');
    }
};

onMounted(() => {
    loadProcesses();
});
</script>

<style scoped>
.page-container {
    padding: 20px;
}
.header {
    margin-bottom: 30px;
    border-bottom: 1px solid var(--el-border-color-lighter);
    padding-bottom: 15px;
}
.page-title {
    margin: 0;
    font-size: 24px;
    color: var(--el-text-color-primary);
}
.subtitle {
    font-size: 14px;
    color: var(--el-text-color-secondary);
    margin-top: 5px;
    display: block;
}
.mb-4 {
    margin-bottom: 20px;
}
.process-card {
    height: 100%;
    display: flex;
    flex-direction: column;
    transition: all 0.3s;
}
.process-card:hover {
    transform: translateY(-5px);
}
.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}
.process-name {
    font-weight: bold;
    font-size: 16px;
}
.card-content {
    padding-top: 10px;
    display: flex;
    flex-direction: column;
    flex-grow: 1;
}
.description {
    font-size: 13px;
    color: var(--el-text-color-regular);
    margin-bottom: 20px;
    min-height: 40px;
}
.button-wrapper {
    text-align: right;
    margin-top: auto;
}
.mr-1 {
    margin-right: 4px;
}
.dialog-footer {
    text-align: right;
    margin-top: 20px;
}
.no-form-state {
    padding: 10px 0;
}
</style>