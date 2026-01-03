<template>
  <div class="chat-container">
    <el-card class="chat-card">
      <template #header>
        <div class="card-header">
          <span>💬 即時聊天室</span>
          <el-tag v-if="chatStore.isConnected" type="success" effect="dark" size="small">連線中</el-tag>
          <el-tag v-else type="danger" effect="dark" size="small">離線</el-tag>
        </div>
      </template>
      
      <div class="message-list" ref="messageListRef">
        <div 
          v-for="(msg, index) in chatStore.messages" 
          :key="index" 
          class="message-item"
          :class="{ 'my-message': msg.sender === userStore.userName, 'system-message': msg.type === 'JOIN' }"
        >
          <div v-if="msg.type === 'JOIN'" class="system-text">
            {{ msg.sender }} {{ msg.content }}
          </div>

          <div v-else class="chat-bubble-wrapper">
            <div class="sender-name" v-if="msg.sender !== userStore.userName">{{ msg.sender }}</div>
            <div class="chat-bubble">
              {{ msg.content }}
            </div>
            <div class="time-text">{{ msg.time }}</div>
          </div>
        </div>
      </div>

      <div class="input-area">
        <el-input
          v-model="inputMessage"
          placeholder="輸入訊息..."
          @keyup.enter="handleSend"
        >
          <template #append>
            <el-button @click="handleSend" :disabled="!chatStore.isConnected">發送</el-button>
          </template>
        </el-input>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, watch } from 'vue'
import { useChatStore } from '../../stores/chatStore'
import { useUserStore } from '../../stores/userStore'

const chatStore = useChatStore()
const userStore = useUserStore()
const inputMessage = ref('')
const messageListRef = ref<HTMLElement | null>(null)

// 滾動到底部
const scrollToBottom = () => {
  nextTick(() => {
    if (messageListRef.value) {
      messageListRef.value.scrollTop = messageListRef.value.scrollHeight
    }
  })
}

const handleSend = () => {
  if (inputMessage.value.trim()) {
    chatStore.sendMessage(inputMessage.value)
    inputMessage.value = ''
    scrollToBottom()
  }
}

// 當有新訊息時自動滾動
watch(() => chatStore.messages.length, () => {
  scrollToBottom()
})

onMounted(() => {
  // 進入頁面時確保連線
  if (!chatStore.isConnected) {
    chatStore.connect()
  }
  scrollToBottom()
})
</script>

<style scoped>
.chat-container {
  padding: 20px;
  height: calc(100vh - 120px); /* 扣掉 header 高度 */
}
.chat-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}
.chat-card :deep(.el-card__body) {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 0;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.message-list {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background-color: var(--el-bg-color-page);
}
.message-item {
  margin-bottom: 15px;
  display: flex;
  flex-direction: column;
}
.my-message {
  align-items: flex-end;
}
.my-message .chat-bubble {
  background-color: var(--el-color-primary);
  color: white;
  border-radius: 12px 12px 0 12px;
}
.chat-bubble-wrapper {
  max-width: 70%;
}
.sender-name {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-bottom: 4px;
}
.chat-bubble {
  padding: 10px 15px;
  background-color: var(--el-bg-color-overlay);
  border-radius: 12px 12px 12px 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  word-wrap: break-word;
}
.time-text {
  font-size: 10px;
  color: var(--el-text-color-placeholder);
  text-align: right;
  margin-top: 2px;
}
.system-message {
  align-items: center;
}
.system-text {
  background-color: rgba(0, 0, 0, 0.05);
  padding: 4px 12px;
  border-radius: 10px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
.input-area {
  padding: 15px;
  border-top: 1px solid var(--el-border-color-light);
  background-color: var(--el-bg-color);
}
</style>