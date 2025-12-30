<script setup lang="ts">
import TheWelcome from '../../components/TheWelcome.vue';
</script>

<template>
  <div class="page-container">
    <div class="header">
      <h1 class="page-title">首頁</h1>
      <span class="subtitle">歡迎來到 JProject 展示平台，以下為建置歷程</span>
    </div>

    <div class="content-box">
      <TheWelcome />
    </div>
  </div>
</template>

<style scoped>
.page-container {
  padding: 20px;
}
.header {
  margin-bottom: 20px;
}
.page-title {
  margin: 0;
  font-size: 24px;
  color: var(--el-text-color-primary);
}
.subtitle {
  font-size: 14px;
  color: var(--el-text-color-secondary);
  margin-top: 5px;
  display: block;
}
/* content-box 可視需求保留或調整 */
.content-box {
  background-color: var(--el-bg-color);
}
</style>