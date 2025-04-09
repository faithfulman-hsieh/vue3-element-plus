<!-- src/views/TodoView.vue -->
<template>
  <div class="page-container">
    <h1 class="page-title">待辦事項管理</h1>

    <!-- 新增待辦事項 -->
    <el-form :model="newTodo" class="form-card">
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="label-wrapper">標題</div>
        </el-col>
        <el-col :span="12">
          <el-form-item prop="title" label-width="0">
            <el-input v-model="newTodo.title" placeholder="輸入標題" />
          </el-form-item>
        </el-col>
        <el-col :span="6"></el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="label-wrapper">描述</div>
        </el-col>
        <el-col :span="12">
          <el-form-item prop="description" label-width="0">
            <el-input v-model="newTodo.description" placeholder="輸入描述" />
          </el-form-item>
        </el-col>
        <el-col :span="6"></el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="label-wrapper">指派人</div>
        </el-col>
        <el-col :span="12">
          <el-form-item prop="assignee" label-width="0">
            <el-input v-model="newTodo.assignee" placeholder="指派給誰" />
          </el-form-item>
        </el-col>
        <el-col :span="6"></el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="18">
          <el-form-item class="button-item" label-width="0">
            <el-button type="primary" @click="addTodo">新增待辦事項</el-button>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <!-- 待辦事項列表 -->
    <el-table :data="todos" class="table-card" border stripe>
      <el-table-column prop="title" label="標題" min-width="90" />
      <el-table-column prop="description" label="描述" min-width="100" />
      <el-table-column prop="status" label="待辦狀態" min-width="60" />
      <el-table-column prop="processInstanceId" label="流程ID" min-width="70" />
      <el-table-column prop="assignee" label="指派人" min-width="60" />
      <el-table-column label="操作" min-width="360">
        <template #default="{ row }">
          <el-button @click="showProcessDiagram(row.id)" type="info" size="small">查看狀態</el-button>
          <template v-if="row.status === '處理待辦'">
            <el-button @click="completeTodo(row.id)" type="success" size="small">完成</el-button>
            <el-button @click="reassignTodo(row.id)" type="warning" size="small">重新分派</el-button>
          </template>
          <template v-if="row.status === '確認待辦'">
            <el-select v-model="priority" placeholder="選擇優先級" size="small" class="priority-select">
              <el-option label="高" value="high" />
              <el-option label="低" value="low" />
            </el-select>
            <el-button @click="confirmTodo(row.id)" type="success" size="small">確認</el-button>
            <el-button @click="rejectTodo(row.id)" type="danger" size="small">拒絕</el-button>
          </template>
          <template v-if="row.status === '審閱待辦'">
            <el-button @click="approveTodo(row.id)" type="success" size="small">核准</el-button>
            <el-button @click="rejectReviewTodo(row.id)" type="danger" size="small">拒絕</el-button>
          </template>
        </template>
      </el-table-column>
    </el-table>

    <!-- 流程圖對話框 -->
    <el-dialog title="流程狀態" v-model="dialogVisible" width="80%">
      <bpmn-viewer :bpmnXml="currentBpmnData?.bpmnXml" :currentTask="currentBpmnData?.currentTask" />
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import todoService from '~/api/todoService';
import BpmnViewer from '~/components/BpmnViewer.vue';

const todos = ref([]);
const newTodo = ref({ title: '', description: '', assignee: '' });
const priority = ref('high');
const dialogVisible = ref(false);
const currentBpmnData = ref(null);

const fetchTodos = async () => {
  try {
    todos.value = await todoService.getAllTodos();
  } catch (error) {
    ElMessage.error('取得待辦事項失敗');
    console.error('取得待辦事項失敗:', error);
  }
};

const addTodo = async () => {
  if (!newTodo.value.title || !newTodo.value.description || !newTodo.value.assignee) {
    ElMessage.warning('請填寫所有欄位');
    return;
  }
  try {
    await todoService.createTodo(newTodo.value);
    newTodo.value = { title: '', description: '', assignee: '' };
    fetchTodos();
    ElMessage.success('成功新增待辦事項');
  } catch (error) {
    ElMessage.error('新增待辦事項失敗');
    console.error('新增失敗:', error);
  }
};

const showProcessDiagram = async (todoId) => {
  try {
    const { bpmnXml, currentTask } = await todoService.getProcessDiagram(todoId);
    console.log('Received BPMN XML:', bpmnXml);
    console.log('Received Current Task:', currentTask);

    currentBpmnData.value = { bpmnXml, currentTask };
    dialogVisible.value = true;
  } catch (error) {
    ElMessage.error('取得流程圖失敗');
    console.error('取得流程圖失敗:', error);
  }
};

const completeTodo = async (todoId) => {
  try {
    await todoService.completeTask(todoId, 'complete', priority.value);
    fetchTodos();
    ElMessage.success('待辦事項已完成');
  } catch (error) {
    ElMessage.error('完成待辦事項失敗');
    console.error('完成失敗:', error);
  }
};

const reassignTodo = async (todoId) => {
  try {
    await todoService.completeTask(todoId, 'reassign', priority.value);
    fetchTodos();
    ElMessage.success('待辦事項已重新分派');
  } catch (error) {
    ElMessage.error('重新分派待辦事項失敗');
    console.error('重新分派失敗:', error);
  }
};

const confirmTodo = async (todoId) => {
  if (!priority.value) {
    ElMessage.warning('請選擇優先級');
    return;
  }
  try {
    await todoService.completeTask(todoId, 'confirm', priority.value);
    fetchTodos();
    ElMessage.success('待辦事項已確認');
  } catch (error) {
    ElMessage.error('確認待辦事項失敗');
    console.error('確認失敗:', error);
  }
};

const rejectTodo = async (todoId) => {
  if (!priority.value) {
    ElMessage.warning('請選擇優先級');
    return;
  }
  try {
    await todoService.completeTask(todoId, 'reject', priority.value);
    fetchTodos();
    ElMessage.success('待辦事項已拒絕');
  } catch (error) {
    ElMessage.error('拒絕待辦事項失敗');
    console.error('拒絕失敗:', error);
  }
};

const approveTodo = async (todoId) => {
  try {
    await todoService.completeTask(todoId, 'approve', priority.value);
    fetchTodos();
    ElMessage.success('待辦事項已核准');
  } catch (error) {
    ElMessage.error('核准待辦事項失敗');
    console.error('核准失敗:', error);
  }
};

const rejectReviewTodo = async (todoId) => {
  try {
    await todoService.completeTask(todoId, 'reject', priority.value);
    fetchTodos();
    ElMessage.success('審閱待辦事項已拒絕');
  } catch (error) {
    ElMessage.error('拒絕審閱待辦事項失敗');
    console.error('拒絕失敗:', error);
  }
};

onMounted(() => {
  fetchTodos();
});
</script>

<style scoped>
    .label-wrapper {
      text-align: right;
      line-height: 40px; /* 與輸入框高度對齊 */
    }
</style>