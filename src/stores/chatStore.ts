import { defineStore } from 'pinia'
import { ref } from 'vue'
import { Client, type Message } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { ElNotification } from 'element-plus'
import { chatApi } from '../api/client' // 引用修正後的 client

interface ChatMessage {
  sender: string
  content: string
  // ★★★ [輸入中提示] 新增 TYPING 類型 ★★★
  type: 'CHAT' | 'JOIN' | 'LEAVE' | 'NOTIFICATION' | 'OFFER' | 'ANSWER' | 'CANDIDATE' | 'HANGUP' | 'TYPING'
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

  // 線上使用者名單
  const onlineUsers = ref<Set<string>>(new Set())

  // ★★★ [輸入中提示] 正在輸入的使用者名單 ★★★
  const typingUsers = ref<Set<string>>(new Set())
  // 用來存放清除輸入狀態的 timer (不需具備響應性)
  const typingTimeouts = new Map<string, any>()

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

  // 從後端同步初始名單
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

  // 獲取私訊歷史
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

  // 標記某人已讀
  const markRead = async (contactName: string) => {
    try {
      await chatApi.markAsRead(contactName)
      unreadMap.value[contactName] = 0 // 前端歸零
    } catch (e) {
      console.error(e)
    }
  }

  // 獲取某人的未讀數
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
        fetchOnlineUsers()

        // 訂閱廣播
        client.subscribe('/topic/public-chat', (message: Message) => {
          const body: ChatMessage = JSON.parse(message.body)
          
          // 根據廣播即時更新名單
          if (body.type === 'JOIN') {
            onlineUsers.value.add(body.sender)
          } else if (body.type === 'LEAVE') {
            onlineUsers.value.delete(body.sender)
          }

          // ★★★ [輸入中提示] 處理 TYPING 訊號 ★★★
          if (body.type === 'TYPING') {
            handleTypingSignal(body.sender)
            return // 不加入歷史訊息列表
          }

          if (['CHAT', 'JOIN', 'LEAVE'].includes(body.type)) {
            messages.value.push(body)
          }
        })

        // 訂閱私訊
        client.subscribe('/user/queue/messages', (message: Message) => {
          const body: ChatMessage = JSON.parse(message.body)
          
          // ★★★ [輸入中提示] 處理私訊 TYPING ★★★
          if (body.type === 'TYPING') {
            handleTypingSignal(body.sender)
            return
          }

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
        onlineUsers.value.clear() 
        typingUsers.value.clear() // 斷線時也清除輸入狀態
      }
    })

    client.activate()
    stompClient.value = client
  }

  // ★★★ [輸入中提示] 處理輸入中邏輯：顯示狀態 + 3秒後自動消失 ★★★
  const handleTypingSignal = (sender: string) => {
    // 1. 加入名單
    typingUsers.value.add(sender)
    
    // 2. 如果已有計時器，先清除 (代表對方持續在打字)
    if (typingTimeouts.has(sender)) {
      clearTimeout(typingTimeouts.get(sender))
    }

    // 3. 設定 3 秒後移除
    const timeoutId = setTimeout(() => {
      typingUsers.value.delete(sender)
      typingTimeouts.delete(sender)
    }, 3000)

    typingTimeouts.set(sender, timeoutId)
  }

  // ★★★ [輸入中提示] 發送「我正在輸入」訊號 ★★★
  const sendTyping = (receiver?: string) => {
    if (stompClient.value && isConnected.value) {
      const currentUsername = sessionStorage.getItem('username') || 'Unknown User'
      
      const chatMessage = {
        sender: currentUsername,
        receiver: receiver || undefined,
        content: '', // 內容不重要
        type: 'TYPING'
      }

      stompClient.value.publish({
        destination: '/app/chat.typing', // 對應後端新開的 endpoint
        body: JSON.stringify(chatMessage)
      })
    }
  }

  const disconnect = () => {
    if (stompClient.value) {
      stompClient.value.deactivate()
      stompClient.value = null
      isConnected.value = false
      onlineUsers.value.clear() 
      typingUsers.value.clear()
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
    onlineUsers,
    typingUsers, // ★★★ 匯出 ★★★
    connect,
    disconnect,
    sendMessage,
    sendTyping, // ★★★ 匯出 ★★★
    fetchHistory,
    fetchPrivateHistory,
    markRead,
    fetchUnreadCount,
    fetchOnlineUsers
  }
})