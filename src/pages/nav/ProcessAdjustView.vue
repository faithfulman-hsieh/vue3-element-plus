<!-- src/pages/nav/ProcessAdjustView.vue -->
<template>
    <div class="page-container">
        <h1 class="page-title">動態流程調整</h1>

        <!-- 篩選 -->
        <el-form class="form-card">
            <el-row :gutter="20">
                <el-col :span="8">
                    <div class="label-wrapper">流程名稱</div>
                </el-col>
                <el-col :span="8">
                    <el-form-item prop="searchName" label-width="0">
                        <el-input v-model="searchName" placeholder="輸入流程名稱" />
                    </el-form-item>
                </el-col>
                <el-col :span="6"></el-col>
            </el-row>
            <el-row :gutter="20">
                <el-col :span="16">
                    <el-form-item label-width="0" class="button-form-item">
                        <el-button type="primary" @click="fetchProcesses">查詢</el-button>
                    </el-form-item>
                </el-col>
            </el-row>
        </el-form>

        <!-- 流程實例列表 -->
        <el-row :gutter="20">
            <el-col :span="22" :offset="1">
                <el-table :data="processInstances" class="table-card" border stripe>
                    <el-table-column prop="name" label="流程名稱" min-width="100" />
                    <el-table-column prop="currentTask" label="當前階段" min-width="100" />
                    <el-table-column prop="assignee" label="執行者" min-width="60" />
                    <el-table-column prop="startTime" label="開始時間" min-width="100" />
                    <el-table-column label="操作" min-width="200">
                        <template #default="{ row }">
                            <div class="action-buttons">
                                <el-button type="warning" size="small" @click="reassignProcess(row.id)">
                                    重新分配
                                </el-button>
                                <el-button type="info" size="small" @click="showJumpDialog(row.id)">
                                    跳轉節點
                                </el-button>
                            </div>
                        </template>
                    </el-table-column>
                </el-table>
            </el-col>
        </el-row>

        <!-- 重新分配對話框 -->
        <el-dialog title="重新分配任務" v-model="reassignVisible" width="50%">
            <el-form :model="reassignForm" class="form-card">
                <el-row :gutter="20">
                    <el-col :span="8">
                        <div class="label-wrapper">新執行者</div>
                    </el-col>
                    <el-col :span="8">
                        <el-form-item prop="newAssignee" label-width="0">
                            <el-select v-model="reassignForm.newAssignee" placeholder="選擇執行者">
                                <el-option label="張三" value="zhangsan" />
                                <el-option label="李四" value="lisi" />
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="6"></el-col>
                </el-row>
                <el-row :gutter="20">
                    <el-col :span="16">
                        <el-form-item label-width="0" class="button-form-item">
                            <el-button type="primary" @click="submitReassign">提交</el-button>
                        </el-form-item>
                    </el-col>
                </el-row>
            </el-form>
        </el-dialog>

        <!-- 跳轉節點對話框 -->
        <el-dialog title="跳轉節點" v-model="jumpVisible" width="80%">
            <bpmn-viewer :bpmnXml="currentBpmnData?.bpmnXml" :currentTask="currentBpmnData?.currentTask" />
            <el-form :model="jumpForm" class="form-card">
                <el-row :gutter="20">
                    <el-col :span="8">
                        <div class="label-wrapper">目標節點</div>
                    </el-col>
                    <el-col :span="8">
                        <el-form-item prop="targetNode" label-width="0">
                            <el-select v-model="jumpForm.targetNode" placeholder="選擇節點">
                                <el-option label="主管審批" value="task_manager" />
                                <el-option label="人事確認" value="task_hr" />
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="6"></el-col>
                </el-row>
                <el-row :gutter="20">
                    <el-col :span="16">
                        <el-form-item label-width="0" class="button-form-item">
                            <el-button type="primary" @click="submitJump">提交</el-button>
                        </el-form-item>
                    </el-col>
                </el-row>
            </el-form>
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
    import { ref } from 'vue';
    import { ElMessage } from 'element-plus';
    import BpmnViewer from '~/components/BpmnViewer.vue';

    const searchName = ref('');
    const processInstances = ref([
      // 模擬數據
      { id: 1, name: '請假流程', currentTask: '主管審批', assignee: '張三', startTime: '2025-04-14' },
      { id: 2, name: '報銷流程', currentTask: '財務確認', assignee: '李四', startTime: '2025-04-13' },
    ]);
    const reassignVisible = ref(false);
    const jumpVisible = ref(false);
    const reassignForm = ref({ newAssignee: '' });
    const jumpForm = ref({ targetNode: '' });
    const currentBpmnData = ref<{ bpmnXml: string; currentTask: string } | null>(null);

    const fetchProcesses = () => {
      // TODO: 調用 API 查詢流程實例
      ElMessage.success('查詢成功');
    };

    const reassignProcess = (id: number) => {
      reassignForm.value.newAssignee = '';
      reassignVisible.value = true;
    };

    const submitReassign = () => {
      if (!reassignForm.value.newAssignee) {
        ElMessage.warning('請選擇新執行者');
        return;
      }
      // TODO: 調用 API 重新分配
      ElMessage.success('任務已重新分配');
      reassignVisible.value = false;
    };

    const showJumpDialog = (id: number) => {
      // TODO: 調用 API 獲取流程圖
      currentBpmnData.value = { bpmnXml: '<xml>...</xml>', currentTask: 'task_1' };
      jumpForm.value.targetNode = '';
      jumpVisible.value = true;
    };

    const submitJump = () => {
      if (!jumpForm.value.targetNode) {
        ElMessage.warning('請選擇目標節點');
        return;
      }
      // TODO: 調用 API 跳轉節點
      ElMessage.success('節點已跳轉');
      jumpVisible.value = false;
    };
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