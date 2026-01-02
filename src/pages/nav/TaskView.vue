<template>
  <div class="page-container">
    <div class="header">
      <h1 class="page-title">我的任務中心</h1>
      <span class="subtitle">處理指派給您的待辦事項，並查看歷史經手紀錄</span>
    </div>

    <el-tabs v-model="activeTab" type="card" @tab-change="handleTabChange" class="task-tabs">
      
      <el-tab-pane label="可認領任務" name="group">
        <el-table 
          :data="groupData" 
          class="table-card" 
          border 
          stripe 
          v-loading="loading"
        >
          <el-table-column prop="name" label="任務名稱" min-width="180" />
          <el-table-column prop="processName" label="流程名稱" min-width="150">
            <template #default="{ row }">
              <el-tag type="warning">{{ row.processName }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="收到時間" min-width="180" />
          <el-table-column label="操作" width="180" fixed="right" align="center">
            <template #default="{ row }">
              <div class="action-buttons">
                <el-button type="success" size="small" @click="handleClaim(row)">
                  認領
                </el-button>
                <el-button type="info" size="small" @click="showStatus(row)">
                  查看狀態
                </el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
        <el-empty v-if="!loading && groupData.length === 0" description="目前沒有可認領的群組任務" />
      </el-tab-pane>

      <el-tab-pane label="待辦任務" name="pending">
        <el-table 
          :data="pendingData" 
          class="table-card" 
          border 
          stripe 
          v-loading="loading"
        >
          <el-table-column prop="name" label="當前任務" min-width="180" />
          <el-table-column prop="processName" label="流程名稱" min-width="150">
            <template #default="{ row }">
              <el-tag type="success">{{ row.processName }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="收到時間" min-width="180" />
          <el-table-column label="操作" width="220" fixed="right" align="center">
            <template #default="{ row }">
              <div class="action-buttons">
                <el-button type="primary" size="small" @click="handleProcess(row)">
                  處理
                </el-button>
                <el-button type="warning" size="small" @click="handleUnclaim(row)" plain>
                  取消認領
                </el-button>
                <el-button type="info" size="small" @click="showStatus(row)">
                  狀態
                </el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <el-tab-pane label="經手任務" name="history">
        <el-table 
          :data="historyData" 
          class="table-card" 
          border 
          stripe 
          v-loading="loading"
        >
          <el-table-column prop="name" label="任務名稱" min-width="180" />
          <el-table-column prop="processName" label="流程名稱" min-width="150">
            <template #default="{ row }">
              <el-tag type="info">{{ row.processName }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="完成時間" min-width="180" />
          
          <el-table-column prop="currentAssignee" label="當前處理人員" min-width="150">
            <template #default="{ row }">
              <el-tag v-if="row.currentAssignee === '流程已結束'" type="info" effect="plain">
                流程已結束
              </el-tag>
              <el-tag v-else type="warning">
                {{ row.currentAssignee }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column label="操作" width="120" fixed="right" align="center">
            <template #default="{ row }">
              <div class="action-buttons">
                <el-button type="info" size="small" @click="showStatus(row)">
                  查看狀態
                </el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

    </el-tabs>

    <el-dialog
      v-model="dialogVisible"
      :title="currentTask?.name ? `任務處理：${currentTask.name}` : '任務處理'"
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
      title="流程執行狀態" 
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
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '../../stores/userStore'
import { taskApi, processApi } from '../../api/client'
import DynamicForm from '../../components/DynamicForm.vue'
import BpmnViewer from '../../components/BpmnViewer.vue'

interface TaskViewModel {
  id: string
  name: string
  processName: string
  assignee: string
  createTime: string
  processInstanceId: string
  currentAssignee?: string
}

const activeTab = ref('pending')
const pendingData = ref<TaskViewModel[]>([])
const groupData = ref<TaskViewModel[]>([]) // ★★★ 新增：群組任務資料 ★★★
const historyData = ref<TaskViewModel[]>([])
const loading = ref(false)
const userStore = useUserStore()

const dialogVisible = ref(false)
const currentTask = ref<TaskViewModel | null>(null)
const formLoading = ref(false)
const formFields = ref<any[]>([])

const bpmnDialogVisible = ref(false)
const currentBpmnData = ref<{ bpmnXml: string; currentTask: string | null } | null>(null)

const handleTabChange = (tabName: string | number) => {
  if (tabName === 'pending') {
    loadPendingTasks()
  } else if (tabName === 'history') {
    loadHistoryTasks()
  } else if (tabName === 'group') {
    loadGroupTasks() // ★★★ 新增：載入群組任務 ★★★
  }
}

const loadPendingTasks = async () => {
  loading.value = true
  try {
    const response = await taskApi.getMyTasks()
    pendingData.value = response.data as unknown as TaskViewModel[]
  } catch (error: any) {
    console.error(error)
    ElMessage.error('無法載入待辦任務')
  } finally {
    loading.value = false
  }
}

// ★★★ 新增：載入群組任務 ★★★
const loadGroupTasks = async () => {
  loading.value = true
  try {
    const response = await taskApi.getGroupTasks()
    groupData.value = response.data as unknown as TaskViewModel[]
  } catch (error: any) {
    console.error(error)
    ElMessage.error('無法載入可認領任務')
  } finally {
    loading.value = false
  }
}

// ★★★ 新增：認領任務邏輯 ★★★
const handleClaim = async (row: TaskViewModel) => {
  try {
    await taskApi.claimTask(row.id)
    ElMessage.success('認領成功，任務已移至待辦列表')
    // 重新載入目前分頁 (group)
    loadGroupTasks()
  } catch (error: any) {
    ElMessage.error('認領失敗，可能已被他人認領')
    loadGroupTasks()
  }
}

// ★★★ 新增：取消認領邏輯 ★★★
const handleUnclaim = async (row: TaskViewModel) => {
  try {
    await ElMessageBox.confirm('確定要取消認領此任務到群組池嗎？', '取消認領確認', {
      type: 'warning',
      confirmButtonText: '確定取消認領',
      cancelButtonText: '取消'
    })
    
    await taskApi.unclaimTask(row.id)
    ElMessage.success('任務已取消認領')
    loadPendingTasks()
  } catch (e) {
    // Cancelled or error
  }
}

const loadHistoryTasks = async () => {
  loading.value = true
  try {
    const response = await taskApi.getHistoryTasks()
    historyData.value = response.data as unknown as TaskViewModel[]
  } catch (error: any) {
    console.error(error)
    ElMessage.error('無法載入經手任務')
  } finally {
    loading.value = false
  }
}

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

const showStatus = async (row: TaskViewModel) => {
  if (!row.processInstanceId) {
    ElMessage.warning('無法取得流程實例 ID')
    return
  }
  loading.value = true
  try {
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
    console.error(error)
    ElMessage.error('獲取流程圖失敗')
  } finally {
    loading.value = false
  }
}

const submitTask = async (formData: any) => {
  if (!currentTask.value?.id) return
  try {
    const taskId = String(currentTask.value.id)
    const requestData = { formData: formData }
    await taskApi.submitTaskForm({ id: taskId, taskFormRequest: requestData })
    
    ElMessage.success('任務已完成')
    dialogVisible.value = false
    loadPendingTasks()
  } catch (error: any) {
    console.error(error)
    ElMessage.error('提交失敗，請稍後再試')
  }
}

onMounted(() => {
  if (userStore.isLoggedIn) {
    loadPendingTasks()
  }
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
.task-tabs {
  background-color: var(--el-bg-color); 
  padding: 10px;
  border-radius: 4px;
  border: 1px solid var(--el-border-color-light);
}
.table-card {
  width: 100%;
}
.action-buttons {
  display: flex;
  justify-content: center;
  gap: 8px;
}
.empty-state {
  padding: 20px;
  text-align: center;
  color: var(--el-text-color-regular);
}
</style>