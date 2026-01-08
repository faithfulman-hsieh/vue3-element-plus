<script lang="ts" setup>
import { onMounted, watch } from 'vue';
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

const handleNotificationClick = () => {
  chatStore.unreadNotificationCount = 0;
  router.push('/tasks');
};

const handleLogout = () => {
  userStore.logout();
  ElMessage.success('已成功登出');
  router.push('/login');
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
        <img :src="logoUrl" alt="JProject Logo" class="w-8 h-8 logo-hover" />
        <span>JProject 展示平台</span>
      </div>
    </el-menu-item>
    <el-menu-item index="/about">
      <span>關於平台</span>
    </el-menu-item>
    
    <el-menu-item index="/user">使用者管理</el-menu-item>
    <el-menu-item index="/todo">待辦管理</el-menu-item>
    
    <el-menu-item index="/chatRoom">
      <el-icon><ChatDotRound /></el-icon>
      <span>聊天室</span>
    </el-menu-item>

    <el-menu-item h="full" @click="handleNotificationClick">
       <el-badge 
         :value="chatStore.unreadNotificationCount" 
         :hidden="chatStore.unreadNotificationCount === 0" 
         class="item"
         style="display: flex; align-items: center;"
       >
         <el-icon><Bell /></el-icon>
       </el-badge>
    </el-menu-item>

    <el-menu-item h="full" @click="toggleDark()">
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
              <span class="text-sm font-medium hidden sm:block" style="color: var(--el-text-color-regular);">
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
</style>