<script setup lang="ts">
import { ref, watch, computed } from 'vue'

// 定義後端傳來的欄位格式
interface FormField {
  key: string
  label: string
  type: string // text, number, date, select, switch
  required: boolean
  disabled: boolean
  options?: { label: string; value: string }[]
  uiComponent?: string // 特殊標記，例如 "buttons"
}

const props = defineProps<{
  fields: FormField[]
}>()

const emit = defineEmits(['submit', 'cancel'])

// 綁定表單數據 (例如: { days: 5, reason: '...' })
const formData = ref<Record<string, any>>({})

// 當 fields 改變時，初始化 formData
watch(() => props.fields, (newFields) => {
  const data: Record<string, any> = {}
  newFields.forEach(field => {
    // 如果有預設值可以在這裡設定
    data[field.key] = ''
  })
  formData.value = data
}, { immediate: true })

// 找出是否有 "Action" 按鈕欄位 (例如核准/駁回)
const actionField = computed(() => {
  return props.fields.find(f => f.uiComponent === 'buttons' || f.key === 'action')
})

// 過濾掉 Action 按鈕，剩下的才是要填寫的輸入框
const inputFields = computed(() => {
  return props.fields.filter(f => f.uiComponent !== 'buttons' && f.key !== 'action')
})

// 提交表單
const handleSubmit = (actionValue?: string) => {
  // 如果是點擊 Action 按鈕，把動作值填入 formData
  if (actionValue && actionField.value) {
    formData.value[actionField.value.key] = actionValue
  }
  emit('submit', formData.value)
}
</script>

<template>
  <el-form :model="formData" label-width="100px" @submit.prevent>
    
    <template v-for="field in inputFields" :key="field.key">
      
      <el-form-item :label="field.label" :prop="field.key" :required="field.required">
        
        <el-input 
          v-if="field.type === 'text'" 
          v-model="formData[field.key]" 
          :disabled="field.disabled"
          :placeholder="'請輸入' + field.label"
        />

        <el-input-number 
          v-if="field.type === 'number'" 
          v-model="formData[field.key]" 
          :disabled="field.disabled" 
          style="width: 100%"
        />

        <el-date-picker
          v-if="field.type === 'date'"
          v-model="formData[field.key]"
          type="date"
          :disabled="field.disabled"
          style="width: 100%"
          value-format="YYYY-MM-DD"
        />

        <el-select 
          v-if="field.type === 'select'" 
          v-model="formData[field.key]" 
          :disabled="field.disabled"
          style="width: 100%"
        >
          <el-option
            v-for="opt in field.options"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>

        <el-switch 
          v-if="field.type === 'switch'" 
          v-model="formData[field.key]" 
          :disabled="field.disabled"
        />

      </el-form-item>
    </template>

    <div class="form-actions">
      <template v-if="actionField">
        <el-button 
          v-for="opt in actionField.options" 
          :key="opt.value"
          :type="opt.value === 'reject' ? 'danger' : 'success'"
          @click="handleSubmit(opt.value)"
        >
          {{ opt.label }}
        </el-button>
      </template>

      <el-button v-else type="primary" @click="handleSubmit()">提交</el-button>
      
      <el-button @click="$emit('cancel')">取消</el-button>
    </div>

  </el-form>
</template>

<style scoped>
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #eee;
}
</style>