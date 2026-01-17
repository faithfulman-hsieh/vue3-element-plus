import { defineStore } from 'pinia'
import { ref } from 'vue'
import { Client, type Message } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { ElNotification } from 'element-plus'
import { chatApi } from '../api/client' // 引用修正後的 client

interface ChatMessage {
  sender: string
  content: string
  type: 'CHAT' | 'JOIN' | 'LEAVE' | 'NOTIFICATION' | 'OFFER' | 'ANSWER' | 'CANDIDATE' | 'HANGUP'
  time?: string
  receiver?: string
  data?: string
}

export const useChatStore = defineStore('chat', () => {
  const stompClient = ref<Client | null>(null)
  const isConnected = ref(false)
  const messages = ref<ChatMessage[]>([])
  const unreadNotificationCount = ref(0)
  
  // 未讀數量對照表 { username: count }
  const unreadMap = ref<Record<string, number>>({})

  // ★★★ [線上使用者狀態] 新增：線上名單 ★★★
  const onlineUsers = ref<Set<string>>(new Set())

  // 獲取歷史紀錄
  const fetchHistory = async () => {
    try {
      const response = await chatApi.getPublicHistory()
      if (response.data) {
        messages.value = response.data as unknown as ChatMessage[]
      }
    } catch (error) {
      console.error('[ChatStore] ❌ 無法載入聊天紀錄:', error)
    }
  }

  // ★★★ [線上使用者狀態] 新增：從後端同步初始名單 ★★★
  const fetchOnlineUsers = async () => {
    try {
      const res = await chatApi.getOnlineUsers()
      if (res.data && Array.isArray(res.data)) {
        res.data.forEach((user: string) => onlineUsers.value.add(user))
      }
    } catch (e) {
      console.error('[ChatStore] 無法取得線上名單', e)
    }
  }

  // ★★★ 新增：獲取私訊歷史 ★★★
  const fetchPrivateHistory = async (contactName: string) => {
    try {
      const res = await chatApi.getPrivateHistory(contactName)
      if (res.data) {
        messages.value = res.data as unknown as ChatMessage[]
      }
    } catch (e) {
      console.error('歷史紀錄獲取失敗', e)
    }
  }

  // ★★★ 新增：標記某人已讀 ★★★
  const markRead = async (contactName: string) => {
    try {
      await chatApi.markAsRead(contactName)
      unreadMap.value[contactName] = 0 // 前端歸零
    } catch (e) {
      console.error(e)
    }
  }

  // ★★★ 新增：獲取某人的未讀數 ★★★
  const fetchUnreadCount = async (contactName: string) => {
    try {
      const res = await chatApi.getUnreadCount(contactName)
      unreadMap.value[contactName] = Number(res.data)
    } catch (e) {
      console.error(e)
    }
  }

  const connect = () => {
    if (isConnected.value) return

    const token = sessionStorage.getItem('jwtToken')
    if (!token) {
        console.error('[ChatStore] ❌ 找不到 Token！請確認使用者是否已登入')
        return
    }

    const envUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080'
    const BASE_URL = envUrl.replace(/\/+$/, '')
    const wsUrl = `${BASE_URL}/ws`

    const client = new Client({
      webSocketFactory: () => new SockJS(wsUrl),
      connectHeaders: { Authorization: `Bearer ${token}` },

      onConnect: () => {
        console.log('[ChatStore] ✅ STOMP 連線成功')
        isConnected.value = true
        fetchHistory()
        // ★★★ [線上使用者狀態] 連線成功後，立即拉取線上名單 ★★★
        fetchOnlineUsers()

        // 訂閱廣播
        client.subscribe('/topic/public-chat', (message: Message) => {
          const body: ChatMessage = JSON.parse(message.body)
          
          // ★★★ [線上使用者狀態] 根據廣播即時更新名單 ★★★
          if (body.type === 'JOIN') {
            onlineUsers.value.add(body.sender)
          } else if (body.type === 'LEAVE') {
            onlineUsers.value.delete(body.sender)
          }

          if (['CHAT', 'JOIN', 'LEAVE'].includes(body.type)) {
            messages.value.push(body)
          }
        })

        // ★★★ 訂閱私訊：收到訊息時增加未讀數 ★★★
        client.subscribe('/user/queue/messages', (message: Message) => {
          const body: ChatMessage = JSON.parse(message.body)
          messages.value.push(body)
          
          const currentUser = sessionStorage.getItem('username')
          // 如果是別人傳給我，增加未讀數
          if (body.sender !== currentUser) {
             if (!unreadMap.value[body.sender]) unreadMap.value[body.sender] = 0
             unreadMap.value[body.sender]++
          }
        })

        client.subscribe('/user/queue/notifications', (message: Message) => {
          const body: ChatMessage = JSON.parse(message.body)
          handleNotification(body)
        })

        const currentUsername = sessionStorage.getItem('username') || 'Unknown User'
        client.publish({
          destination: '/app/chat.addUser',
          body: JSON.stringify({ sender: currentUsername, type: 'JOIN' })
        })
      },

      onStompError: (frame) => {
        console.error('[ChatStore] STOMP 錯誤:', frame.headers['message'])
        isConnected.value = false
      },

      onWebSocketClose: () => {
        console.warn('[ChatStore] WebSocket 連線斷開')
        isConnected.value = false
        onlineUsers.value.clear() // ★★★ [線上使用者狀態] 斷線時清空名單 ★★★
      }
    })

    client.activate()
    stompClient.value = client
  }

  const disconnect = () => {
    if (stompClient.value) {
      stompClient.value.deactivate()
      stompClient.value = null
      isConnected.value = false
      onlineUsers.value.clear() // ★★★ [線上使用者狀態] 斷線時清空名單 ★★★
    }
  }

  const sendMessage = (content: string, receiver?: string) => {
    if (stompClient.value && isConnected.value) {
      const currentUsername = sessionStorage.getItem('username') || 'Unknown User'
      
      const chatMessage = {
        sender: currentUsername,
        receiver: receiver || undefined,
        content: content,
        type: 'CHAT'
      }

      const destination = receiver ? '/app/chat.sendPrivateMessage' : '/app/chat.sendMessage'
      
      stompClient.value.publish({
        destination: destination,
        body: JSON.stringify(chatMessage)
      })
    } else {
        console.warn('[ChatStore] 發送失敗：未連線')
    }
  }

  const handleNotification = (msg: ChatMessage) => {
    unreadNotificationCount.value++
    ElNotification({
      title: '系統通知',
      message: msg.content,
      type: 'info',
      duration: 5000,
      position: 'bottom-right'
    })
  }

  return {
    isConnected,
    messages,
    unreadNotificationCount,
    unreadMap,
    onlineUsers, // ★★★ [線上使用者狀態] 匯出變數供 UI 使用 ★★★
    connect,
    disconnect,
    sendMessage,
    fetchHistory,
    fetchPrivateHistory,
    markRead,
    fetchUnreadCount,
    fetchOnlineUsers // ★★★ [線上使用者狀態] 匯出函式 ★★★
  }
})