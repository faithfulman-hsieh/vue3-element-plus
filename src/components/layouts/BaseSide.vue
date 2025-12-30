<template>
  <el-menu
    :default-active="route.path"
    class="el-menu-vertical-demo"
    :collapse="isCollapse"
    router
  >
    <el-sub-menu index="/personal">
      <template #title>
        <el-icon><UserFilled /></el-icon>
        <span>我的任務中心</span>
      </template>
      
      <el-menu-item index="/tasks">
        <el-icon><List /></el-icon>
        <template #title>我的待辦任務</template>
      </el-menu-item>

      <el-menu-item index="/process-start">
        <el-icon><CirclePlus /></el-icon>
        <template #title>發起申請</template>
      </el-menu-item>

      <el-menu-item index="/my-request">
        <el-icon><Tickets /></el-icon>
        <template #title>我的申請紀錄</template>
      </el-menu-item>
    </el-sub-menu>

    <el-sub-menu index="/process-admin">
      <template #title>
        <el-icon><Operation /></el-icon>
        <span>流程管理後台</span>
      </template>
      
      <el-menu-item index="/process-manage">
        <el-icon><Files /></el-icon>
        <span>流程定義與部署</span>
      </el-menu-item>

      <el-menu-item index="/process-status">
        <el-icon><Monitor /></el-icon>
        <span>全域流程監控</span>
      </el-menu-item>
    </el-sub-menu>

    <el-sub-menu index="/system">
      <template #title>
        <el-icon><Setting /></el-icon>
        <span>系統管理</span>
      </template>
      <el-menu-item index="/user">
        <el-icon><User /></el-icon>
        <span>用戶權限管理</span>
      </el-menu-item>
    </el-sub-menu>

    <el-sub-menu index="/lab">
      <template #title>
        <el-icon><HelpFilled /></el-icon>
        <span>功能實驗室 (MVP)</span>
      </template>
      <el-menu-item index="/todo">
        <el-icon><Checked /></el-icon>
        <span>簡易待辦 (Todo)</span>
      </el-menu-item>
      
      <el-menu-item index="/helloWorld">
        <el-icon><Grid /></el-icon>
        <span>元件庫範例</span>
      </el-menu-item>
    </el-sub-menu>

    <el-menu-item index="/about">
      <el-icon><InfoFilled /></el-icon>
      <template #title>關於系統</template>
    </el-menu-item>

  </el-menu>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { 
  UserFilled,
  List, 
  Operation, 
  Files, 
  Monitor, 
  Setting, 
  User, 
  HelpFilled, 
  Checked, 
  InfoFilled,
  CirclePlus,
  Tickets,
  Grid
} from '@element-plus/icons-vue'

const isCollapse = ref(false)
const route = useRoute()
</script>

<style scoped>
.el-menu-vertical-demo:not(.el-menu--collapse) {
  width: 250px;
  min-height: 400px;
}
</style>