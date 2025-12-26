<template>
  <el-form ref="formRef" :model="formData" label-width="120px">
    
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

// ★★★ 1. 拆分欄位邏輯 ★★★
// 找出那個被標記為 'buttons' 的欄位 (例如：簽核動作)
const actionField = computed(() => {
  return props.fields.find(f => f.uiComponent === 'buttons' && f.type === 'select')
})

// 找出其他所有需要顯示的輸入欄位
const regularFields = computed(() => {
  return props.fields.filter(f => !(f.uiComponent === 'buttons' && f.type === 'select'))
})

// 初始化表單值
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

// ★★★ 2. 處理按鈕點擊 ★★★
// 當使用者點擊底部某個 Action 按鈕 (例如 "駁回")
const handleActionSubmit = async (key: string, value: string) => {
  // 1. 自動將該按鈕的值填入表單資料
  formData.value[key] = value
  
  // 2. 執行驗證並送出
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

// ★★★ 3. 輔助樣式：讓駁回按鈕變紅色，完成變藍色/綠色 ★★★
const getButtonType = (value: string) => {
  const lowerVal = value.toLowerCase()
  if (['reject', 'cancel', 'delete'].some(k => lowerVal.includes(k))) {
    return 'danger' // 紅色
  }
  if (['approve', 'confirm', 'complete', 'pass'].some(k => lowerVal.includes(k))) {
    return 'primary' // 藍色 (或可改 success 綠色)
  }
  if (['reassign'].some(k => lowerVal.includes(k))) {
    return 'warning' // 黃色/橘色
  }
  return 'default' // 灰色
}
</script>

<style scoped>
.form-footer {
  display: flex;
  justify-content: flex-end; /* 按鈕靠右對齊，符合對話框習慣 */
  gap: 10px;
  margin-top: 20px;
  padding-top: 10px;
  border-top: 1px solid #f0f0f0; /* 加一條分隔線更清晰 */
}
</style>