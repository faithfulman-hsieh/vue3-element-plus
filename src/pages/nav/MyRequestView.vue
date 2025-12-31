<template>
    <div class="page-container">
        <div class="header">
            <h1 class="page-title">我的申請紀錄</h1>
            <span class="subtitle">查看個人發起的流程進度與歷程</span>
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
                    <el-table-column prop="currentTask" label="當前階段" min-width="100">
                        <template #default="{ row }">
                            <el-tag :type="getStatusType(row.currentTask)">{{ row.currentTask }}</el-tag>
                        </template>
                    </el-table-column>
                    <el-table-column prop="assignee" label="當前處理人" min-width="80" />
                    <el-table-column prop="startTime" label="申請時間" min-width="100" />
                    <el-table-column label="操作" min-width="100" align="center">
                        <template #default="{ row }">
                            <div class="action-buttons">
                                <el-button type="info" size="small" @click="showProcessDiagram(row.id)">
                                    查看狀態
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
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { ElMessage } from 'element-plus';
import { Search } from '@element-plus/icons-vue'; // 引入放大鏡
import BpmnViewer from '../../components/BpmnViewer.vue';
import ProcessTimeline from '../../components/ProcessTimeline.vue';
import { processApi } from '../../api/client';
import type { ProcessInstance } from '../../api/models';

const searchName = ref('');
const processInstances = ref<ProcessInstance[]>([]); // 原始資料
const loading = ref(false);

const dialogVisible = ref(false);
const currentBpmnData = ref<{ bpmnXml: string; currentTask: string | string[] | null } | null>(null);
const currentInstanceId = ref('');

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

const fetchMyRequests = async () => {
  try {
    loading.value = true;
    const response = await processApi.getMyProcessInstances();
    // 儲存完整資料
    processInstances.value = response.data || [];
  } catch (error: any) {
    console.error('Failed to fetch my requests:', error);
    ElMessage.error('獲取申請紀錄失敗');
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
    console.error('Failed to fetch process diagram:', error);
    ElMessage.error(error.response?.data?.message || '獲取流程圖失敗');
  } finally {
    loading.value = false;
  }
};

const getStatusType = (status: string) => {
    if (status === 'Completed' || status === '流程結束') return 'success';
    if (status === 'Reject' || status === '駁回') return 'danger';
    return 'primary';
};

onMounted(() => {
  fetchMyRequests();
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
    width: 300px;
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
</style>