<!-- src/pages/nav/ProcessManageView.vue -->
<template>
    <div class="page-container">
        <h1 class="page-title">流程定義管理</h1>

        <!-- 上傳新流程 -->
        <el-form :model="newProcess" class="form-card">
            <el-row :gutter="20">
                <el-col :span="8">
                    <div class="label-wrapper">流程名稱</div>
                </el-col>
                <el-col :span="8">
                    <el-form-item prop="name" label-width="0">
                        <el-input v-model="newProcess.name" placeholder="輸入流程名稱" />
                    </el-form-item>
                </el-col>
                <el-col :span="6"></el-col>
            </el-row>
            <el-row :gutter="20">
                <el-col :span="8">
                    <div class="label-wrapper">BPMN 文件</div>
                </el-col>
                <el-col :span="8">
                    <el-form-item prop="file" label-width="0">
                        <el-upload
                                action=""
                                :auto-upload="false"
                                :on-change="handleFileChange"
                                accept=".bpmn,.xml"
                        >
                            <el-button type="primary">選擇文件</el-button>
                        </el-upload>
                    </el-form-item>
                </el-col>
                <el-col :span="6"></el-col>
            </el-row>
            <el-row :gutter="20">
                <el-col :span="16">
                    <el-form-item label-width="0" class="button-form-item">
                        <el-button type="primary" @click="deployProcess">部署流程</el-button>
                    </el-form-item>
                </el-col>
            </el-row>
        </el-form>

        <!-- 流程定義列表 -->
        <el-row :gutter="20">
            <el-col :span="22" :offset="1">
                <el-table :data="processes" class="table-card" border stripe>
                    <el-table-column prop="name" label="流程名稱" min-width="100" />
                    <el-table-column prop="version" label="版本" min-width="60" />
                    <el-table-column prop="status" label="狀態" min-width="60" />
                    <el-table-column prop="deployTime" label="部署時間" min-width="100" />
                    <el-table-column label="操作" min-width="200">
                        <template #default="{ row }">
                            <div class="action-buttons">
                                <el-button type="info" size="small" @click="showProcessDiagram(row.id)">
                                    查看流程圖
                                </el-button>
                                <el-button
                                        :type="row.status === '啟用' ? 'warning' : 'success'"
                                        size="small"
                                        @click="toggleProcessStatus(row.id)"
                                >
                                    {{ row.status === '啟用' ? '停用' : '啟用' }}
                                </el-button>
                            </div>
                        </template>
                    </el-table-column>
                </el-table>
            </el-col>
        </el-row>

        <!-- 流程圖對話框 -->
        <el-dialog title="流程圖" v-model="dialogVisible" width="80%">
            <bpmn-viewer :bpmnXml="currentBpmnData?.bpmnXml" />
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
    import { ref } from 'vue';
    import { ElMessage } from 'element-plus';
    import BpmnViewer from '~/components/BpmnViewer.vue';

    const newProcess = ref({ name: '', file: null as File | null });
    const processes = ref([
      // 模擬數據，後續替換為 API
      { id: 1, name: '請假流程', version: '1.0', status: '啟用', deployTime: '2025-04-14' },
      { id: 2, name: '報銷流程', version: '1.0', status: '停用', deployTime: '2025-04-13' },
    ]);
    const dialogVisible = ref(false);
    const currentBpmnData = ref<{ bpmnXml: string } | null>(null);

    const handleFileChange = (file: File) => {
      newProcess.value.file = file;
    };

    const deployProcess = () => {
      if (!newProcess.value.name || !newProcess.value.file) {
        ElMessage.warning('請填寫流程名稱並選擇 BPMN 文件');
        return;
      }
      // TODO: 調用 API 上傳流程
      ElMessage.success('流程部署成功');
      newProcess.value = { name: '', file: null };
      // 模擬新增流程
      processes.value.push({
        id: processes.value.length + 1,
        name: newProcess.value.name,
        version: '1.0',
        status: '啟用',
        deployTime: new Date().toISOString().split('T')[0],
      });
    };

    const showProcessDiagram = (id: number) => {
      // TODO: 調用 API 獲取流程圖
      currentBpmnData.value = { bpmnXml: '<xml>...</xml>' }; // 模擬 BPMN XML
      dialogVisible.value = true;
    };

    const toggleProcessStatus = (id: number) => {
      const process = processes.value.find((p) => p.id === id);
      if (process) {
        process.status = process.status === '啟用' ? '停用' : '啟用';
        // TODO: 調用 API 更新狀態
        ElMessage.success(`流程已${process.status}`);
      }
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