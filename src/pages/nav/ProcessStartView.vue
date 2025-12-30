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

    <el-dialog 
      v-model="startDialogVisible" 
      :title="`發起申請：${currentProcessName}`" 
      width="600px" 
      destroy-on-close
    >
      <div v-loading="formLoading" class="dialog-body">
        
        <DynamicForm 
          v-if="formFields.length > 0" 
          ref="dynamicFormRef"
          :fields="formFields"
          @submit="handleStartProcess"
          @cancel="startDialogVisible = false"
          submitText="確認送出"
        />

        <div v-else class="no-form-state">
          <el-result
            icon="info"
            title="無需填寫表單"
            sub-title="此流程定義中未包含啟動表單，您可以直接發起。"
          >
            <template #extra>
              <el-button @click="startDialogVisible = false">取消</el-button>
              <el-button type="primary" @click="handleFallbackStart">直接啟動</el-button>
            </template>
          </el-result>
          
          <el-collapse v-model="activeCollapse" class="mt-4">
            <el-collapse-item title="進階參數設定 (Optional)" name="1">
              <el-input 
                v-model="fallbackJson" 
                type="textarea" 
                :rows="3" 
                placeholder='JSON 格式參數，如：{"amount": 5000}' 
              />
            </el-collapse-item>
          </el-collapse>
        </div>

      </div>
    </el-dialog>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { VideoPlay } from '@element-plus/icons-vue'
import { processApi } from '../../api/client'
import DynamicForm from '../../components/DynamicForm.vue' // 引入動態表單

const loading = ref(false)
const formLoading = ref(false)
const processList = ref<any[]>([])

const startDialogVisible = ref(false)
const currentProcessId = ref('')
const currentProcessName = ref('')
const formFields = ref<any[]>([])
const activeCollapse = ref([]) // 控制進階參數折疊
const fallbackJson = ref('{}')

// 載入流程清單
const loadProcesses = async () => {
  loading.value = true
  try {
    const res = await processApi.getAllDefinitions()
    // 只顯示 active (已啟用) 的流程
    processList.value = (res.data || []).filter((p: any) => p.status !== 'suspended')
  } catch (err) {
    ElMessage.error('載入流程列表失敗')
  } finally {
    loading.value = false
  }
}

// 開啟對話框並讀取表單定義
const openStartDialog = async (row: any) => {
  currentProcessId.value = row.id
  currentProcessName.value = row.name
  startDialogVisible.value = true
  formLoading.value = true
  formFields.value = []
  fallbackJson.value = '{}'
  activeCollapse.value = []

  try {
    // 1. 嘗試從後端獲取 BPMN 定義的表單
    const res = await processApi.getProcessFormFields({ id: row.id })
    
    if (res.data && res.data.length > 0) {
      formFields.value = res.data
    } else {
      // 2. 如果後端沒定義 (空陣列)，為了 Demo 方便，手動注入常用流程的表單
      if (row.key === 'purchaseProcess') {
         formFields.value = [
           { key: 'itemName', label: '採購項目名稱', type: 'text', required: true, value: '辦公設備' },
           { key: 'amount', label: '預計金額', type: 'number', required: true, value: 5000 }
         ]
      } else if (row.key === 'leaveProcess') {
         formFields.value = [
           { key: 'day', label: '請假天數', type: 'number', required: true, value: 1 },
           { key: 'reason', label: '請假事由', type: 'text', required: true, value: '特休' }
         ]
      }
      // 如果都不是，則 formFields 維持空，介面會顯示「直接啟動」
    }
  } catch (err) {
    console.error(err)
    ElMessage.warning('讀取表單定義失敗，將進入基本模式')
  } finally {
    formLoading.value = false
  }
}

// 處理動態表單送出
const handleStartProcess = async (formData: any) => {
  try {
    formLoading.value = true
    await processApi.startProcess({
      processRequest: {
        processDefinitionId: currentProcessId.value,
        variables: formData
      }
    })
    ElMessage.success('申請已成功送出！')
    startDialogVisible.value = false
  } catch (err: any) {
    console.error(err)
    ElMessage.error('啟動失敗: ' + (err.response?.data?.message || '未知錯誤'))
  } finally {
    formLoading.value = false
  }
}

// 處理無表單時的強制啟動
const handleFallbackStart = async () => {
  try {
    const variables = JSON.parse(fallbackJson.value)
    await handleStartProcess(variables)
  } catch (e) {
    ElMessage.error('JSON 參數格式錯誤')
  }
}

onMounted(() => {
  loadProcesses()
})
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
  margin: 0 0 8px 0;
  font-size: 24px;
  color: var(--el-text-color-primary);
}
.subtitle {
  font-size: 14px;
  color: var(--el-text-color-secondary);
}
.mb-4 {
  margin-bottom: 20px;
}
.mt-4 {
  margin-top: 20px;
}
.process-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  transition: all 0.3s;
  border-radius: 8px;
  border: 1px solid var(--el-border-color-lighter);
}
.process-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--el-box-shadow);
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
.dialog-body {
  min-height: 150px;
}
.no-form-state {
  padding: 10px 0;
}
</style>