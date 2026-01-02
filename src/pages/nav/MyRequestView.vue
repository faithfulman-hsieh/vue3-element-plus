<template>
    <div class="page-container">
        <div class="header">
            <h1 class="page-title">我的申請紀錄</h1>
            <span class="subtitle">查看您發起的所有申請與審核進度</span>
        </div>

        <el-form class="filter-form" :inline="true">
            <el-row :gutter="20" style="width: 100%">
                <el-col :span="16"></el-col>
                <el-col :span="8">
                    <el-form-item label-width="0" style="width: 100%; display: flex; justify-content: flex-end;">
                        <el-input 
                            v-model="searchName" 
                            placeholder="輸入流程名稱" 
                            :prefix-icon="Search" 
                            clearable
                        />
                    </el-form-item>
                </el-col>
            </el-row>
        </el-form>

        <el-table :data="filteredList" class="table-card" border stripe :loading="loading">
            <el-table-column prop="name" label="申請項目" min-width="150" />
            <el-table-column prop="startTime" label="申請時間" width="180" />
            <el-table-column prop="currentTask" label="當前狀態" min-width="150">
                <template #default="{ row }">
                    <el-tag :type="row.currentTask === 'Completed' ? 'success' : 'primary'">{{ row.currentTask }}</el-tag>
                </template>
            </el-table-column>
            <el-table-column prop="assignee" label="當前處理人" width="120" />
            <el-table-column label="操作" width="120" align="center">
                <template #default="{ row }">
                    <el-button type="primary" size="small" @click="showProcessDiagram(row.id)">
                        查看狀態
                    </el-button>
                </template>
            </el-table-column>
        </el-table>

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
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { Search } from '@element-plus/icons-vue';
import BpmnViewer from '../../components/BpmnViewer.vue';
import ProcessTimeline from '../../components/ProcessTimeline.vue';
import { processApi } from '../../api/client';
import type { ProcessInstance } from '../../api/models';

const searchName = ref('');
const processInstances = ref<ProcessInstance[]>([]);
const dialogVisible = ref(false);
const currentBpmnData = ref<{ bpmnXml: string; currentTask: string | string[] | null } | null>(null);
const currentInstanceId = ref('');
const loading = ref(false);

// 前端過濾邏輯
const filteredList = computed(() => {
    if (!searchName.value.trim()) return processInstances.value;
    return processInstances.value.filter(item => 
        item.name.toLowerCase().includes(searchName.value.toLowerCase())
    );
});

const fetchProcesses = async () => {
  try {
    loading.value = true;
    const response = await processApi.getMyProcessInstances();
    processInstances.value = response.data || [];
  } catch (error: any) {
    ElMessage.error('無法載入申請紀錄');
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
      ElMessage.warning('無法顯示流程圖');
      return;
    }
    currentBpmnData.value = { 
      bpmnXml: response.data.bpmnXml, 
      currentTask: response.data.currentTask 
    };
    dialogVisible.value = true;
  } catch (error: any) {
    ElMessage.error('獲取詳情失敗');
  } finally {
    loading.value = false;
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
.filter-form {
  margin-bottom: 10px;
}
.table-card {
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
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
  background-color: var(--el-fill-color-light);
}
.timeline-panel {
  flex: 1;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 10px;
  overflow-y: auto;
  background-color: var(--el-bg-color);
}
</style>