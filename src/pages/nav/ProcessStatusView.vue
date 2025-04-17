<template>
    <div class="page-container">
        <h1 class="page-title">流程狀態查詢</h1>

        <!-- 篩選 -->
        <el-form class="form-card">
            <el-row :gutter="20">
                <el-col :span="8">
                    <div class="label-wrapper">流程名稱</div>
                </el-col>
                <el-col :span="8">
                    <el-form-item prop="searchName" label-width="0">
                        <el-input v-model="searchName" placeholder="輸入流程名稱" :disabled="loading" />
                    </el-form-item>
                </el-col>
                <el-col :span="6"></el-col>
            </el-row>
            <el-row :gutter="20">
                <el-col :span="16">
                    <el-form-item label-width="0" class="button-form-item">
                        <el-button type="primary" @click="fetchProcesses" :disabled="loading">查詢</el-button>
                    </el-form-item>
                </el-col>
            </el-row>
        </el-form>

        <!-- 流程實例列表 -->
        <el-row :gutter="20">
            <el-col :span="22" :offset="1">
                <el-table :data="processInstances" class="table-card" border stripe :loading="loading">
                    <el-table-column prop="name" label="流程名稱" min-width="100" />
                    <el-table-column prop="currentTask" label="當前階段" min-width="100" />
                    <el-table-column prop="assignee" label="執行者" min-width="60" />
                    <el-table-column prop="startTime" label="開始時間" min-width="100" />
                    <el-table-column label="操作" min-width="100">
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

        <!-- 流程圖對話框 -->
        <el-dialog title="流程狀態" v-model="dialogVisible" width="80%">
            <bpmn-viewer :bpmnXml="currentBpmnData?.bpmnXml" :currentTask="currentBpmnData?.currentTask" />
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import BpmnViewer from '~/components/BpmnViewer.vue';
import { processApi } from '~/api/client';
import type { ProcessInstance } from '~/api/models';

const searchName = ref('');
const processInstances = ref<ProcessInstance[]>([]);
const dialogVisible = ref(false);
const currentBpmnData = ref<{ bpmnXml: string; currentTask: string | null } | null>(null);
const loading = ref(false);

const fetchProcesses = async () => {
  try {
    loading.value = true;
    const response = await processApi.getAllInstances();
    let instances = response.data || [];
    
    // 根據流程名稱篩選
    if (searchName.value.trim()) {
      instances = instances.filter(instance => 
        instance.name.toLowerCase().includes(searchName.value.trim().toLowerCase())
      );
    }
    
    processInstances.value = instances;
    if (!processInstances.value.length) {
      ElMessage.warning('無符合條件的流程實例');
    } else {
      ElMessage.success('查詢成功');
    }
  } catch (error: any) {
    console.error('Failed to fetch process instances:', error);
    ElMessage.error(error.response?.data?.message || '獲取流程實例失敗，請稍後重試');
  } finally {
    loading.value = false;
  }
};

const showProcessDiagram = async (id: string) => {
  try {
    loading.value = true;
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
    ElMessage.error(error.response?.data?.message || '獲取流程圖失敗，請稍後重試');
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchProcesses();
});
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