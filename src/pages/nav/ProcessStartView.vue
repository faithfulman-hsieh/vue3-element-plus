<!-- src/pages/nav/ProcessStartView.vue -->
<template>
    <div class="page-container">
        <h1 class="page-title">啟動流程</h1>

        <!-- 選擇流程並填寫表單 -->
        <el-form :model="startForm" class="form-card">
            <el-row :gutter="20">
                <el-col :span="8">
                    <div class="label-wrapper">流程名稱</div>
                </el-col>
                <el-col :span="8">
                    <el-form-item prop="processId" label-width="0">
                        <el-select v-model="startForm.processId" placeholder="選擇流程" @change="loadFormFields">
                            <el-option
                                    v-for="process in processes"
                                    :key="process.id"
                                    :label="process.name"
                                    :value="process.id"
                            />
                        </el-select>
                    </el-form-item>
                </el-col>
                <el-col :span="6"></el-col>
            </el-row>
            <el-row v-for="field in formFields" :key="field.key" :gutter="20">
                <el-col :span="8">
                    <div class="label-wrapper">{{ field.label }}</div>
                </el-col>
                <el-col :span="8">
                    <el-form-item :prop="field.key" label-width="0">
                        <el-input v-if="field.type === 'text'" v-model="startForm[field.key]" :placeholder="'輸入' + field.label" />
                        <el-select v-if="field.type === 'select'" v-model="startForm[field.key]" :placeholder="'選擇' + field.label">
                            <el-option v-for="option in field.options" :key="option.value" :label="option.label" :value="option.value" />
                        </el-select>
                    </el-form-item>
                </el-col>
                <el-col :span="6"></el-col>
            </el-row>
            <el-row :gutter="20">
                <el-col :span="16">
                    <el-form-item label-width="0" class="button-form-item">
                        <el-button type="primary" @click="startProcess">啟動流程</el-button>
                    </el-form-item>
                </el-col>
            </el-row>
        </el-form>
    </div>
</template>

<script setup lang="ts">
    import { ref } from 'vue';
    import { ElMessage } from 'element-plus';

    const processes = ref([
      // 模擬數據
      { id: 1, name: '請假流程' },
      { id: 2, name: '報銷流程' },
    ]);
    const startForm = ref({ processId: '' });
    const formFields = ref([] as { key: string; label: string; type: string; options?: { label: string; value: string }[] }[]);

    const loadFormFields = (processId: string) => {
      // TODO: 根據流程 ID 調用 API 獲取表單結構
      if (processId === '1') {
        formFields.value = [
          { key: 'startDate', label: '開始日期', type: 'text' },
          { key: 'endDate', label: '結束日期', type: 'text' },
        ];
        startForm.value = { processId, startDate: '', endDate: '' };
      } else {
        formFields.value = [];
        startForm.value = { processId };
      }
    };

    const startProcess = () => {
      if (!startForm.value.processId) {
        ElMessage.warning('請選擇流程');
        return;
      }
      // TODO: 調用 API 啟動流程
      ElMessage.success('流程啟動成功');
      startForm.value = { processId: '' };
      formFields.value = [];
    };
</script>

<style scoped>
    .label-wrapper {
      text-align: right;
      line-height: 40px;
    }
</style>