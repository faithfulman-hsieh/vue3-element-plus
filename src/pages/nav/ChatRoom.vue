<script lang="ts" setup>
import { ref, computed, onMounted, nextTick, watch, onUnmounted } from 'vue';
import { useUserStore } from '../../stores/userStore';
import { useChatStore } from '../../stores/chatStore';
import { userApi } from '../../api/client';
import { Search, Promotion, UserFilled, MoreFilled, ArrowDown, VideoCamera, Phone, ArrowLeft, PhoneFilled } from '@element-plus/icons-vue'; 
import type { User } from '../../api/models';
import { ElMessage } from 'element-plus';
import type { ElScrollbar } from 'element-plus'; 

const userStore = useUserStore();
const chatStore = useChatStore();

// --- 狀態管理 ---
const contactList = ref<User[]>([]); 
const searchText = ref(''); 
const activeChatUser = ref<User | null>(null); 
const messageInput = ref(''); 
const scrollbarRef = ref<InstanceType<typeof ElScrollbar> | null>(null);

const isAtBottom = ref(true); 
const showScrollButton = ref(false); 
const newMsgCount = ref(0); 

let lastTypingTime = 0;

// ★★★ [Line-like UX] 格式化時間函式 (例如：上午 10:23) ★★★
const formatTime = (isoString?: string) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }); // 會產出 "上午 10:00"
};

// --- 載入資料 ---
onMounted(async () => {
  if (!chatStore.isConnected) {
    chatStore.connect();
  }
  
  try {
    const res = await userApi.getUsers();
    if (res.data) {
      const myUsername = userStore.username;
      contactList.value = res.data.filter((u: User) => {
        const uName = u.username || u.name; 
        return uName !== myUsername;
      });

      contactList.value.forEach(user => {
        const targetId = user.username || user.name;
        if (targetId) {
          chatStore.fetchUnreadCount(targetId);
        }
      });
    }
  } catch (error) {
    console.error('無法載入聯絡人列表', error);
    ElMessage.error('無法載入聯絡人');
  }
});

onUnmounted(() => {
  console.log('[ChatRoom] 元件卸載')
})

// --- 計算屬性 ---
const filteredContacts = computed(() => {
  if (!searchText.value) return contactList.value;
  return contactList.value.filter(user => {
    const name = user.name || user.username || '';
    return name.toLowerCase().includes(searchText.value.toLowerCase());
  });
});

const currentMessages = computed(() => {
  if (!activeChatUser.value) return [];
  
  const myId = userStore.username; 
  const targetId = activeChatUser.value.username || activeChatUser.value.name; 

  if (!targetId) return [];

  return chatStore.messages.filter(msg => {
    const sender = msg.sender;
    const receiver = msg.receiver;

    const sentByMe = sender === myId && receiver === targetId;
    const sentByThem = sender === targetId && (receiver === myId || !receiver);

    return sentByMe || sentByThem;
  });
});

// --- 方法 ---
const selectContact = async (user: User) => {
  activeChatUser.value = user;
  const targetId = user.username || user.name;
  
  if (targetId) {
    await chatStore.fetchPrivateHistory(targetId);
    await chatStore.markRead(targetId);
    scrollToBottom(true); 
  }
};

const handleSendMessage = () => {
  if (!messageInput.value.trim()) return;
  if (!activeChatUser.value) {
    ElMessage.warning('請先選擇聊天對象');
    return;
  }

  const targetId = activeChatUser.value.username || activeChatUser.value.name;
  
  if (!targetId) {
    ElMessage.error('錯誤：無法識別聯絡人 ID');
    return;
  }

  chatStore.sendMessage(messageInput.value, targetId);
  messageInput.value = '';
};

const handleTyping = () => {
  const now = Date.now();
  if (now - lastTypingTime > 2000) {
    const targetId = activeChatUser.value?.username || activeChatUser.value?.name;
    chatStore.sendTyping(targetId);
    lastTypingTime = now;
  }
};

const handleBackToList = () => {
  activeChatUser.value = null;
};

const onScroll = ({ scrollTop }: { scrollTop: number }) => {
  const wrap = scrollbarRef.value?.wrapRef; 
  if (!wrap) return;

  const threshold = 50;
  const isBottom = wrap.scrollHeight - scrollTop - wrap.clientHeight <= threshold;
  
  isAtBottom.value = isBottom;
  showScrollButton.value = !isBottom; 

  if (isBottom) {
    newMsgCount.value = 0;
  }
};

const scrollToBottom = (force: boolean = false) => {
  nextTick(() => {
    const wrap = scrollbarRef.value?.wrapRef;
    if (wrap) {
      wrap.scrollTo({
        top: wrap.scrollHeight,
        behavior: force ? 'auto' : 'smooth' 
      });
      newMsgCount.value = 0;
    }
  });
};

watch(
  () => chatStore.messages.length, 
  async (newLen, oldLen) => {
    if (!activeChatUser.value) return;

    const lastMsg = chatStore.messages[chatStore.messages.length - 1];
    if (!lastMsg) return;

    const myUsername = userStore.username;
    const isMyMsg = lastMsg.sender === myUsername;

    if (isMyMsg || isAtBottom.value) {
      scrollToBottom(isMyMsg); 
    } else {
      newMsgCount.value++;
    }

    const targetId = activeChatUser.value.username || activeChatUser.value.name;
    if (targetId && chatStore.unreadMap[targetId] > 0) {
        await chatStore.markRead(targetId);
    }
  }
);
</script>

<template>
  <div class="chat-container" :class="{ 'mobile-active-chat': !!activeChatUser }">
    
    <div class="sidebar" :class="{ 'mobile-hidden': !!activeChatUser }">
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
            <el-badge 
              :value="chatStore.unreadMap[user.username || user.name]" 
              :hidden="!chatStore.unreadMap[user.username || user.name]" 
              class="avatar-badge"
            >
              <div class="avatar-wrapper">
                <el-avatar 
                  :size="40" 
                  class="contact-avatar" 
                  style="background-color: var(--el-color-primary);"
                >
                  {{ (user.name || user.username || '?').charAt(0).toUpperCase() }}
                </el-avatar>
              </div>
            </el-badge>
            
            <div class="contact-info">
              <div class="contact-top">
                <span class="contact-name">{{ user.name || user.username }}</span>
              </div>
              <div class="contact-preview">
                <span v-if="chatStore.typingUsers.has(user.username || user.name)" style="color: #409eff;">
                  正在輸入...
                </span>
                <span v-else>點擊開始聊天...</span>
              </div>
            </div>
          </div>
        </el-scrollbar>
      </div>
      
      </div>

    <div class="chat-window" :class="{ 'mobile-hidden': !activeChatUser }">
      <template v-if="activeChatUser">
        <div class="chat-header">
          <div class="header-info">
            <el-icon class="back-btn mobile-only" @click="handleBackToList"><ArrowLeft /></el-icon>
            
            <span class="header-name">{{ activeChatUser.name || activeChatUser.username }}</span>
            
            <span class="header-status typing" v-if="chatStore.typingUsers.has(activeChatUser.username || activeChatUser.name)">
              正在輸入...
            </span>
          </div>
          
          <div class="header-actions">
             <el-button 
                v-if="!chatStore.localStream && !chatStore.remoteStream"
                type="primary" 
                circle 
                :icon="VideoCamera" 
                title="發起視訊通話"
                @click="chatStore.callUser(activeChatUser.username || activeChatUser.name)"
             />
          </div>
        </div>

        <div class="message-area message-scroll-container">
          <el-scrollbar ref="scrollbarRef" @scroll="onScroll">
            <div class="message-list">
              <div 
                v-for="(msg, index) in currentMessages" 
                :key="index"
              >
                <div 
                    v-if="msg.type === 'CALL_START' || msg.type === 'CALL_END'" 
                    class="message-row"
                    :class="{ 'message-mine': msg.sender === userStore.username }"
                >
                    <el-avatar 
                        v-if="msg.sender !== userStore.username"
                        :size="36" 
                        class="msg-avatar"
                        style="background-color: var(--el-color-primary);"
                    >
                        {{ msg.sender.charAt(0).toUpperCase() }}
                    </el-avatar>

                    <div class="message-content-wrapper">
                         <div class="sender-name" v-if="msg.sender !== userStore.username">{{ msg.sender }}</div>
                        
                        <div class="bubble-container">
                            <div class="call-bubble">
                                <div class="call-icon-wrapper" :class="{ 'missed': msg.content === '未接來電' || msg.content === '取消通話' }">
                                    <el-icon><PhoneFilled /></el-icon>
                                </div>
                                <div class="call-text">
                                    <div class="call-title">{{ msg.content }}</div>
                                </div>
                            </div>
                            <span class="msg-time">{{ formatTime(msg.time) }}</span>
                        </div>

                        <div v-if="msg.sender === userStore.username" class="message-status">
                            <span v-if="msg.read" class="read-text">已讀</span>
                            <span v-else class="unread-text">送達</span>
                        </div>
                    </div>
                </div>

                <div 
                    v-else
                    class="message-row"
                    :class="{ 'message-mine': msg.sender === userStore.username }"
                >
                    <el-avatar 
                    v-if="msg.sender !== userStore.username"
                    :size="36" 
                    class="msg-avatar"
                    style="background-color: var(--el-color-primary);"
                    >
                    {{ msg.sender.charAt(0).toUpperCase() }}
                    </el-avatar>

                    <div class="message-content-wrapper">
                        <div class="sender-name" v-if="msg.sender !== userStore.username">
                            {{ msg.sender }}
                        </div>
                        
                        <div class="bubble-container">
                            <div class="bubble">{{ msg.content }}</div>
                            <span class="msg-time">{{ formatTime(msg.time) }}</span>
                        </div>

                        <div v-if="msg.sender === userStore.username" class="message-status">
                            <span v-if="msg.read" class="read-text">已讀</span>
                            <span v-else class="unread-text">送達</span>
                        </div>
                    </div>
                </div>
              </div>
              
              <div v-if="currentMessages.length === 0" class="no-message-tip">
                尚無對話紀錄，傳送一則訊息打個招呼吧！
              </div>
            </div>
          </el-scrollbar>

          <transition name="el-fade-in">
            <div 
              v-if="showScrollButton" 
              class="scroll-bottom-btn" 
              @click="scrollToBottom(false)"
            >
              <el-badge :value="newMsgCount" :hidden="newMsgCount === 0" :max="99">
                <div class="btn-circle">
                  <el-icon><ArrowDown /></el-icon>
                </div>
              </el-badge>
              <span v-if="newMsgCount > 0" class="new-msg-text">新訊息</span>
            </div>
          </transition>
        </div>

        <div class="input-area">
          <el-input
            v-model="messageInput"
            type="textarea"
            :rows="3"
            placeholder="輸入訊息..."
            resize="none"
            :disabled="!chatStore.isConnected" 
            @input="handleTyping"
            @keydown.enter.prevent="handleSendMessage"
          />
          <div class="input-actions">
            <el-button 
              type="primary" 
              :icon="Promotion" 
              @click="handleSendMessage"
              :disabled="!chatStore.isConnected"
            >
              {{ chatStore.isConnected ? '傳送' : '連線中...' }}
            </el-button>
          </div>
        </div>
      </template>

      <div v-else class="empty-state" :class="{ 'mobile-hidden': !activeChatUser }">
        <el-icon :size="100" class="empty-icon"><UserFilled /></el-icon>
        <p>請從左側選擇一位聯絡人開始聊天</p>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
/* =========================================
   LIGHT MODE (預設 / 亮色模式)
   ========================================= */

.avatar-wrapper {
  position: relative;
  display: inline-block;
}

/* 1. 外框容器 */
.chat-container {
  display: flex;
  height: calc(100vh - 60px);
  background-color: #ffffff;
  border-top: 1px solid #dcdfe6;
  padding-right: 16px;
  padding-bottom: 16px;
  box-sizing: border-box;
  
  @media (max-width: 768px) {
    padding-right: 0;
    padding-bottom: 0;
    height: calc(100vh - 50px); 
    display: block; 
    position: relative;
    overflow: hidden;
  }
}

/* 2. 側邊欄 */
.sidebar {
  width: 320px;
  display: flex;
  flex-direction: column;
  background-color: #f7f8fa; 
  border-right: 1px solid #e4e7ed; 
  
  @media (max-width: 768px) {
    width: 100%;
    height: 100%;
    border-right: none;
    
    &.mobile-hidden {
      display: none;
    }
  }
}

.search-bar {
  padding: 16px;
  background-color: #f7f8fa;
  border-bottom: 1px solid #e4e7ed;
}

.contact-item {
  display: flex;
  padding: 12px 16px;
  cursor: pointer;
  border-bottom: 1px solid #ebeef5;
  transition: background-color 0.2s;
  
  &:hover { background-color: #e6e8eb; }
  &.active { 
    background-color: #ecf5ff; 
    border-right: 3px solid #01831f;
  }
}

/* 3. 聊天主視窗 */
.chat-window {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #ffffff; 
  position: relative; 
  
  @media (max-width: 768px) {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    z-index: 10;
    
    &.mobile-hidden {
      display: none;
    }
    
    .empty-state {
      display: none; 
    }
  }
}

/* Header & Input */
.chat-header {
  height: 64px;
  padding: 0 24px;
  background-color: #ffffff; 
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
  z-index: 5;
  
  @media (max-width: 768px) {
    padding: 0 12px;
  }
}

.back-btn {
  font-size: 20px;
  margin-right: 10px;
  cursor: pointer;
  display: none;
  
  @media (max-width: 768px) {
    display: inline-flex;
  }
}

.input-area {
  padding: 16px 20px;
  background-color: #ffffff;
  border-top: 1px solid #e4e7ed;
  box-sizing: border-box;
  box-shadow: 0 -2px 6px rgba(0,0,0,0.05);
  z-index: 5;
}

/* 訊息區 */
.message-area {
  flex: 1;
  background-color: #f0f2f5; 
  padding: 20px 0;
  overflow: hidden;
  position: relative; 
}

/* 字體與狀態 */
.contact-name, .header-name { color: #303133; font-weight: 600; font-size: 15px; }
.contact-preview, .contact-time, .sender-name { color: #909399; font-size: 12px; }
.header-status { font-size: 12px; color: #67c23a; background: #f0f9eb; padding: 2px 6px; border-radius: 4px; }

/* ★★★ [輸入中提示] 正在輸入狀態的顏色 ★★★ */
.header-status.typing { color: #409eff; background: #ecf5ff; }

/* 氣泡 */
.bubble {
  padding: 10px 14px;
  background-color: #ffffff;
  color: #303133;
  border-radius: 0 8px 8px 8px;
  font-size: 15px;
  line-height: 1.5;
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
  word-wrap: break-word;
  white-space: pre-wrap;
  max-width: 100%;
}

.message-mine .bubble {
  background-color: #95ec69; 
  color: #000000; 
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
}

/* ★★★ [Line-like UX] 氣泡容器與時間 ★★★ */
.bubble-container {
  display: flex;
  align-items: flex-end; /* 時間靠底對齊 */
  gap: 6px;
}

.message-mine .bubble-container {
  flex-direction: row-reverse; /* 自己發的訊息，時間在氣泡左邊 */
}

.msg-time {
  font-size: 11px;
  color: #909399;
  white-space: nowrap;
  margin-bottom: 2px;
}

.no-message-tip, .empty-state { color: #909399; }
.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #f0f2f5;
  padding-bottom: 24px;
}
.empty-icon { color: #c0c4cc; }

.contact-avatar, .msg-avatar {
  margin-right: 12px;
  flex-shrink: 0;
  background-color: #b2ed95 !important; 
  color: #000000 !important; 
  font-weight: bold;
  border: 1px solid rgba(0, 0, 0, 0.1); 
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
}

/* ★★★ [即時已讀回執] 新增已讀狀態樣式 ★★★ */
.message-status {
  text-align: right;
  font-size: 11px;
  margin-top: 2px;
  margin-right: 2px;
  /* 讓狀態顯示在時間的下方，或你可以選擇與時間併排，這裡採取下方比較整齊 */
}
.read-text { color: #67c23a; } /* 綠色已讀 */
.unread-text { color: #909399; } /* 灰色送達 */

/* ★★★ [Call Record] 系統訊息樣式 ★★★ */
.system-message {
  text-align: center;
  margin: 10px 0;
  
  span {
    background-color: #e0e0e0;
    color: #606266;
    font-size: 12px;
    padding: 4px 10px;
    border-radius: 12px;
  }
}

/* ★★★ [智慧捲動] 懸浮按鈕樣式 ★★★ */
.scroll-bottom-btn {
  position: absolute;
  bottom: 20px;
  right: 30px;
  z-index: 100;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  
  .btn-circle {
    width: 40px;
    height: 40px;
    background-color: #ffffff;
    border-radius: 50%;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    display: flex;
    justify-content: center;
    align-items: center;
    color: #606266;
    transition: all 0.3s;
    
    &:hover {
      background-color: #f2f6fc;
      color: #409eff;
    }
  }

  .new-msg-text {
    margin-top: 5px;
    font-size: 12px;
    color: #409eff;
    background: rgba(255,255,255,0.9);
    padding: 2px 6px;
    border-radius: 4px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }
}

/* ★★★ [Line-like Call UX] 通話氣泡樣式 ★★★ */
.call-bubble {
  display: flex;
  align-items: center;
  padding: 10px 14px;
  background-color: #ffffff; 
  border-radius: 12px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
  min-width: 140px;
}

.message-mine .call-bubble {
    background-color: #ffffff; 
}

.call-icon-wrapper {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #f0f2f5; 
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  color: #606266; 
  
  &.missed {
    color: #f56c6c; 
    background-color: #fef0f0;
  }
}

.call-text {
  display: flex;
  flex-direction: column;
}

.call-title {
  font-size: 14px;
  color: #303133;
  font-weight: 500;
}

.contact-list { flex: 1; overflow: hidden; }
.contact-info { flex: 1; overflow: hidden; display: flex; flex-direction: column; justify-content: center; }
.message-list { padding: 0 24px; }
.message-row { display: flex; margin-bottom: 20px; align-items: flex-start; }
.message-mine { flex-direction: row-reverse; }
.message-mine .msg-avatar { margin-left: 12px; margin-right: 0; }
.message-mine .message-content-wrapper { align-items: flex-end; }
.message-content-wrapper { display: flex; flex-direction: column; max-width: 70%; }
.input-actions { display: flex; justify-content: flex-end; margin-top: 12px; }

.avatar-badge {
  display: flex;
  align-items: center;
  position: relative;
  
  :deep(.el-badge__content) {
    right: 5px; 
    top: 5px;
    z-index: 10;
    
    border: 2px solid #fff; 
    box-shadow: 0 1px 2px rgba(0,0,0,0.2); 
    
    transform: translateY(-50%) translateX(50%);
  }
}

/* =========================================
   DARK MODE (深色模式)
   ========================================= */

html.dark {
  .chat-container { background-color: #141414; border-color: #4c4d4f; }
  
  .sidebar, .search-bar {
    background-color: #1d1e1f;
    border-right: 1px solid #363637;
    border-bottom: 1px solid #363637;
  }
  
  .contact-item {
    border-color: #2c2c2c;
    &:hover { background-color: #262727; }
    &.active { background-color: #18222c; border-right-color: #409eff; }
  }

  .chat-header {
    background-color: #1d1e1f;
    border-bottom: 1px solid #363637;
    box-shadow: 0 2px 6px rgba(0,0,0,0.3);
  }
  
  .input-area {
    background-color: #1d1e1f;
    border-top: 1px solid #363637;
    box-shadow: 0 -2px 6px rgba(0,0,0,0.3);
  }

  .message-area, .empty-state { background-color: #000000; }

  .contact-name, .header-name { color: #e5eaf3; }
  .contact-preview, .contact-time, .sender-name, .no-message-tip, .empty-state p { color: #a3a6ad; }
 .header-status { font-size: 12px; color: #67c23a; background: #f0f9eb; padding: 2px 6px; border-radius: 4px; }
 .header-status.typing { color: #409eff; background: #18222c; } 

  .bubble {
    background-color: #2b2b2b;
    color: #e5eaf3;
    border: 1px solid #4c4d4f;
  }
  .message-mine .bubble {
    background-color: #337ecc; 
    color: #ffffff;
    border: none;
  }
  .empty-icon { color: #4c4d4f; }

  .contact-avatar, .msg-avatar {
    background-color: #409eff !important; 
    color: #fff !important; 
    border: 2px solid #4c4d4f; 
    box-shadow: 0 0 4px rgba(0,0,0,0.5); 
  }
  
  .contact-item.active .contact-avatar {
    border-color: #66b1ff;
  }
  
  .avatar-badge :deep(.el-badge__content) {
    border-color: #1d1e1f;
  }

  .scroll-bottom-btn .btn-circle {
    background-color: #2b2b2b;
    color: #e5eaf3;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.5);
    &:hover { background-color: #363637; }
  }
  .scroll-bottom-btn .new-msg-text {
    background: #2b2b2b;
    color: #66b1ff;
  }
  
  /* [Call Record] Dark Mode 系統訊息 */
  .system-message span {
    background-color: #333;
    color: #a3a6ad;
  }

  /* Call Bubble Dark Mode */
  .call-bubble {
    background-color: #2b2b2b;
    border: 1px solid #4c4d4f;
  }
  .call-icon-wrapper {
    background-color: #363637;
    color: #a3a6ad;
    &.missed { 
        color: #f56c6c; 
        background-color: #4c2b2b; 
    }
  }
  .call-title { color: #e5eaf3; }
}
</style>