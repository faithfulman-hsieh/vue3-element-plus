<!-- src/components/TheWelcome.vue -->
<script setup lang="ts">
import WelcomeItem from './WelcomeItem.vue';
import InitIcon from './icons/IconInit.vue';
import SecurityIcon from './icons/IconSecurity.vue';
import UserInterfaceIcon from './icons/IconUserInterface.vue';
import FunctionIcon from './icons/IconFunction.vue';
import DoingIcon from './icons/IconDoing.vue';
</script>

<template>
  <div class="welcome-container">
    <WelcomeItem>
      <template #icon>
        <InitIcon />
      </template>
      <template #heading>專案初始化</template>
      2024/10 初 專案初始化(後端
      <a href="https://spring.io/guides/gs/spring-boot" target="_blank" rel="noopener">spring-boot</a>
      + 前端
      <a href="https://vuejs.org/guide/quick-start.html" target="_blank" rel="noopener">Vue 3</a>)並布署至雲端(後端
      <a href="https://dashboard.render.com/" target="_blank" rel="noopener">render</a>
      + 前端
      <a href="https://vercel.com/" target="_blank" rel="noopener">vercel</a>)，讓展示脫離本地端的局限。
    </WelcomeItem>

    <WelcomeItem>
      <template #icon>
        <SecurityIcon />
      </template>
      <template #heading>安全與認證</template>
      2024/10 中 - 加入
      <a href="https://spring.io/projects/spring-security" target="_blank" rel="noopener">Spring Security</a>
      、完成 JWT 功能實作、前端加入角色與密碼驗證功能、並完成『使用者管理』(簡易 CRUD 串完前後端)
    </WelcomeItem>

    <WelcomeItem>
      <template #icon>
        <UserInterfaceIcon />
      </template>
      <template #heading>使用者介面改進</template>
      2024/10 ~ 2025/04 - 中文化與表格美化、套用 Element Plus UI 框架、透過 Grok 帶來的一致化 CSS 設計的可能性，UI 最終美化版本。
    </WelcomeItem>

    <WelcomeItem>
      <template #icon>
        <FunctionIcon />
      </template>
      <template #heading>核心功能開發</template>
      2025/04 - 待辦管理 (試作 BPM 流程引擎 V1.0 實作 <a href="https://www.activiti.org/" target="_blank" rel="noopener">Activiti</a> 流程引擎，
      以 BPMN 2.0（Business Process Model and Notation）為標準，讓業務人員和開發者能夠設計流程；透過 流程驅動業務邏輯，自動執行不同環節的任務；支援手動任務（User Task） 和 自動任務（Service Task）；支援條件分支（Gateway），根據不同業務情境執行不同的流程);
      加強『查詢狀態』整合 <a href="https://bpmn.io/toolkit/bpmn-js/" target="_blank" rel="noopener">bpmn-js</a> 讓流程圖可視化且標示進行中的『任務』
    </WelcomeItem>

    <WelcomeItem>
      <template #icon>
        <DoingIcon />
      </template>
      <template #heading>現正進行中</template>
      支援流程版本管理，允許流程隨業務變化而更新；
      提供 角色與權限管理，確保不同用戶在適當的階段執行對應任務；
      動態調整流程（如修改流程路徑、重新分派任務）；
      流程狀態查詢，查看目前有哪些流程正在執行；
      動態表單（Dynamic Form），允許不同流程階段有不同的輸入字段。
    </WelcomeItem>
  </div>
</template>

<style scoped>
.welcome-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

a {
  color: var(--ep-color-primary, #1a73e8); /* 使用 Element Plus 主色，適配暗色模式 */
  text-decoration: none;
  font-weight: 500;
}

a:hover {
  color: var(--ep-color-primary-light-3, #66b1ff); /* 主色淺色變體 */
  text-decoration: underline;
}
</style>