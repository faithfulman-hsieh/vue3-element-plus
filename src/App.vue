<script setup lang="ts">
import { ref, watch, provide, nextTick, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import BaseHeader from './components/layouts/BaseHeader.vue';
import BaseSide from './components/layouts/BaseSide.vue';
import { useChatStore } from './stores/chatStore';
import { Phone, PhoneFilled } from '@element-plus/icons-vue';
// ★★★ [PWA + Push] 引入 Firebase 初始化 ★★★
import { initFirebaseMessaging } from './utils/firebase';

// ★★★ [Mobile Fix] 手機版選單狀態控制 ★★★
const isMobileMenuOpen = ref(false);
const route = useRoute();

// ★★★ [Global Call] 初始化 ChatStore ★★★
const chatStore = useChatStore();

// ★★★ [Global Call] 視訊元素 Ref ★★★
const localVideo = ref<HTMLVideoElement | null>(null);
const remoteVideo = ref<HTMLVideoElement | null>(null);

// ★★★ [Global Call] 鈴聲與震動控制 ★★★
const ringtoneAudio = new Audio('https://media.twiliocdn.com/sdk/js/client/sounds/releases/1.0.0/incoming.mp3'); 
ringtoneAudio.loop = true;
// ★★★ [Vibration] 震動計時器 (Android) ★★★
const vibrationInterval = ref<any>(null);

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

// ★★★ [Notification] 請求通知權限 與 PWA 初始化 ★★★
onMounted(async () => {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
  
  // ★★★ [PWA + Push] 啟動 Firebase 監聽 ★★★
  // 這會在背景註冊 Service Worker 並取得 Token
  await initFirebaseMessaging();
});

// ★★★ [Global Call] 監聽來電狀態，控制鈴聲、震動與原生通知 ★★★
watch(
  () => chatStore.incomingCall,
  (val) => {
    if (val) {
        // --- [START] 來電開始 ---
        
        // 1. 播放鈴聲
        ringtoneAudio.currentTime = 0;
        ringtoneAudio.play().catch(e => console.error('無法播放鈴聲 (可能是瀏覽器阻擋自動播放)', e));

        // 2. 啟動震動 (嘗試 DOM API)
        if (navigator.vibrate) {
            const pattern = [1000, 500, 1000];
            navigator.vibrate(pattern);
            
            // 強制循環震動
            vibrationInterval.value = setInterval(() => {
                navigator.vibrate(pattern);
            }, 2500);
        }

        // 3. 發送瀏覽器原生通知
        if ('Notification' in window && Notification.permission === 'granted' && document.hidden) {
            const notification = new Notification('📞 來電通知', {
                body: `${val.sender} 邀請您視訊通話...`,
                icon: '/favicon.ico', 
                tag: 'incoming-call',
                vibrate: [1000, 500, 1000]
            });

            notification.onclick = () => {
                window.focus(); 
                notification.close();
            };
        }
    } else {
        // --- [STOP] 接聽/掛斷/拒絕/結束 ---

        // 1. 停止鈴聲
        ringtoneAudio.pause();
        ringtoneAudio.currentTime = 0;

        // 2. 停止震動
        if (vibrationInterval.value) {
            clearInterval(vibrationInterval.value);
            vibrationInterval.value = null;
        }
        if (navigator.vibrate) {
            navigator.vibrate(0);
        }
    }
  }
);

// ★★★ [Video Fix] 雙向監聽：確保影像流與元素都能正確對應 ★★★

// 1. 監聽「元素掛載」：當 v-if 成立，video 元素出現時，如果已有 stream 就綁定
watch(localVideo, async (el) => {
  if (el && chatStore.localStream) {
    el.srcObject = chatStore.localStream;
    try {
        await el.play();
    } catch (e) {
        console.warn('[WebRTC] Local video play interrupted', e);
    }
  }
});

watch(remoteVideo, async (el) => {
  if (el && chatStore.remoteStream) {
    el.srcObject = chatStore.remoteStream;
    try {
        await el.play();
    } catch (e) {
        console.warn('[WebRTC] Remote video play interrupted', e);
    }
  }
});

// 2. 監聽「Stream 變化」：當元素已存在，且 Stream 發生變化時綁定
watch(
  () => chatStore.localStream,
  async (newStream) => {
    if (localVideo.value && newStream) {
      localVideo.value.srcObject = newStream;
      try {
          await localVideo.value.play();
      } catch (e) {}
    }
  }
);

watch(
  () => chatStore.remoteStream,
  async (newStream) => {
    if (remoteVideo.value && newStream) {
      remoteVideo.value.srcObject = newStream;
      try {
          await remoteVideo.value.play();
      } catch (e) {}
    }
  }
);

// ★★★ [Global Call] 離開 App 時確保所有效果停止 ★★★
onUnmounted(() => {
  ringtoneAudio.pause();
  if (vibrationInterval.value) clearInterval(vibrationInterval.value);
  if (navigator.vibrate) navigator.vibrate(0);
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

.global-video-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.9);
  z-index: 9999; 
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