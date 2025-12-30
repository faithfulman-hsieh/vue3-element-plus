<template>
  <div class="page-container">
    <div class="header">
      <h1 class="page-title">我的申請紀錄</h1>
      <span class="subtitle">查看您發起的所有申請與審核進度</span>
    </div>

    <div class="filter-bar">
      <el-input 
        v-model="searchKeyword" 
        placeholder="搜尋流程名稱..." 
        prefix-icon="Search"
        style="width: 300px"
        clearable
      />
    </div>

    <el-table :data="filteredList" class="table-card" border stripe v-loading="loading">
      <el-table-column prop="name" label="申請項目" min-width="150" />
      <el-table-column prop="startTime" label="申請時間" width="180" sortable />
      <el-table-column prop="currentTask" label="當前狀態" min-width="150">
        <template #default="{ row }">
          <el-tag :type="getStatusColor(row.currentTask)" effect="plain">
            {{ row.currentTask }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="assignee" label="當前處理人" width="120" />
      
      <el-table-column label="操作" width="120" align="center">
        <template #default="{ row }">
          <el-button type="primary" size="small" @click="showDetail(row)">
            查看進度
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog 
      v-model="dialogVisible" 
      title="申請詳情" 
      width="80%" 
      destroy-on-close
      top="5vh"
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
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import BpmnViewer from '../../components/BpmnViewer.vue'
import ProcessTimeline from '../../components/ProcessTimeline.vue'
import { processApi } from '../../api/client'

const loading = ref(false)
const list = ref<any[]>([])
const searchKeyword = ref('')

const dialogVisible = ref(false)
const currentInstanceId = ref('')
const currentBpmnData = ref<{ bpmnXml: string; currentTask: string | string[] | null } | null>(null)

const filteredList = computed(() => {
  return list.value.filter(item => {
    const matchName = item.name.toLowerCase().includes(searchKeyword.value.toLowerCase())
    return matchName
  })
})

const fetchMyRequests = async () => {
  loading.value = true
  try {
    const res = await processApi.getAllInstances()
    list.value = res.data || []
  } catch (err) {
    ElMessage.error('無法載入申請紀錄')
  } finally {
    loading.value = false
  }
}

const showDetail = async (row: any) => {
  try {
    currentInstanceId.value = row.id
    const res = await processApi.getProcessInstanceDiagram({ id: row.id })
    currentBpmnData.value = { 
      bpmnXml: res.data.bpmnXml, 
      currentTask: res.data.currentTask 
    }
    dialogVisible.value = true
  } catch (err) {
    ElMessage.error('載入詳情失敗')
  }
}

const getStatusColor = (status: string) => {
  if (status === 'Completed') return 'success'
  if (status.includes('駁回') || status.includes('拒絕')) return 'danger'
  return 'primary'
}

onMounted(() => {
  fetchMyRequests()
})
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
.filter-bar {
  margin-bottom: 20px;
  display: flex;
  justify-content: flex-end;
}
.table-card {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}
.dialog-content-wrapper {
  display: flex;
  gap: 20px;
  height: 65vh;
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