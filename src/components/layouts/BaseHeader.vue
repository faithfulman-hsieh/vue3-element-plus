<script lang="ts" setup>
import { onMounted, watch, inject, computed } from 'vue'; // ★★★ [Feature] 引入 computed ★★★
import { useRouter } from 'vue-router';
import { repository } from '../../../package.json';
import { toggleDark } from '../../composables';
import { useUserStore } from '../../stores/userStore';
import { useChatStore } from '../../stores/chatStore';
import { Bell, ChatDotRound, SwitchButton } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

import logoUrl from '../../assets/logo.svg';

const router = useRouter();
const userStore = useUserStore();
const chatStore = useChatStore();

// ★★★ [Mobile Fix] 注入 App.vue 提供的 toggle 方法 ★★★
const toggleMobileMenu = inject('toggleMobileMenu') as () => void;

// ★★★ [Feature] 計算總未讀數量 (聊天訊息 + 系統通知) ★★★
const totalUnreadCount = computed(() => {
  // 計算 unreadMap 所有值的總和
  const chatUnread = Object.values(chatStore.unreadMap).reduce((sum, count) => sum + count, 0);
  return chatStore.unreadNotificationCount + chatUnread;
});

// ★★★ [Bell -> Chat] 改為跳轉聊天室 ★★★
const handleChatClick = () => {
  // chatStore.unreadNotificationCount = 0; // 可選：是否清除計數，或是進聊天室後再已讀
  router.push('/chatRoom');
};

const handleLogout = () => {
  userStore.logout();
  ElMessage.success('已成功登出');
  router.push('/login');
};

// ★★★ [Mobile Fix] Logo 分流點擊事件 ★★★
const handleLogoIconClick = () => {
  if (window.innerWidth <= 768 && toggleMobileMenu) {
    toggleMobileMenu();
  } else {
    router.push('/');
  }
};

const handleLogoTextClick = () => {
  router.push('/');
};

onMounted(() => {
  if ("Notification" in window && Notification.permission !== "granted") {
    Notification.requestPermission();
  }
  if (userStore.isLoggedIn && !chatStore.isConnected) {
    chatStore.connect();
  }
});

watch(() => userStore.isLoggedIn, (isLoggedIn) => {
  if (isLoggedIn) {
    chatStore.connect();
  } else {
    chatStore.disconnect();
  }
});
</script>

<template>
  <el-menu class="el-menu-demo" mode="horizontal" :ellipsis="false" router>
    
    <el-menu-item index="/">
      <div class="flex items-center justify-center gap-2">
        <img 
          :src="logoUrl" 
          alt="JProject Logo" 
          class="w-8 h-8 logo-hover cursor-pointer" 
          @click.stop.prevent="handleLogoIconClick"
        />
        <span @click.stop.prevent="handleLogoTextClick" class="cursor-pointer">
          JProject 展示平台v1.0
        </span>
      </div>
    </el-menu-item>

    <el-menu-item index="/about" class="desktop-only">
      <span>關於平台</span>
    </el-menu-item>
    
    <el-menu-item index="/user" class="desktop-only">使用者管理</el-menu-item>
    <el-menu-item index="/todo" class="desktop-only">待辦管理</el-menu-item>
    
    <el-menu-item h="full" @click="handleChatClick">
       <el-badge 
         :is-dot="totalUnreadCount > 0"
         class="item"
         style="display: flex; align-items: center;"
       >
         <el-icon><ChatDotRound /></el-icon>
       </el-badge>
       
       <span class="desktop-only" style="margin-left: 8px;">聊天室</span>
    </el-menu-item>

    <el-menu-item h="full" @click="toggleDark()" class="desktop-only">
      <button
        class="w-full cursor-pointer border-none bg-transparent"
        style="height: var(--ep-menu-item-height)"
      >
        <i inline-flex i="dark:ep-moon ep-sunny" />
      </button>
    </el-menu-item>

    <el-menu-item h="full">
      <template v-if="userStore.isLoggedIn">
        <el-popover
          placement="bottom-end"
          :width="220"
          trigger="click"
        >
          <template #reference>
            <div class="size-full flex items-center justify-center cursor-pointer gap-2">
              <el-avatar 
                :size="30" 
                style="background-color: var(--el-color-primary, #409eff); color: var(--el-color-white);"
              >
                {{ userStore.username ? userStore.username.charAt(0).toUpperCase() : 'U' }}
              </el-avatar>
              <span class="text-sm font-medium hidden sm:block desktop-username" style="color: var(--el-text-color-regular);">
                {{ userStore.username }}
              </span>
            </div>
          </template>

          <div class="flex flex-col items-center py-2">
            <el-avatar 
              :size="60" 
              class="mb-3" 
              style="background-color: var(--el-color-primary, #409eff); color: var(--el-color-white); font-size: 24px;"
            >
              {{ userStore.username ? userStore.username.charAt(0).toUpperCase() : 'U' }}
            </el-avatar>
            
            <div class="text-base font-bold" style="color: var(--el-text-color-primary);">
              {{ userStore.username }}
            </div>
            <div class="text-xs mb-2" style="color: var(--el-text-color-secondary);">
              已登入帳號
            </div>

            <el-divider style="margin: 12px 0;" />

            <el-button 
              type="danger" 
              plain 
              class="w-full" 
              @click="handleLogout"
            >
              <el-icon class="mr-1"><SwitchButton /></el-icon>
              登出
            </el-button>
          </div>
        </el-popover>
      </template>
      
      <a v-else class="size-full flex items-center justify-center" :href="repository.url" target="_blank">
        <div i-ri-github-fill />
      </a>
    </el-menu-item>
  </el-menu>
</template>

<style lang="scss">
.el-menu-demo {
  &.ep-menu--horizontal > .ep-menu-item:nth-child(1) {
    margin-right: auto;
  }
}

.logo-hover {
  transition: transform 0.3s ease;
  &:hover {
    transform: scale(1.1);
  }
}

/* ★★★ [Mobile Fix] 響應式隱藏控制 ★★★ */
@media (max-width: 768px) {
  .desktop-only {
    display: none !important;
  }
  
  .desktop-username {
    display: none !important;
  }
}
</style>