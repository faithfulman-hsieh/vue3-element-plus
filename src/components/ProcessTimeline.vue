<template>
  <div class="timeline-container">
    <h3 class="timeline-title">流程歷程</h3>
    <el-timeline>
      <el-timeline-item
        v-for="(activity, index) in activities"
        :key="index"
        :type="getActivityTypeColor(activity)"
        :hollow="activity.status === 'Running'"
        :timestamp="activity.endTime || activity.startTime"
        placement="top"
      >
        <el-card class="timeline-card" shadow="hover">
          <div class="card-header">
            <span class="activity-name">{{ activity.activityName }}</span>
            <el-tag 
              v-if="activity.activityType === 'userTask'" 
              size="small" 
              :type="getStatusType(activity.status)" 
              effect="light"
            >
              {{ activity.status === 'Running' ? '進行中' : '已完成' }}
            </el-tag>
          </div>
          
          <div class="card-content">
            <div class="info-row" v-if="activity.assignee">
              <span class="label">處理人：</span>
              <span class="value">{{ activity.assignee }}</span>
            </div>
            <div class="info-row" v-if="activity.activityType === 'userTask' && activity.duration && activity.duration !== '-'">
              <span class="label">耗時：</span>
              <span class="value">{{ activity.duration }}</span>
            </div>
            
            <div v-if="activity.variables" class="variables-display">
               <div v-if="activity.activityName && activity.activityName.includes('經理') && activity.variables.managerComment" class="var-item">
                 <span class="var-label">經理意見:</span> {{ activity.variables.managerComment }}
               </div>
               <div v-if="activity.variables.action" class="var-item">
                 <span class="var-label">審核結果:</span> 
                 <el-tag size="small" :type="activity.variables.action === 'reject' ? 'danger' : 'success'">
                   {{ activity.variables.action }}
                 </el-tag>
               </div>
            </div>
          </div>
        </el-card>
      </el-timeline-item>
    </el-timeline>
    
    <el-empty v-if="activities.length === 0" description="暫無歷史紀錄" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
// ★★★ 修改 1: 引入 processApi 而不是 axios ★★★
import { processApi } from '../api/client'
import { ElMessage } from 'element-plus'

const props = defineProps({
  instanceId: {
    type: String,
    required: true
  }
})

const activities = ref<any[]>([])

const fetchHistory = async () => {
  if (!props.instanceId) return
  try {
    // ★★★ 修改 2: 改用 client 呼叫，確保路徑與 Token 正確 ★★★
    // 注意：參數必須包成物件 { id: props.instanceId }
    const res = await processApi.getProcessHistory({ id: props.instanceId })
    activities.value = res.data
  } catch (err: any) {
    console.error('獲取歷史失敗', err)
    // 顯示錯誤訊息以便除錯
    ElMessage.error(err.response?.data?.message || '無法載入歷程')
  }
}

const getActivityTypeColor = (activity: any) => {
  if (activity.status === 'Running') return 'primary'
  if (activity.activityType === 'startEvent') return 'info'
  if (activity.activityType === 'endEvent') return 'success'
  return 'primary'
}

const getStatusType = (status: string) => {
  return status === 'Running' ? 'primary' : 'success'
}

watch(() => props.instanceId, () => {
  fetchHistory()
})

onMounted(() => {
  fetchHistory()
})
</script>

<style scoped>
.timeline-container {
  padding: 10px;
  background-color: #fff;
  border-radius: 8px;
}
.timeline-title {
  margin-bottom: 20px;
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  border-left: 4px solid var(--el-color-primary);
  padding-left: 10px;
}
.timeline-card {
  border-radius: 8px;
  border: 1px solid var(--el-border-color-lighter);
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px dashed var(--el-border-color-lighter);
}
.activity-name {
  font-weight: bold;
  font-size: 15px;
}
.info-row {
  margin-bottom: 4px;
  font-size: 13px;
  color: var(--el-text-color-regular);
}
.label {
  color: var(--el-text-color-secondary);
  margin-right: 4px;
}
.variables-display {
  margin-top: 10px;
  background-color: var(--el-fill-color-light);
  padding: 8px;
  border-radius: 4px;
  font-size: 13px;
}
.var-item {
  margin-bottom: 4px;
}
.var-label {
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin-right: 4px;
}
</style>