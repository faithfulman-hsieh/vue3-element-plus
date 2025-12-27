<template>
  <el-form 
    ref="formRef" 
    :model="formData" 
    label-width="120px" 
    class="dynamic-form"
  >
    <el-form-item
      v-for="field in regularFields"
      :key="field.key"
      :label="field.label"
      :prop="field.key"
      :rules="field.required ? [{ required: true, message: '此欄位為必填', trigger: 'change' }] : []"
    >
      <el-input
        v-if="field.type === 'text'"
        v-model="formData[field.key]"
        :disabled="field.disabled"
        :placeholder="field.disabled ? '' : '請輸入'"
      />
      
      <el-input
        v-if="field.type === 'textarea'"
        v-model="formData[field.key]"
        type="textarea"
        :rows="3"
        :disabled="field.disabled"
        :placeholder="field.disabled ? '' : '請輸入'"
      />

      <el-select
        v-if="field.type === 'select'"
        v-model="formData[field.key]"
        :disabled="field.disabled"
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

      <el-date-picker
        v-if="field.type === 'date'"
        v-model="formData[field.key]"
        type="date"
        :disabled="field.disabled"
        style="width: 100%"
        value-format="YYYY-MM-DD"
        placeholder="請選擇日期"
      />

      <el-input-number
        v-if="field.type === 'number'"
        v-model="formData[field.key]"
        :disabled="field.disabled"
      />
      
      <el-switch
        v-if="field.type === 'switch'"
        v-model="formData[field.key]"
        :disabled="field.disabled"
      />
    </el-form-item>

    <div class="form-footer">
      <el-button @click="$emit('cancel')">取消</el-button>

      <template v-if="actionField">
        <el-button
          v-for="opt in actionField.options"
          :key="opt.value"
          :type="getButtonType(opt.value)"
          @click="handleActionSubmit(actionField.key, opt.value)"
        >
          {{ opt.label }}
        </el-button>
      </template>

      <template v-else>
        <el-button type="primary" @click="handleSubmit">送出</el-button>
      </template>
    </div>

  </el-form>
</template>

<script setup lang="ts">
import { ref, watch, computed, defineProps, defineEmits } from 'vue'
import type { FormInstance } from 'element-plus'

const props = defineProps({
  fields: {
    type: Array as () => any[],
    required: true,
    default: () => []
  }
})

const emit = defineEmits(['submit', 'cancel'])
const formRef = ref<FormInstance>()
const formData = ref<any>({})

const actionField = computed(() => {
  return props.fields.find(f => f.uiComponent === 'buttons' && f.type === 'select')
})

const regularFields = computed(() => {
  return props.fields.filter(f => !(f.uiComponent === 'buttons' && f.type === 'select'))
})

watch(
  () => props.fields,
  (newFields) => {
    const data: any = {}
    if (newFields && newFields.length > 0) {
      newFields.forEach((field) => {
        if (field.value !== undefined && field.value !== null) {
          data[field.key] = field.value
        } else {
          if (field.type === 'switch') data[field.key] = false
          else data[field.key] = ''
        }
      })
    }
    formData.value = data
  },
  { immediate: true, deep: true }
)

const handleActionSubmit = async (key: string, value: string) => {
  formData.value[key] = value
  handleSubmit()
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate((valid) => {
    if (valid) {
      emit('submit', formData.value)
    }
  })
}

const getButtonType = (value: string) => {
  const lowerVal = value.toLowerCase()
  if (['reject', 'cancel', 'delete'].some(k => lowerVal.includes(k))) {
    return 'danger'
  }
  if (['approve', 'confirm', 'complete', 'pass'].some(k => lowerVal.includes(k))) {
    return 'primary'
  }
  if (['reassign'].some(k => lowerVal.includes(k))) {
    return 'warning'
  }
  return 'default'
}
</script>

<style scoped>
.dynamic-form {
  /* ★★★ 修改：上下 10px，左右 10% ★★★ */
  padding: 10px 10%; 
}

.form-footer {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid var(--el-border-color-lighter);
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>