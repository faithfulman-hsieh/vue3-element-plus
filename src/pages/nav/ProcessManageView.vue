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
            <el-input v-model="newProcess.name" placeholder="輸入流程名稱" :disabled="loading" />
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
              :show-file-list="false"
              accept=".bpmn,.xml"
              :disabled="loading"
            >
              <el-button type="primary">選擇文件</el-button>
              <span v-if="newProcess.file" class="file-name">{{ newProcess.file.name }}</span>
            </el-upload>
          </el-form-item>
        </el-col>
        <el-col :span="6"></el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="16">
          <el-form-item label-width="0" class="button-form-item">
            <el-button type="primary" @click="deployProcess" :disabled="loading || !newProcess.name || !newProcess.file">
              部署流程
            </el-button>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <!-- 流程定義列表 -->
    <el-row :gutter="20">
      <el-col :span="22" :offset="1">
        <el-table :data="processes" class="table-card" border stripe :loading="loading">
          <el-table-column prop="name" label="流程名稱" min-width="100" />
          <el-table-column prop="version" label="版本" min-width="60" />
          <el-table-column label="狀態" min-width="60">
            <template #default="{ row }">
              {{ row.status === 'active' ? '啟用' : '停用' }}
            </template>
          </el-table-column>
          <el-table-column prop="deploymentTime" label="部署時間" min-width="100" />
          <el-table-column label="操作" min-width="250">
            <template #default="{ row }">
              <div class="action-buttons">
                <el-button type="info" size="small" @click="showProcessDiagram(row.id)">
                  查看流程圖
                </el-button>
                <el-button
                  :type="row.status === 'active' ? 'warning' : 'success'"
                  size="small"
                  @click="toggleProcessStatus(row.id)"
                >
                  {{ row.status === 'active' ? '停用' : '啟用' }}
                </el-button>
                <el-button
                  type="primary"
                  size="small"
                  @click="showStartProcessDialog(row.processDefinitionId)"
                  :disabled="row.status !== 'active' || loading"
                >
                  啟動流程
                </el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </el-col>
    </el-row>

    <!-- 流程圖對話框 -->
    <el-dialog title="流程圖" v-model="dialogVisible" width="80%">
      <bpmn-viewer :bpmnXml="currentBpmnData?.bpmnXml" :currentTask="currentBpmnData?.currentTask" />
    </el-dialog>

    <!-- 啟動流程對話框 -->
    <el-dialog title="啟動流程" v-model="startDialogVisible" width="50%">
      <el-form :model="startForm" class="form-card">
        <el-row v-for="field in formFields" :key="field.key" :gutter="20">
          <el-col :span="8">
            <div class="label-wrapper">{{ field.label }}</div>
          </el-col>
          <el-col :span="8">
            <el-form-item :prop="field.key" label-width="0">
              <el-input
                v-if="field.type === 'text'"
                v-model="startForm.variables[field.key]"
                :placeholder="'輸入' + field.label"
                :disabled="loading"
              />
              <el-select
                v-if="field.type === 'select'"
                v-model="startForm.variables[field.key]"
                :placeholder="'選擇' + field.label"
                :disabled="loading"
              >
                <el-option
                  v-for="option in field.options"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6"></el-col>
        </el-row>
        <el-row :gutter="20" v-if="formFields.length === 0">
          <el-col :span="16">
            <p>此流程無需填寫表單，直接點擊確認即可啟動。</p>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="16">
            <el-form-item label-width="0" class="button-form-item">
              <el-button type="primary" @click="startProcess" :disabled="loading">
                確認啟動
              </el-button>
              <el-button @click="startDialogVisible = false" :disabled="loading">取消</el-button>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import BpmnViewer from '~/components/BpmnViewer.vue';
import { processApi } from '~/api/client';
import type { ProcessDefinition, ProcessRequest, FormField } from '~/api/models';
import { useUserStore } from '~/stores/userStore';
import { useRouter } from 'vue-router';

interface StartForm {
  processDefinitionId: string;
  variables: { [key: string]: string };
}

const newProcess = ref({ name: '', file: null as File | null });
const processes = ref<ProcessDefinition[]>([]);
const dialogVisible = ref(false);
const startDialogVisible = ref(false);
const currentBpmnData = ref<{ bpmnXml: string; currentTask: string | null } | null>(null);
const startForm = ref<StartForm>({ processDefinitionId: '', variables: {} });
const formFields = ref<FormField[]>([]);
const loading = ref(false);
const userStore = useUserStore();
const router = useRouter();

const fetchProcesses = async () => {
  try {
    loading.value = true;
    const response = await processApi.getAllDefinitions();
    processes.value = response.data || [];
    if (!processes.value.length) {
      ElMessage.warning('無可用流程定義');
    }
  } catch (error: any) {
    console.error('Failed to fetch processes:', error);
    ElMessage.error(error.response?.data?.message || '獲取流程定義失敗，請稍後重試');
  } finally {
    loading.value = false;
  }
};

const handleFileChange = (file: any) => {
  newProcess.value.file = file.raw;
};

const deployProcess = async () => {
  if (!newProcess.value.name || !newProcess.value.file) {
    ElMessage.warning('請填寫流程名稱並選擇 BPMN 文件');
    return;
  }

  try {
    loading.value = true;
    const request: ProcessRequest = {
      name: newProcess.value.name,
      file: newProcess.value.file,
    };
    const response = await processApi.deployProcess({ request });
    ElMessage.success(`流程部署成功，ID: ${response.data.id}`);
    newProcess.value = { name: '', file: null };
    await fetchProcesses();
  } catch (error: any) {
    console.error('Failed to deploy process:', error);
    const errorMessage = error.response?.data?.message || '流程部署失敗，請檢查文件格式或稍後重試';
    ElMessage.error(errorMessage);
  } finally {
    loading.value = false;
  }
};

const showProcessDiagram = async (id: string) => {
  try {
    loading.value = true;
    const response = await processApi.getProcessDefinitionDiagram({ id });
    if (!response.data.bpmnXml) {
      ElMessage.warning('該流程定義尚未有流程圖可顯示');
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

const toggleProcessStatus = async (id: string) => {
  try {
    loading.value = true;
    const response = await processApi.toggleProcessStatus({ id });
    ElMessage.success(`流程已${response.data.status === 'active' ? '啟用' : '停用'}`);
    await fetchProcesses();
  } catch (error: any) {
    console.error('Failed to toggle process status:', error);
    ElMessage.error(error.response?.data?.message || '狀態切換失敗，請稍後重試');
  } finally {
    loading.value = false;
  }
};

const showStartProcessDialog = async (processDefinitionId: string) => {
  if (!userStore.isLoggedIn) {
    ElMessage.error('請先登錄');
    router.push('/login');
    return;
  }

  startForm.value = { processDefinitionId, variables: {} };
  formFields.value = [];

  try {
    loading.value = true;
    const response = await processApi.getProcessFormFields({ id: processDefinitionId });
    formFields.value = response.data || [];
    formFields.value.forEach(field => {
      startForm.value.variables[field.key] = '';
    });
    startDialogVisible.value = true;
  } catch (error: any) {
    console.error('Failed to fetch form fields:', error);
    ElMessage.error(error.response?.data?.message || '獲取表單字段失敗，請稍後重試');
  } finally {
    loading.value = false;
  }
};

const startProcess = async () => {
  for (const field of formFields.value) {
    if (!startForm.value.variables[field.key]?.trim()) {
      ElMessage.warning(`請填寫${field.label}`);
      return;
    }
  }

  try {
    loading.value = true;
    const processRequest: ProcessRequest = {
      processDefinitionId: startForm.value.processDefinitionId,
      variables: startForm.value.variables,
    };
    const response = await processApi.startProcess({ processRequest });
    ElMessage.success(`流程啟動成功，ID: ${response.data.id}`);
    startDialogVisible.value = false;
    startForm.value = { processDefinitionId: '', variables: {} };
    formFields.value = [];
  } catch (error: any) {
    console.error('Failed to start process:', error);
    ElMessage.error(error.response?.data?.message || '流程啟動失敗，請稍後重試');
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
.file-name {
  margin-left: 10px;
  color: #606266;
}
</style>