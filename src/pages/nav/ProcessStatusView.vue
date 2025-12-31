<template>
    <div class="page-container">
        <div class="header">
            <h1 class="page-title">全域流程監控</h1>
            <span class="subtitle">監控全系統流程執行狀況，進行異常處理與介入</span>
        </div>

        <div class="search-bar">
            <el-input 
                v-model="searchName" 
                placeholder="輸入流程名稱進行篩選..." 
                :prefix-icon="Search"
                clearable
                class="search-input"
            />
        </div>

        <el-row :gutter="20">
            <el-col :span="24">
                <el-table :data="filteredInstances" class="table-card" border stripe :loading="loading">
                    <el-table-column prop="name" label="流程名稱" min-width="100" />
                    <el-table-column prop="currentTask" label="當前階段" min-width="100" />
                    <el-table-column prop="assignee" label="執行者" min-width="60" />
                    <el-table-column prop="startTime" label="開始時間" min-width="100" />
                    <el-table-column label="操作" min-width="180" align="center">
                        <template #default="{ row }">
                            <div class="action-buttons">
                                <el-button type="info" size="small" @click="showProcessDiagram(row.id)">
                                    查看狀態
                                </el-button>
                                <el-button 
                                    type="warning" 
                                    size="small" 
                                    @click="openJumpDialog(row)"
                                    :disabled="row.currentTask === 'Completed' || row.currentTask === '流程已結束'"
                                >
                                    跳關
                                </el-button>
                            </div>
                        </template>
                    </el-table-column>
                </el-table>
            </el-col>
        </el-row>

        <el-dialog 
          title="流程執行狀態" 
          v-model="dialogVisible" 
          width="90%" 
          top="5vh"
          destroy-on-close
        >
            <div class="dialog-content-wrapper">
                <div class="diagram-panel">
                    <bpmn-viewer 
                        v-if="currentBpmnData"
                        :bpmnXml="currentBpmnData.bpmnXml" 
                        :currentTask="currentBpmnData.currentTask" 
                    />
                </div>
                <div class="timeline-panel">
                    <process-timeline 
                        v-if="currentInstanceId"
                        :instanceId="currentInstanceId" 
                    />
                </div>
            </div>
        </el-dialog>

        <el-dialog v-model="jumpDialogVisible" title="流程節點跳轉" width="600px" destroy-on-close>
            <div v-loading="formLoading">
                <el-form label-width="100px">
                    <el-form-item label="目標節點">
                        <el-select 
                            v-model="selectedTargetNode" 
                            placeholder="請選擇目標節點" 
                            style="width: 100%"
                            @change="handleNodeChange"
                        >
                            <el-option 
                                v-for="node in availableNodes" 
                                :key="node.id" 
                                :label="node.name" 
                                :value="node.id" 
                            />
                        </el-select>
                    </el-form-item>
                </el-form>

                <el-divider content-position="left">參數補齊</el-divider>

                <div v-if="jumpFormFields.length > 0">
                    <el-alert title="請填寫目標節點所需參數" type="success" :closable="false" class="mb-2" />
                    <DynamicForm 
                        :fields="jumpFormFields" 
                        submitText="確認跳轉"
                        @submit="handleDynamicJump"
                        @cancel="jumpDialogVisible = false"
                    />
                </div>

                <div v-else>
                    <el-form label-width="100px">
                        <el-form-item label="額外參數">
                            <el-input 
                                v-model="jumpVariablesJson" 
                                type="textarea" 
                                :rows="4" 
                                placeholder='JSON 格式，例如: {"amount": 5000}' 
                            />
                            <div class="tip-text">此節點未定義表單，若需傳遞變數請使用 JSON。</div>
                        </el-form-item>
                    </el-form>
                    <div style="text-align: right; margin-top: 20px;">
                        <el-button @click="jumpDialogVisible = false">取消</el-button>
                        <el-button type="primary" @click="handleManualJump">確認跳轉</el-button>
                    </div>
                </div>
            </div>
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { ElMessage } from 'element-plus';
import { Search } from '@element-plus/icons-vue'; // 引入放大鏡
import BpmnViewer from '../../components/BpmnViewer.vue';
import ProcessTimeline from '../../components/ProcessTimeline.vue';
import DynamicForm from '../../components/DynamicForm.vue';
import { processApi } from '../../api/client';
import type { ProcessInstance, FormField } from '../../api/models';

const searchName = ref('');
const processInstances = ref<ProcessInstance[]>([]); // 存放所有原始資料
const dialogVisible = ref(false);
const currentBpmnData = ref<{ bpmnXml: string; currentTask: string | string[] | null } | null>(null);
const currentInstanceId = ref('');
const loading = ref(false);

// 跳關相關狀態
const jumpDialogVisible = ref(false);
const formLoading = ref(false);
const selectedTargetNode = ref('');
const availableNodes = ref<any[]>([]);
const currentJumpInstanceId = ref('');
const jumpFormFields = ref<FormField[]>([]); 
const jumpVariablesJson = ref('{}');   

// ★★★ Computed: 前端即時過濾 ★★★
const filteredInstances = computed(() => {
    if (!searchName.value.trim()) {
        return processInstances.value;
    }
    const keyword = searchName.value.trim().toLowerCase();
    return processInstances.value.filter(instance => 
        instance.name.toLowerCase().includes(keyword)
    );
});

const fetchProcesses = async () => {
  try {
    loading.value = true;
    const response = await processApi.getAllInstances();
    // 儲存完整資料，不在此處過濾
    processInstances.value = response.data || [];
  } catch (error: any) {
    ElMessage.error('獲取流程實例失敗');
  } finally {
    loading.value = false;
  }
};

const showProcessDiagram = async (id: string) => {
  try {
    loading.value = true;
    currentInstanceId.value = id;
    const response = await processApi.getProcessInstanceDiagram({ id });
    if (!response.data.bpmnXml) {
      ElMessage.warning('該流程實例尚未有流程圖可顯示');
      return;
    }
    currentBpmnData.value = { 
      bpmnXml: response.data.bpmnXml, 
      currentTask: response.data.currentTask 
    };
    dialogVisible.value = true;
  } catch (error: any) {
    ElMessage.error('獲取流程圖失敗');
  } finally {
    loading.value = false;
  }
};

const openJumpDialog = async (row: any) => {
    currentJumpInstanceId.value = row.id;
    selectedTargetNode.value = '';
    availableNodes.value = [];
    jumpFormFields.value = [];
    jumpVariablesJson.value = '{}';
    jumpDialogVisible.value = true;
    
    try {
        const res = await processApi.getFlowNodes({ processInstanceId: row.id });
        availableNodes.value = res.data;
    } catch (err: any) {
        ElMessage.warning(err.response?.data?.message || '無法讀取流程節點');
    }
};

const handleNodeChange = async (nodeId: string) => {
    if (!nodeId) return;
    formLoading.value = true;
    jumpFormFields.value = [];
    jumpVariablesJson.value = '{}';

    try {
        const res = await processApi.getNodeFormFields(currentJumpInstanceId.value, nodeId);
        jumpFormFields.value = res.data || [];
    } catch (err) {
        console.error(err);
    } finally {
        formLoading.value = false;
    }
};

const handleDynamicJump = async (formData: any) => {
    await executeJump(formData);
};

const handleManualJump = async () => {
    let variables = {};
    try {
        if (jumpVariablesJson.value.trim()) {
            variables = JSON.parse(jumpVariablesJson.value);
        }
    } catch (e) {
        ElMessage.error('JSON 格式錯誤');
        return;
    }
    await executeJump(variables);
};

const executeJump = async (variables: any) => {
    try {
        await processApi.jumpToNode({
            processInstanceId: currentJumpInstanceId.value,
            targetNode: selectedTargetNode.value,
            variables: variables
        });
        ElMessage.success('跳轉成功');
        jumpDialogVisible.value = false;
        fetchProcesses(); 
    } catch (err: any) {
        const errorMsg = err.response?.data?.message || err.message || '跳轉失敗';
        ElMessage.error(errorMsg);
    }
};

onMounted(() => {
  fetchProcesses();
});
</script>

<style scoped>
.page-container {
  padding: 20px;
}
.header {
  margin-bottom: 20px;
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
.search-bar {
    margin-bottom: 20px;
    width: 300px; /* 限制寬度，保持簡潔 */
}
.action-buttons {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  flex-wrap: nowrap;
}
.dialog-content-wrapper {
  display: flex;
  gap: 20px;
  height: 70vh;
}
.diagram-panel {
  flex: 2;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;
  background-color: #f5f7fa;
}
.timeline-panel {
  flex: 1;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 10px;
  overflow-y: auto;
  background-color: #fff;
}
.mb-2 {
    margin-bottom: 10px;
}
.tip-text {
    font-size: 12px;
    color: #909399;
    line-height: 1.5;
    margin-top: 5px;
}
</style>