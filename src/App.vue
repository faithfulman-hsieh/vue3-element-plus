<script setup lang="ts">
import { ref, watch, provide, nextTick, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import BaseHeader from './components/layouts/BaseHeader.vue';
import BaseSide from './components/layouts/BaseSide.vue';
// ★★★ [Global Call] 引入 Store 與 Icons ★★★
import { useChatStore } from './stores/chatStore';
import { Phone, PhoneFilled } from '@element-plus/icons-vue';

// ★★★ [Mobile Fix] 手機版選單狀態控制 ★★★
const isMobileMenuOpen = ref(false);
const route = useRoute();

// ★★★ [Global Call] 初始化 ChatStore ★★★
const chatStore = useChatStore();

// ★★★ [Global Call] 視訊元素 Ref ★★★
const localVideo = ref<HTMLVideoElement | null>(null);
const remoteVideo = ref<HTMLVideoElement | null>(null);

// ★★★ [Global Call] 鈴聲物件 ★★★
const ringtoneAudio = new Audio('https://media.twiliocdn.com/sdk/js/client/sounds/releases/1.0.0/incoming.mp3'); 
ringtoneAudio.loop = true;

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
};

// ★★★ [Mobile Fix] 提供 toggle 方法給 BaseHeader 使用 ★★★
provide('toggleMobileMenu', toggleMobileMenu);

// 當路由改變時，自動收起手機選單
watch(
  () => route.path,
  () => {
    if (window.innerWidth <= 768) {
      isMobileMenuOpen.value = false;
    }
  }
);

// ★★★ [Notification] 請求通知權限 ★★★
onMounted(() => {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
});

// ★★★ [Global Call] 監聽來電狀態，控制鈴聲與原生通知 ★★★
watch(
  () => chatStore.incomingCall,
  (val) => {
    if (val) {
        // 1. 播放鈴聲
        ringtoneAudio.currentTime = 0;
        ringtoneAudio.play().catch(e => console.error('無法播放鈴聲', e));

        // 2. 發送瀏覽器原生通知 (背景時顯示)
        if ('Notification' in window && Notification.permission === 'granted' && document.hidden) {
            const notification = new Notification('來電通知', {
                body: `${val.sender} 正在邀請您進行視訊通話...`,
                icon: '/favicon.ico', // 或您的 Logo 路徑
                tag: 'incoming-call'
            });

            notification.onclick = () => {
                window.focus(); // 點擊通知將視窗帶回前景
                notification.close();
            };
        }
    } else {
        // 停止鈴聲
        ringtoneAudio.pause();
    }
  }
);

// ★★★ [Global Call] 監聽影像流並綁定 Video 元素 ★★★
watch(
  () => chatStore.localStream,
  (newStream) => {
    nextTick(() => {
      if (localVideo.value && newStream) {
        localVideo.value.srcObject = newStream;
      }
    });
  },
  { immediate: true }
);

watch(
  () => chatStore.remoteStream,
  (newStream) => {
    nextTick(() => {
      if (remoteVideo.value && newStream) {
        remoteVideo.value.srcObject = newStream;
      }
    });
  },
  { immediate: true }
);

// ★★★ [Global Call] 離開 App 時停止鈴聲 ★★★
onUnmounted(() => {
  ringtoneAudio.pause();
});
</script>

<template>
  <el-config-provider namespace="ep">
    <BaseHeader />
    
    <div class="main-container flex">
      
      <div 
        class="mobile-overlay" 
        :class="{ open: isMobileMenuOpen }" 
        @click="toggleMobileMenu"
      ></div>

      <aside class="sidebar-wrapper" :class="{ 'mobile-open': isMobileMenuOpen }">
        <BaseSide />
      </aside>

      <div class="content-wrapper" w="full" py="4">
        <RouterView />
      </div>
    </div>

    <div v-if="chatStore.localStream || chatStore.remoteStream" class="global-video-overlay">
        <div class="video-container">
            <video ref="remoteVideo" class="remote-video" autoplay playsinline></video>
            <video ref="localVideo" class="local-video" autoplay playsinline muted></video>
            <div class="video-controls">
                <el-button type="danger" circle size="large" :icon="Phone" @click="chatStore.closeCall()" title="掛斷"></el-button>
            </div>
        </div>
    </div>

    <div v-if="chatStore.incomingCall" class="global-incoming-modal">
        <div class="modal-content">
            <el-avatar :size="80" style="background-color: var(--el-color-primary); margin-bottom: 16px;">
                {{ chatStore.incomingCall.sender.charAt(0).toUpperCase() }}
            </el-avatar>
            <h3>{{ chatStore.incomingCall.sender }}</h3>
            <p>邀請您進行視訊通話...</p>
            <div class="call-actions">
                <el-button type="danger" circle size="large" :icon="Phone" @click="chatStore.rejectCall()"></el-button>
                <el-button type="success" circle size="large" :icon="PhoneFilled" @click="chatStore.acceptCall()" class="accept-btn"></el-button>
            </div>
        </div>
    </div>

  </el-config-provider>
</template>

<style>
#app {
  text-align: center;
  color: var(--ep-text-color-primary);
}

.main-container {
  height: calc(100vh - var(--ep-menu-item-height) - 3px);
  position: relative;
  display: flex;
  overflow: hidden;
}

.content-wrapper {
  flex: 1; 
  overflow: auto; 
  position: relative;
  height: 100%;
}

/* =========================================
   ★★★ [Mobile Fix] 側邊欄響應式樣式 ★★★
   ========================================= */

.sidebar-wrapper {
  height: 100%;
  overflow-y: auto; 
  border-right: 1px solid var(--ep-border-color);
  
  /* ★★★ [Dark Mode Fix] 使用變數，支援深色模式 ★★★ */
  background-color: var(--ep-bg-color); 
  
  transition: transform 0.3s ease; 
  z-index: 2000; 
}

@media (max-width: 768px) {
  .sidebar-wrapper {
    position: absolute; 
    top: 0;
    left: 0;
    bottom: 0;
    width: 250px; 
    transform: translateX(-100%); 
    box-shadow: 2px 0 8px rgba(0,0,0,0.15); 
  }

  .sidebar-wrapper.mobile-open {
    transform: translateX(0); 
  }
  
  .content-wrapper {
    width: 100%;
  }
}

.mobile-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.5);
  z-index: 1999; 
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s;
}

.mobile-overlay.open {
  opacity: 1;
  visibility: visible;
}

/* =========================================
   ★★★ [Global Call] 全域通話介面樣式 ★★★
   ========================================= */

/* 視訊通話 Overlay */
.global-video-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.9);
  z-index: 9999; /* 最高層級 */
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.video-container {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.remote-video {
  width: 100%;
  height: 100%;
  object-fit: contain;
  background: #000;
}

.local-video {
  position: absolute;
  bottom: 20px;
  right: 20px;
  width: 180px;
  height: 135px;
  background: #333;
  border: 2px solid #fff;
  border-radius: 8px;
  object-fit: cover;
  z-index: 10000;
  box-shadow: 0 4px 10px rgba(0,0,0,0.5);
}

/* 手機版視訊視窗調整 */
@media (max-width: 768px) {
  .local-video {
    width: 120px;
    height: 90px;
    bottom: 100px;
    right: 10px;
  }
}

.video-controls {
  position: absolute;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10001;
  display: flex;
  gap: 20px;
}

/* 來電通知彈窗 */
.global-incoming-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.8);
  z-index: 9998;
  display: flex;
  justify-content: center;
  align-items: center;
  backdrop-filter: blur(5px);
}

.modal-content {
  background: #fff;
  padding: 30px 50px;
  border-radius: 16px;
  text-align: center;
  box-shadow: 0 10px 25px rgba(0,0,0,0.3);
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

/* Dark mode 適配 */
html.dark .modal-content {
  background: #1d1e1f;
  color: #fff;
}
html.dark .modal-content h3 {
  color: #fff;
}
html.dark .modal-content p {
  color: #a3a6ad;
}

.call-actions {
  display: flex;
  gap: 40px;
}

.accept-btn {
  animation: pulse 1.5s infinite;
}

@keyframes popIn {
  from { transform: scale(0.8); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(103, 194, 58, 0.7); }
  70% { box-shadow: 0 0 0 15px rgba(103, 194, 58, 0); }
  100% { box-shadow: 0 0 0 0 rgba(103, 194, 58, 0); }
}
</style>