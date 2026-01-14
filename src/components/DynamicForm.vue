<template>
  <el-form :model="formData" :rules="rules" ref="formRef" label-width="120px" class="dynamic-form">
    <template v-for="field in fields" :key="field.key">
      <el-form-item :label="field.label" :prop="field.key">
        
        <el-input 
          v-if="field.type === 'text' || field.type === 'string'" 
          v-model="formData[field.key]" 
          :placeholder="`請輸入${field.label}`"
          :disabled="field.disabled"
        />

        <el-input-number 
          v-else-if="field.type === 'number' || field.type === 'long'" 
          v-model="formData[field.key]" 
          :min="0"
          style="width: 100%"
          :disabled="field.disabled"
        />

        <el-date-picker
          v-else-if="field.type === 'date'"
          v-model="formData[field.key]"
          type="date"
          placeholder="選擇日期"
          style="width: 100%"
          value-format="YYYY-MM-DD"
          :disabled="field.disabled"
        />

        <el-select 
          v-else-if="field.type === 'enum' || field.type === 'select'" 
          v-model="formData[field.key]" 
          placeholder="請選擇"
          style="width: 100%"
          :disabled="field.disabled"
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
          :disabled="field.disabled"
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
          :disabled="field.disabled"
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
  disabled?: boolean; // 確保介面定義包含 disabled
  value?: any;        // 確保介面定義包含 value (後端傳來的值)
  options?: Option[]; 
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
    // ★★★ 修正處：優先使用後端傳回的 value ★★★
    if (field.value !== undefined && field.value !== null) {
      formData[field.key] = field.value;
    } 
    // 若沒有值，才進行預設初始化
    else if (field.type === 'checkbox-group') {
      formData[field.key] = []; 
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