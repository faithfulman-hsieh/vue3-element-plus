<script lang="ts" setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue';
import { useUserStore } from '../../stores/userStore';
import { useChatStore } from '../../stores/chatStore';
import { userApi } from '../../api/client';
import { Search, Promotion, UserFilled, MoreFilled } from '@element-plus/icons-vue';
import type { User } from '../../api/models';
import { ElMessage } from 'element-plus';

const userStore = useUserStore();
const chatStore = useChatStore();

// --- 狀態管理 ---
const contactList = ref<User[]>([]); 
const searchText = ref(''); 
const activeChatUser = ref<User | null>(null); 
const messageInput = ref(''); 
const scrollbarRef = ref<HTMLElement | null>(null);

// --- 載入資料 ---
onMounted(async () => {
  if (!chatStore.isConnected) {
    chatStore.connect();
  }
  
  try {
    const res = await userApi.getUsers();
    if (res.data) {
      // 排除自己
      const myUsername = userStore.username;
      contactList.value = res.data.filter((u: User) => {
        // 嘗試抓取各種可能的 ID 欄位 (確保相容性)
        const uName = u.name || u.username; 
        return uName !== myUsername;
      });
    }
  } catch (error) {
    console.error('無法載入聯絡人列表', error);
    ElMessage.error('無法載入聯絡人');
  }
});

// --- 計算屬性 ---

const filteredContacts = computed(() => {
  if (!searchText.value) return contactList.value;
  return contactList.value.filter(user => {
    const name = user.name || user.username || '';
    return name.toLowerCase().includes(searchText.value.toLowerCase());
  });
});

// 過濾並顯示當前對話
const currentMessages = computed(() => {
  if (!activeChatUser.value) return [];
  
  const myId = userStore.username; 
  // 優先使用 username 作為 ID，若無則 fallback 到 name
  const targetId = activeChatUser.value.username || activeChatUser.value.name; 

  if (!targetId) return [];

  return chatStore.messages.filter(msg => {
    const sender = msg.sender;
    const receiver = msg.receiver;

    // 情況 A: 我傳給對方
    const sentByMe = sender === myId && receiver === targetId;
    
    // 情況 B: 對方傳給我 (包含廣播給我的情況)
    const sentByThem = sender === targetId && (receiver === myId || !receiver);

    return sentByMe || sentByThem;
  });
});

// --- 方法 ---

const selectContact = (user: User) => {
  activeChatUser.value = user;
  scrollToBottom();
};

const handleSendMessage = () => {
  if (!messageInput.value.trim()) return;
  if (!activeChatUser.value) {
    ElMessage.warning('請先選擇聊天對象');
    return;
  }

  // 確保使用 username 發送
  const targetId = activeChatUser.value.username || activeChatUser.value.name;
  
  if (!targetId) {
    ElMessage.error('錯誤：無法識別聯絡人 ID');
    return;
  }

  chatStore.sendMessage(messageInput.value, targetId);
  
  messageInput.value = '';
  scrollToBottom();
};

const scrollToBottom = () => {
  nextTick(() => {
    const container = document.querySelector('.message-scroll-container .el-scrollbar__wrap');
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  });
};

watch(() => chatStore.messages.length, () => {
  if (activeChatUser.value) {
    scrollToBottom();
  }
});
</script>

<template>
  <div class="chat-container">
    <div class="sidebar">
      <div class="search-bar">
        <el-input
          v-model="searchText"
          placeholder="搜尋聯絡人..."
          :prefix-icon="Search"
          clearable
        />
      </div>

      <div class="contact-list">
        <el-scrollbar>
          <div 
            v-for="user in filteredContacts" 
            :key="user.id"
            class="contact-item"
            :class="{ active: activeChatUser?.id === user.id }"
            @click="selectContact(user)"
          >
            <el-avatar :size="40" class="contact-avatar" :style="{ backgroundColor: stringToColor(user.username || '') }">
              {{ (user.name || user.username || '?').charAt(0).toUpperCase() }}
            </el-avatar>
            
            <div class="contact-info">
              <div class="contact-top">
                <span class="contact-name">{{ user.name || user.username }}</span>
                <span class="contact-time"></span>
              </div>
              <div class="contact-preview">
                點擊開始聊天...
              </div>
            </div>
          </div>
        </el-scrollbar>
      </div>
      
      <div class="sidebar-footer">
        <el-avatar :size="32" style="background-color: var(--el-color-primary)">
            {{ userStore.username ? userStore.username.charAt(0).toUpperCase() : 'U' }}
        </el-avatar>
        <span class="my-name">{{ userStore.username }}</span>
      </div>
    </div>

    <div class="chat-window">
      <template v-if="activeChatUser">
        <div class="chat-header">
          <div class="header-info">
            <span class="header-name">{{ activeChatUser.name || activeChatUser.username }}</span>
            <span class="header-status">線上</span>
          </div>
          <el-button :icon="MoreFilled" circle plain />
        </div>

        <div class="message-area message-scroll-container">
          <el-scrollbar ref="scrollbarRef">
            <div class="message-list">
              <div 
                v-for="(msg, index) in currentMessages" 
                :key="index"
                class="message-row"
                :class="{ 'message-mine': msg.sender === userStore.username }"
              >
                <el-avatar 
                  v-if="msg.sender !== userStore.username"
                  :size="36" 
                  class="msg-avatar"
                  :style="{ backgroundColor: stringToColor(msg.sender) }"
                >
                  {{ msg.sender.charAt(0).toUpperCase() }}
                </el-avatar>

                <div class="message-content-wrapper">
                  <div class="sender-name" v-if="msg.sender !== userStore.username">
                    {{ msg.sender }}
                  </div>
                  <div class="bubble">
                    {{ msg.content }}
                  </div>
                </div>
              </div>
              
              <div v-if="currentMessages.length === 0" class="no-message-tip">
                尚無對話紀錄，傳送一則訊息打個招呼吧！
              </div>
            </div>
          </el-scrollbar>
        </div>

        <div class="input-area">
          <el-input
            v-model="messageInput"
            type="textarea"
            :rows="3"
            placeholder="輸入訊息..."
            resize="none"
            @keydown.enter.prevent="handleSendMessage"
          />
          <div class="input-actions">
            <el-button type="primary" :icon="Promotion" @click="handleSendMessage">
              傳送
            </el-button>
          </div>
        </div>
      </template>

      <div v-else class="empty-state">
        <el-icon :size="100" color="#dcdfe6"><UserFilled /></el-icon>
        <p>請從左側選擇一位聯絡人開始聊天</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
function stringToColor(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const c = (hash & 0x00ffffff).toString(16).toUpperCase();
  return '#' + '00000'.substring(0, 6 - c.length) + c;
}
</script>

<style scoped lang="scss">
.chat-container { display: flex; height: calc(100vh - 60px); background-color: #fff; border-top: 1px solid var(--el-border-color-light); }
.sidebar { width: 320px; border-right: 1px solid var(--el-border-color-light); display: flex; flex-direction: column; background-color: var(--el-fill-color-light); }
.search-bar { padding: 16px; background-color: #fff; border-bottom: 1px solid var(--el-border-color-lighter); }
.contact-list { flex: 1; overflow: hidden; }
.contact-item { display: flex; padding: 12px 16px; cursor: pointer; transition: background-color 0.2s; border-bottom: 1px solid var(--el-border-color-lighter); &:hover { background-color: #f5f7fa; } &.active { background-color: #e6f7ff; border-right: 3px solid var(--el-color-primary); } }
.contact-avatar { margin-right: 12px; flex-shrink: 0; color: #fff; font-weight: bold; }
.contact-info { flex: 1; overflow: hidden; display: flex; flex-direction: column; justify-content: center; }
.contact-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
.contact-name { font-weight: 600; color: var(--el-text-color-primary); font-size: 15px; }
.contact-time { font-size: 12px; color: var(--el-text-color-secondary); }
.contact-preview { font-size: 13px; color: var(--el-text-color-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.sidebar-footer { padding: 12px 16px; border-top: 1px solid var(--el-border-color-light); background-color: #fff; display: flex; align-items: center; gap: 10px; }
.my-name { font-weight: bold; font-size: 14px; }
.chat-window { flex: 1; display: flex; flex-direction: column; background-color: #fff; }
.chat-header { height: 64px; padding: 0 24px; border-bottom: 1px solid var(--el-border-color-light); display: flex; align-items: center; justify-content: space-between; background-color: #fff; }
.header-name { font-size: 18px; font-weight: 600; margin-right: 8px; }
.header-status { font-size: 12px; color: #67c23a; background: #f0f9eb; padding: 2px 6px; border-radius: 4px; }
.message-area { flex: 1; background-color: #f2f4f5; padding: 20px 0; overflow: hidden; }
.message-list { padding: 0 24px; }
.message-row { display: flex; margin-bottom: 20px; align-items: flex-start; &.message-mine { flex-direction: row-reverse; .msg-avatar { margin-left: 12px; margin-right: 0; } .message-content-wrapper { align-items: flex-end; } .bubble { background-color: #95ec69; color: #000; border-radius: 8px 0 8px 8px; } } }
.msg-avatar { margin-right: 12px; flex-shrink: 0; color: #fff; font-size: 14px; }
.message-content-wrapper { display: flex; flex-direction: column; max-width: 70%; }
.sender-name { font-size: 12px; color: var(--el-text-color-secondary); margin-bottom: 4px; }
.bubble { padding: 10px 14px; background-color: #fff; color: var(--el-text-color-primary); border-radius: 0 8px 8px 8px; font-size: 15px; line-height: 1.5; box-shadow: 0 1px 2px rgba(0,0,0,0.05); word-wrap: break-word; white-space: pre-wrap; }
.no-message-tip { text-align: center; color: #999; margin-top: 40px; font-size: 14px; }
.input-area { padding: 16px 24px; background-color: #fff; border-top: 1px solid var(--el-border-color-light); }
.input-actions { display: flex; justify-content: flex-end; margin-top: 12px; }
.empty-state { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; color: var(--el-text-color-secondary); background-color: #f5f7fa; p { margin-top: 16px; font-size: 16px; } }
html.dark { .chat-container, .sidebar, .chat-header, .input-area, .sidebar-footer { background-color: var(--el-bg-color); } .message-area { background-color: #1a1a1a; } .contact-item:hover { background-color: #2c2c2c; } .contact-item.active { background-color: #1e3a5f; } .bubble { background-color: #363636; color: #eee; } .message-row.message-mine .bubble { background-color: #2b5c28; color: #eee; } }
</style>