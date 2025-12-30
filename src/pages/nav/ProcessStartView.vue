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

    <el-dialog v-model="startDialogVisible" title="填寫申請資訊" width="500px">
      <el-form label-width="100px">
        <el-form-item label="流程名稱">
          <el-input v-model="currentProcessName" disabled />
        </el-form-item>
        <el-form-item label="申請參數">
          <el-input
            v-model="startVariablesJson"
            type="textarea"
            :rows="6"
            placeholder='請輸入 JSON 格式，例如：{"amount": 5000}'
          />
          <div class="tip">提示：請輸入合法的 JSON 字串</div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="startDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleStartProcess">確認送出</el-button>
      </template>
    </el-dialog>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { VideoPlay } from '@element-plus/icons-vue'
import { processApi } from '../../api/client'

const loading = ref(false)
const processList = ref<any[]>([])

const startDialogVisible = ref(false)
const currentProcessId = ref('')
const currentProcessName = ref('')
const startVariablesJson = ref('')

const loadProcesses = async () => {
  loading.value = true
  try {
    const res = await processApi.getAllDefinitions()
    // 前端過濾掉掛起的流程 (或者顯示為維護中)
    processList.value = res.data || []
  } catch (err) {
    ElMessage.error('載入流程列表失敗')
  } finally {
    loading.value = false
  }
}

const openStartDialog = (row: any) => {
  currentProcessId.value = row.id
  currentProcessName.value = row.name
  
  // 針對演示流程給予預設值，方便測試
  if (row.key === 'purchaseProcess') {
    startVariablesJson.value = JSON.stringify({
      "itemName": "測試採購",
      "amount": 8000
    }, null, 2)
  } else if (row.key === 'leaveProcess') {
    startVariablesJson.value = JSON.stringify({
      "day": 3,
      "reason": "特休假"
    }, null, 2)
  } else {
    startVariablesJson.value = '{}'
  }
  startDialogVisible.value = true
}

const handleStartProcess = async () => {
  try {
    const variables = JSON.parse(startVariablesJson.value)
    
    // 呼叫 startProcess，注意參數結構需符合 API 定義
    await processApi.startProcess({
      processRequest: {
        processDefinitionId: currentProcessId.value,
        variables: variables
      }
    })
    
    ElMessage.success('申請已成功送出！')
    startDialogVisible.value = false
  } catch (err) {
    console.error(err)
    ElMessage.error('啟動失敗：請確認 JSON 格式正確')
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
.tip {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-top: 5px;
}
</style>