// src/stores/userStore.ts
import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', () => {
  // 初始化：從 sessionStorage 讀取 Token 和 Username
  const isLoggedIn = ref(!!sessionStorage.getItem('jwtToken'))
  const username = ref(sessionStorage.getItem('username') || '')

  // 修改：登入時接收 username 並儲存
  function login(name: string) {
    isLoggedIn.value = true
    username.value = name
    sessionStorage.setItem('username', name)
  }

  function logout() {
    sessionStorage.removeItem('jwtToken')
    sessionStorage.removeItem('username') // 登出清除 username
    isLoggedIn.value = false
    username.value = ''
  }

  return { isLoggedIn, login, logout, username }
})