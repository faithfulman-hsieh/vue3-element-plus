<script setup lang="ts">
import { ref, watch, provide } from 'vue'; // ★★★ [Mobile Fix] 引入 provide ★★★
import { useRoute } from 'vue-router';
import BaseHeader from './components/layouts/BaseHeader.vue';
import BaseSide from './components/layouts/BaseSide.vue';

// ★★★ [Mobile Fix] 手機版選單狀態控制 ★★★
const isMobileMenuOpen = ref(false);
const route = useRoute();

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

/* PC 版預設樣式 */
.sidebar-wrapper {
  height: 100%;
  overflow-y: auto; 
  border-right: 1px solid var(--ep-border-color);
  
  /* ★★★ [Dark Mode Fix] 使用變數取代 #fff ★★★ */
  background-color: var(--ep-bg-color); 
  
  transition: transform 0.3s ease; 
  z-index: 2000; 
}

/* 手機版樣式 (螢幕寬度 < 768px) */
@media (max-width: 768px) {
  .sidebar-wrapper {
    position: absolute; 
    top: 0;
    left: 0;
    bottom: 0;
    width: 250px; 
    transform: translateX(-100%); /* 預設移出畫面左側 */
    box-shadow: 2px 0 8px rgba(0,0,0,0.15); 
  }

  /* 當選單打開時 */
  .sidebar-wrapper.mobile-open {
    transform: translateX(0); /* 移回畫面 */
  }
  
  .content-wrapper {
    width: 100%;
  }
}

/* 遮罩層樣式 */
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
</style>