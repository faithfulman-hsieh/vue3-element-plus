<!-- src/pages/nav/ProcessStatusView.vue -->
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
    import { ref } from 'vue';
    import { ElMessage } from 'element-plus';
    import BpmnViewer from '~/components/BpmnViewer.vue';

    const searchName = ref('');
    const processInstances = ref([
      // 模擬數據
      { id: 1, name: '請假流程', currentTask: '主管審批', assignee: '張三', startTime: '2025-04-14' },
      { id: 2, name: '報銷流程', currentTask: '財務確認', assignee: '李四', startTime: '2025-04-13' },
    ]);
    const dialogVisible = ref(false);
    const currentBpmnData = ref<{ bpmnXml: string; currentTask: string } | null>(null);

    const fetchProcesses = () => {
      // TODO: 調用 API 查詢流程實例
      ElMessage.success('查詢成功');
    };

    const showProcessDiagram = (id: number) => {
      // TODO: 調用 API 獲取流程圖
      currentBpmnData.value = { bpmnXml: '<xml>...</xml>', currentTask: 'task_1' };
      dialogVisible.value = true;
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