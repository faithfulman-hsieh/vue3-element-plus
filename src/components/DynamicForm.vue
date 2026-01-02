<template>
  <el-form :model="formData" :rules="rules" ref="formRef" label-width="120px" class="dynamic-form">
    <template v-for="field in fields" :key="field.key">
      <el-form-item :label="field.label" :prop="field.key">
        
        <el-input 
          v-if="field.type === 'text' || field.type === 'string'" 
          v-model="formData[field.key]" 
          :placeholder="`請輸入${field.label}`"
        />

        <el-input-number 
          v-else-if="field.type === 'number' || field.type === 'long'" 
          v-model="formData[field.key]" 
          :min="0"
          style="width: 100%"
        />

        <el-date-picker
          v-else-if="field.type === 'date'"
          v-model="formData[field.key]"
          type="date"
          placeholder="選擇日期"
          style="width: 100%"
          value-format="YYYY-MM-DD"
        />

        <el-select 
          v-else-if="field.type === 'enum' || field.type === 'select'" 
          v-model="formData[field.key]" 
          placeholder="請選擇"
          style="width: 100%"
        >
          <el-option
            v-for="opt in field.options"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>

        <el-checkbox-group 
          v-else-if="field.type === 'checkbox-group'" 
          v-model="formData[field.key]"
        >
          <el-checkbox 
            v-for="opt in field.options" 
            :key="opt.value" 
            :label="opt.value"
          >
            {{ opt.label }}
          </el-checkbox>
        </el-checkbox-group>

        <el-input 
          v-else 
          v-model="formData[field.key]" 
          :placeholder="`請輸入${field.label}`"
        />
      </el-form-item>
    </template>

    <div class="form-actions">
      <el-button @click="$emit('cancel')">取消</el-button>
      <el-button type="primary" @click="handleSubmit">{{ submitText }}</el-button>
    </div>
  </el-form>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted } from 'vue';
import type { FormInstance } from 'element-plus';

interface Option {
  label: string;
  value: string | number;
}

interface FormField {
  key: string;
  label: string;
  type: string;
  required?: boolean;
  options?: Option[]; // 支援選項
}

const props = defineProps({
  fields: {
    type: Array as () => FormField[],
    required: true
  },
  submitText: {
    type: String,
    default: '提交'
  }
});

const emit = defineEmits(['submit', 'cancel']);
const formRef = ref<FormInstance>();
const formData = reactive<Record<string, any>>({});
const rules = reactive<Record<string, any>>({});

// 初始化表單數據與驗證規則
const initForm = () => {
  // 清空舊數據
  Object.keys(formData).forEach(key => delete formData[key]);
  Object.keys(rules).forEach(key => delete rules[key]);

  props.fields.forEach(field => {
    // 預設值初始化
    if (field.type === 'checkbox-group') {
      formData[field.key] = []; // 陣列類型
    } else {
      formData[field.key] = '';
    }

    // 建立驗證規則
    if (field.required) {
      rules[field.key] = [
        { 
          required: true, 
          message: `${field.label}是必填項`, 
          trigger: field.type === 'select' || field.type === 'checkbox-group' ? 'change' : 'blur' 
        }
      ];
    }
  });
};

const handleSubmit = async () => {
  if (!formRef.value) return;
  await formRef.value.validate((valid) => {
    if (valid) {
      emit('submit', { ...formData });
    }
  });
};

// 監聽 fields 變化重新初始化
watch(() => props.fields, () => {
  initForm();
}, { deep: true });

onMounted(() => {
  initForm();
});
</script>

<style scoped>
.dynamic-form {
  padding: 10px 0;
}
.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
</style>