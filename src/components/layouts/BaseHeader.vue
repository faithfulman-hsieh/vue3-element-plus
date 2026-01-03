<script lang="ts" setup>
import { onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { repository } from '../../../package.json';
import { toggleDark } from '../../composables';
import { useUserStore } from '../../stores/userStore';
import { useChatStore } from '../../stores/chatStore';
import { Bell, ChatDotRound } from '@element-plus/icons-vue';

const router = useRouter();
const userStore = useUserStore();
const chatStore = useChatStore();

// 點擊鈴鐺：清除未讀並跳轉至任務頁
const handleNotificationClick = () => {
  chatStore.unreadNotificationCount = 0;
  router.push('/tasks');
};

// 監聽登入狀態與初始化 WebSocket
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
        <div class="text-xl" i-ep-element-plus />
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
      <a class="size-full flex items-center justify-center" :href="repository.url" target="_blank">
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
</style>