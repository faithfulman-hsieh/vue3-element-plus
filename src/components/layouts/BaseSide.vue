<script lang="ts" setup>
import {
  Document,
  User,
  InfoFilled,
  Setting,
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
<!--    <el-sub-menu index="1">-->
<!--      <template #title>-->
<!--        <el-icon><User /></el-icon>-->
<!--        <span>使用者管理</span>-->
<!--      </template>-->
<!--      <el-menu-item-group>-->
<!--        <template #title><span>Group One</span></template>-->
<!--        <el-menu-item index="/nav/1/item-1">item one</el-menu-item>-->
<!--        <el-menu-item index="1-2">item two</el-menu-item>-->
<!--      </el-menu-item-group>-->
<!--      <el-menu-item-group title="Group Two">-->
<!--        <el-menu-item index="1-3">item three</el-menu-item>-->
<!--      </el-menu-item-group>-->
<!--    </el-sub-menu>-->
    <el-menu-item index="/user">
      <el-icon><User /></el-icon>
      <template #title>使用者管理</template>
    </el-menu-item>
<!--    <el-menu-item index="3" disabled>-->
    <el-menu-item index="/todo">
      <el-icon><Document /></el-icon>
      <template #title>待辦管理</template>
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