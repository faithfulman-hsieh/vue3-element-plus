<!-- src/components/layouts/BaseSide.vue -->
<script lang="ts" setup>
    import {
      Document,
      User,
      InfoFilled,
      Setting,
      Folder,
      Operation,
      CaretRight, // 替換 Play
      Search,
    } from '@element-plus/icons-vue';

    function handleOpen(key: string, keyPath: string[]) {
      console.log(key, keyPath);
    }
    function handleClose(key: string, keyPath: string[]) {
      console.log(key, keyPath);
    }
</script>

<template>
    <el-menu
            router
            default-active="1"
            class="el-menu-vertical-demo"
            @open="handleOpen"
            @close="handleClose"
    >
        <el-menu-item index="/user">
            <el-icon><User /></el-icon>
            <template #title>使用者管理</template>
        </el-menu-item>
        <el-menu-item index="/todo">
            <el-icon><Document /></el-icon>
            <template #title>待辦管理</template>
        </el-menu-item>
        <el-menu-item index="/process-manage">
            <el-icon><Folder /></el-icon>
            <template #title>流程定義管理</template>
        </el-menu-item>
        <el-menu-item index="/tasks">
            <el-icon><Document /></el-icon>
            <template #title>我的待辦任務</template>
        </el-menu-item>
        <el-menu-item index="/process-start">
            <el-icon><CaretRight /></el-icon> <!-- 替換 Play -->
            <template #title>啟動流程</template>
        </el-menu-item>
        <el-menu-item index="/process-status">
            <el-icon><Search /></el-icon>
            <template #title>流程狀態查詢</template>
        </el-menu-item>
        <el-menu-item index="/process-adjust">
            <el-icon><Operation /></el-icon>
            <template #title>動態流程調整</template>
        </el-menu-item>
        <el-menu-item index="/role-manage">
            <el-icon><User /></el-icon>
            <template #title>角色與權限管理</template>
        </el-menu-item>
        <el-menu-item index="/helloWorld">
            <el-icon><Setting /></el-icon>
            <template #title>元件庫</template>
        </el-menu-item>
        <el-menu-item index="/about">
            <el-icon><InfoFilled /></el-icon>
            <template #title>關於平台</template>
        </el-menu-item>
    </el-menu>
</template>