<template>
  <div class="page-container">
    <div class="header">
      <h1 class="page-title">簡易待辦 (Todo)</h1>
      <span class="subtitle">基礎 CRUD 功能展示與測試</span>
    </div>

    <el-form :model="newTodo" class="form-card">
      <el-row :gutter="20">
        <el-col :span="8">
          <div class="label-wrapper">標題</div>
        </el-col>
        <el-col :span="8">
          <el-form-item prop="title" label-width="0">
            <el-input v-model="newTodo.title" placeholder="輸入標題" />
          </el-form-item>
        </el-col>
        <el-col :span="6"></el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="8">
          <div class="label-wrapper">描述</div>
        </el-col>
        <el-col :span="8">
          <el-form-item prop="description" label-width="0">
            <el-input v-model="newTodo.description" placeholder="輸入描述" />
          </el-form-item>
        </el-col>
        <el-col :span="6"></el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="8">
          <div class="label-wrapper">指派人</div>
        </el-col>
        <el-col :span="8">
          <el-form-item prop="assignee" label-width="0">
            <el-input v-model="newTodo.assignee" placeholder="指派給誰" />
          </el-form-item>
        </el-col>
        <el-col :span="8"></el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="16">
          <el-form-item label-width="0" class="button-form-item">
            <el-button type="primary" @click="addTodo">新增待辦事項</el-button>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <el-row :gutter="20">
      <el-col :span="22" :offset="1">
        <el-table :data="todos" class="table-card" border stripe>
          <el-table-column prop="title" label="標題" min-width="90" />
          <el-table-column prop="description" label="描述" min-width="100" />
          <el-table-column prop="status" label="待辦狀態" min-width="60" />
          <el-table-column prop="processInstanceId" label="流程ID" min-width="70" />
          <el-table-column prop="assignee" label="指派人" min-width="60" />
          <el-table-column label="操作" min-width="360">
            <template #default="{ row }">
              <div class="action-buttons">
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
              </div>
            </template>
          </el-table-column>
        </el-table>
      </el-col>
    </el-row>

    <el-dialog title="流程執行狀態" v-model="dialogVisible" width="80%">
      <bpmn-viewer :bpmnXml="currentBpmnData?.bpmnXml" :currentTask="currentBpmnData?.currentTask" />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { todosApi } from '../../api/client';
import type { Todo, TodoRequest } from '../../api/models';
import BpmnViewer from '../../components/BpmnViewer.vue';

const todos = ref<Todo[]>([]);
const newTodo = ref<TodoRequest>({ title: '', description: '', assignee: '' });
const priority = ref('high');
const dialogVisible = ref(false);
const currentBpmnData = ref<{ bpmnXml: string; currentTask: string } | null>(null);

const fetchTodos = async () => {
  const response = await todosApi.getAllTodos();
  if (response.data) {
    todos.value = Array.isArray(response.data) ? response.data : [response.data]; // 修正單個 Todo
  } else {
    ElMessage.error('取得待辦事項失敗');
  }
};

const addTodo = async () => {
  if (!newTodo.value.title || !newTodo.value.description || !newTodo.value.assignee) {
    ElMessage.warning('請填寫所有欄位');
    return;
  }
  const response = await todosApi.createTodo({ todoRequest: newTodo.value });
  if (response.data) {
    newTodo.value = { title: '', description: '', assignee: '' };
    fetchTodos();
    ElMessage.success('成功新增待辦事項');
  } else {
    ElMessage.error('新增待辦事項失敗');
  }
};

const showProcessDiagram = async (todoId: number) => {
  const response = await todosApi.getProcessDiagram({ id: todoId });
  if (response.data) {
    // 假設後端返回 JSON 字串，需解析
    const data = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
    currentBpmnData.value = { bpmnXml: data.bpmnXml, currentTask: data.currentTask };
    dialogVisible.value = true;
  } else {
    ElMessage.error('取得流程圖失敗');
  }
};

const completeTodo = async (todoId: number) => {
  const response = await todosApi.completeTodo({ id: todoId, action: 'complete', priority: priority.value });
  if (response.status === 200) {
    fetchTodos();
    ElMessage.success('待辦事項已完成');
  } else {
    ElMessage.error('完成待辦事項失敗');
  }
};

const reassignTodo = async (todoId: number) => {
  const response = await todosApi.completeTodo({ id: todoId, action: 'reassign', priority: priority.value });
  if (response.status === 200) {
    fetchTodos();
    ElMessage.success('待辦事項已重新分派');
  } else {
    ElMessage.error('重新分派待辦事項失敗');
  }
};

const confirmTodo = async (todoId: number) => {
  if (!priority.value) {
    ElMessage.warning('請選擇優先級');
    return;
  }
  const response = await todosApi.completeTodo({ id: todoId, action: 'confirm', priority: priority.value });
  if (response.status === 200) {
    fetchTodos();
    ElMessage.success('待辦事項已確認');
  } else {
    ElMessage.error('確認待辦事項失敗');
  }
};

const rejectTodo = async (todoId: number) => {
  if (!priority.value) {
    ElMessage.warning('請選擇優先級');
    return;
  }
  const response = await todosApi.completeTodo({ id: todoId, action: 'reject', priority: priority.value });
  if (response.status === 200) {
    fetchTodos();
    ElMessage.success('待辦事項已拒絕');
  } else {
    ElMessage.error('拒絕待辦事項失敗');
  }
};

const approveTodo = async (todoId: number) => {
  const response = await todosApi.completeTodo({ id: todoId, action: 'approve', priority: priority.value });
  if (response.status === 200) {
    fetchTodos();
    ElMessage.success('待辦事項已核准');
  } else {
    ElMessage.error('核准待辦事項失敗');
  }
};

const rejectReviewTodo = async (todoId: number) => {
  const response = await todosApi.completeTodo({ id: todoId, action: 'reject', priority: priority.value });
  if (response.status === 200) {
    fetchTodos();
    ElMessage.success('審閱待辦事項已拒絕');
  } else {
    ElMessage.error('拒絕審閱待辦事項失敗');
  }
};

onMounted(() => {
  fetchTodos();
});
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
.priority-select {
  width: 100px;
}
.table-card {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  border-radius: 8px;
}
</style>