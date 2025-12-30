<template>
  <div class="page-container">
    <div class="header">
      <h1 class="page-title">關於系統</h1>
      <span class="subtitle">系統使用說明與操作指引</span>
    </div>

    <div class="content-box">
      <p>這裡是指引頁面，未來會放如何使用此展示頁面！</p>
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
.content-box {
  background: var(--el-fill-color-light); /* 改用 Element Plus 變數以支援深色模式 */
  padding: 20px;
  border-radius: 8px;
  border: 1px solid var(--el-border-color-lighter);
}
</style>