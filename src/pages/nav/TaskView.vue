<template>
  <div class="page-container">
    <h1 class="page-title">我的待辦任務</h1>

    <el-table 
      :data="tableData" 
      class="table-card" 
      border 
      stripe 
      v-loading="loading"
    >
      <el-table-column prop="name" label="當前任務" min-width="180" />

      <el-table-column prop="processName" label="流程名稱" min-width="150">
        <template #default="{ row }">
          <el-tag type="info">{{ row.processName }}</el-tag>
        </template>
      </el-table-column>

      <el-table-column prop="createTime" label="收到時間" min-width="180" />

      <el-table-column label="操作" width="180" fixed="right" align="center">
        <template #default="{ row }">
          <div class="action-buttons">
            <el-button type="primary" size="small" @click="handleProcess(row)">
              處理
            </el-button>
            
            <el-button type="info" size="small" @click="showStatus(row)">
              查看狀態
            </el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog
      v-model="dialogVisible"
      :title="currentTask?.name || '處理任務'"
      width="600px"
      destroy-on-close
      :close-on-click-modal="false"
    >
      <div v-loading="formLoading">
        <DynamicForm 
          v-if="formFields.length > 0"
          :fields="formFields"
          @submit="submitTask"
          @cancel="dialogVisible = false"
        />
        
        <div v-else class="empty-state">
          <p>此任務僅需確認即可完成。</p>
          <div style="text-align: right; margin-top: 20px;">
            <el-button @click="dialogVisible = false">取消</el-button>
            <el-button type="primary" @click="submitTask({})">確認完成</el-button>
          </div>
        </div>
      </div>
    </el-dialog>

    <el-dialog 
      v-model="bpmnDialogVisible" 
      title="流程狀態" 
      width="80%"
      destroy-on-close
    >
      <BpmnViewer 
        v-if="currentBpmnData"
        :bpmnXml="currentBpmnData.bpmnXml" 
        :currentTask="currentBpmnData.currentTask" 
      />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '../../stores/userStore'
import { taskApi, processApi } from '../../api/client' // 引入 processApi
import DynamicForm from '../../components/DynamicForm.vue'
import BpmnViewer from '../../components/BpmnViewer.vue' // 引入 BpmnViewer

interface TaskViewModel {
  id: string
  name: string
  processName: string
  assignee: string
  createTime: string
  processInstanceId: string // ★★★ 必須新增此欄位，才能查詢流程圖 ★★★
}

const tableData = ref<TaskViewModel[]>([])
const loading = ref(false)
const userStore = useUserStore()

// 辦理表單狀態
const dialogVisible = ref(false)
const currentTask = ref<TaskViewModel | null>(null)
const formLoading = ref(false)
const formFields = ref<any[]>([])

// 流程圖狀態
const bpmnDialogVisible = ref(false)
const currentBpmnData = ref<{ bpmnXml: string; currentTask: string | null } | null>(null)

// 載入任務列表
const loadTasks = async () => {
  loading.value = true
  try {
    const response = await taskApi.getMyTasks()
    tableData.value = response.data as unknown as TaskViewModel[]
  } catch (error: any) {
    console.error(error)
    ElMessage.error('無法載入任務列表')
  } finally {
    loading.value = false
  }
}

// 開啟辦理視窗
const handleProcess = async (row: TaskViewModel) => {
  if (!row.id) {
    ElMessage.error('錯誤：任務 ID 遺失')
    return
  }

  currentTask.value = row
  dialogVisible.value = true
  formLoading.value = true
  formFields.value = []
  
  try {
    const taskId = String(row.id)
    const response = await taskApi.getTaskForm({ id: taskId })
    formFields.value = response.data || []
  } catch (error: any) {
    console.error('API 呼叫錯誤:', error)
    ElMessage.error('無法讀取任務表單')
  } finally {
    formLoading.value = false
  }
}

// 3. 查看狀態 (顯示流程圖)
const showStatus = async (row: TaskViewModel) => {
  if (!row.processInstanceId) {
    ElMessage.warning('無法取得流程實例 ID，請確認後端是否已回傳 processInstanceId')
    return
  }

  loading.value = true
  try {
    // 呼叫 Process API 取得 XML 與當前節點
    const response = await processApi.getProcessInstanceDiagram({ id: row.processInstanceId })
    
    if (!response.data.bpmnXml) {
      ElMessage.warning('該流程實例尚未有流程圖可顯示')
      return
    }

    currentBpmnData.value = { 
      bpmnXml: response.data.bpmnXml, 
      currentTask: response.data.currentTask 
    }
    bpmnDialogVisible.value = true
  } catch (error: any) {
    console.error('Failed to fetch process diagram:', error)
    ElMessage.error('獲取流程圖失敗，請稍後重試')
  } finally {
    loading.value = false
  }
}

// 提交任務
const submitTask = async (formData: any) => {
  if (!currentTask.value?.id) return
  
  try {
    const taskId = String(currentTask.value.id)
    const requestData = { formData: formData }
    
    await taskApi.submitTaskForm({ 
      id: taskId, 
      taskFormRequest: requestData 
    })
    
    ElMessage.success('任務已完成')
    dialogVisible.value = false
    loadTasks()
  } catch (error: any) {
    console.error(error)
    ElMessage.error('提交失敗，請稍後再試')
  }
}

onMounted(() => {
  if (userStore.isLoggedIn) {
    loadTasks()
  }
})
</script>

<style scoped>
.page-container {
  padding: 20px;
}

.page-title {
  margin-bottom: 20px;
  text-align: center;
  font-size: 24px;
  color: #303133;
}

.table-card {
  width: 100%;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 8px; /* 按鈕之間的間距 */
}

.empty-state {
  padding: 20px;
  text-align: center;
  color: #606266;
}
</style>