<template>
    <div class="page-container">
        <h1 class="page-title">流程動態調整</h1>

        <!-- 篩選 -->
        <el-form class="form-card">
            <el-row :gutter="20">
                <el-col :span="8">
                    <div class="label-wrapper">流程名稱</div>
                </el-col>
                <el-col :span="8">
                    <el-form-item prop="searchName" label-width="0">
                        <el-input v-model="searchName" placeholder="輸入流程名稱" :disabled="loading" />
                    </el-form-item>
                </el-col>
                <el-col :span="6"></el-col>
            </el-row>
            <el-row :gutter="20">
                <el-col :span="16">
                    <el-form-item label-width="0" class="button-form-item">
                        <el-button type="primary" @click="fetchProcesses" :disabled="loading">查詢</el-button>
                    </el-form-item>
                </el-col>
            </el-row>
        </el-form>

        <!-- 流程實例列表 -->
        <el-row :gutter="20">
            <el-col :span="22" :offset="1">
                <el-table :data="processInstances" class="table-card" border stripe :loading="loading">
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
                            <el-select v-model="reassignForm.newAssignee" placeholder="選擇執行者" :disabled="loading">
                                <el-option v-for="user in users" :key="user.value" :label="user.label" :value="user.value" />
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="6"></el-col>
                </el-row>
                <el-row :gutter="20">
                    <el-col :span="16">
                        <el-form-item label-width="0" class="button-form-item">
                            <el-button type="primary" @click="submitReassign" :disabled="loading">提交</el-button>
                            <el-button @click="reassignVisible = false" :disabled="loading">取消</el-button>
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
                            <el-select v-model="jumpForm.targetNode" placeholder="選擇節點" :disabled="loading">
                                <el-option v-for="node in nodes" :key="node.id" :label="node.name" :value="node.id" />
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="6"></el-col>
                </el-row>
                <el-row :gutter="20">
                    <el-col :span="16">
                        <el-form-item label-width="0" class="button-form-item">
                            <el-button type="primary" @click="submitJump" :disabled="loading">提交</el-button>
                            <el-button @click="jumpVisible = false" :disabled="loading">取消</el-button>
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
import type { ProcessInstance, FlowNode, User } from '~/api/models';

const searchName = ref('');
const processInstances = ref<ProcessInstance[]>([]);
const reassignVisible = ref(false);
const jumpVisible = ref(false);
const reassignForm = ref({ processInstanceId: '', newAssignee: '' });
const jumpForm = ref({ processInstanceId: '', targetNode: '' });
const currentBpmnData = ref<{ bpmnXml: string; currentTask: string | null } | null>(null);
const users = ref<User[]>([]);
const nodes = ref<FlowNode[]>([]);
const loading = ref(false);

const fetchProcesses = async () => {
    try {
        loading.value = true;
        const response = await processApi.getAllInstances();
        let instances = response.data || [];
        if (searchName.value.trim()) {
            instances = instances.filter(instance =>
                instance.name.toLowerCase().includes(searchName.value.trim().toLowerCase())
            );
        }
        processInstances.value = instances;
        if (!processInstances.value.length) {
            ElMessage.warning('無符合條件的流程實例');
        } else {
            ElMessage.success('查詢成功');
        }
    } catch (error: any) {
        console.error('Failed to fetch process instances:', error);
        ElMessage.error(error.response?.data?.message || '獲取流程實例失敗，請稍後重試');
    } finally {
        loading.value = false;
    }
};

const fetchUsers = async () => {
    try {
        const response = await processApi.getUsers();
        users.value = response.data || [];
    } catch (error: any) {
        console.error('Failed to fetch users:', error);
        ElMessage.error(error.response?.data?.message || '獲取用戶列表失敗，請稍後重試');
    }
};

const fetchNodes = async (processInstanceId: string) => {
    try {
        const response = await processApi.getFlowNodes({ processInstanceId });
        nodes.value = response.data || [];
    } catch (error: any) {
        console.error('Failed to fetch nodes:', error);
        ElMessage.error(error.response?.data?.message || '獲取節點列表失敗，請稍後重試');
    }
};

const reassignProcess = async (id: string) => {
    reassignForm.value = { processInstanceId: id, newAssignee: '' };
    await fetchUsers();
    if (!users.value.length) {
        ElMessage.warning('無可用用戶可供分配');
        return;
    }
    reassignVisible.value = true;
};

const submitReassign = async () => {
    if (!reassignForm.value.newAssignee) {
        ElMessage.warning('請選擇新執行者');
        return;
    }
    try {
        loading.value = true;
        await processApi.reassignTask({
            processInstanceId: reassignForm.value.processInstanceId,
            newAssignee: reassignForm.value.newAssignee,
        });
        ElMessage.success('任務已重新分配');
        reassignVisible.value = false;
        await fetchProcesses();
    } catch (error: any) {
        console.error('Failed to reassign task:', error);
        ElMessage.error(error.response?.data?.message || '任務重新分配失敗，請稍後重試');
    } finally {
        loading.value = false;
    }
};

const showJumpDialog = async (id: string) => {
    try {
        loading.value = true;
        const diagramResponse = await processApi.getProcessInstanceDiagram({ id });
        if (!diagramResponse.data.bpmnXml) {
            ElMessage.warning('該流程實例尚未有流程圖可顯示');
            return;
        }
        currentBpmnData.value = {
            bpmnXml: diagramResponse.data.bpmnXml,
            currentTask: diagramResponse.data.currentTask,
        };
        await fetchNodes(id);
        if (!nodes.value.length) {
            ElMessage.warning('無可用節點可供跳轉');
            return;
        }
        jumpForm.value = { processInstanceId: id, targetNode: '' };
        jumpVisible.value = true;
    } catch (error: any) {
        console.error('Failed to fetch process diagram or nodes:', error);
        ElMessage.error(error.response?.data?.message || '獲取流程圖或節點失敗，請稍後重試');
    } finally {
        loading.value = false;
    }
};

const submitJump = async () => {
    if (!jumpForm.value.targetNode) {
        ElMessage.warning('請選擇目標節點');
        return;
    }
    try {
        loading.value = true;
        await processApi.jumpToNode({
            processInstanceId: jumpForm.value.processInstanceId,
            targetNode: jumpForm.value.targetNode,
        });
        ElMessage.success('節點已跳轉');
        jumpVisible.value = false;
        await fetchProcesses();
    } catch (error: any) {
        console.error('Failed to jump to node:', error);
        ElMessage.error(error.response?.data?.message || '節點跳轉失敗，請稍後重試');
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
</style>