import { defineStore } from 'pinia'
import { ref } from 'vue'
import { Client, type Message } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { ElNotification } from 'element-plus'
import { chatApi } from '../api/client' 

interface ChatMessage {
  sender: string
  content: string
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
  
  const unreadMap = ref<Record<string, number>>({})
  const onlineUsers = ref<Set<string>>(new Set())
  const typingUsers = ref<Set<string>>(new Set())
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
      unreadMap.value[contactName] = 0
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

  // ★★★ [Fix Duplicate Messages] 強化連線邏輯 ★★★
  const connect = () => {
    // 1. 如果已經有 Client 實例，先強制關閉，避免多重連線
    if (stompClient.value) {
      console.warn('[ChatStore] ⚠️ 偵測到殘留連線，正在清理舊連線以避免重複訂閱...')
      try {
        stompClient.value.deactivate()
      } catch (e) {
        console.error('清理舊連線失敗', e)
      }
      stompClient.value = null
      isConnected.value = false
    }

    const token = sessionStorage.getItem('jwtToken')
    if (!token) {
        console.error('[ChatStore] ❌ 找不到 Token！請確認使用者是否已登入')
        return
    }

    const envUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080'
    const BASE_URL = envUrl.replace(/\/+$/, '')
    const wsUrl = `${BASE_URL}/ws`

    // 2. 建立新連線
    const client = new Client({
      webSocketFactory: () => new SockJS(wsUrl),
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000, // 自動重連

      onConnect: () => {
        console.log('[ChatStore] ✅ STOMP 連線成功')
        isConnected.value = true
        fetchHistory()
        fetchOnlineUsers()

        // 訂閱廣播
        client.subscribe('/topic/public-chat', (message: Message) => {
          const body: ChatMessage = JSON.parse(message.body)
          
          if (body.type === 'JOIN') {
            onlineUsers.value.add(body.sender)
          } else if (body.type === 'LEAVE') {
            onlineUsers.value.delete(body.sender)
          }

          if (body.type === 'TYPING') {
            handleTypingSignal(body.sender)
            return
          }

          if (['CHAT', 'JOIN', 'LEAVE'].includes(body.type)) {
            messages.value.push(body)
          }
        })

        // 訂閱私訊
        client.subscribe('/user/queue/messages', (message: Message) => {
          const body: ChatMessage = JSON.parse(message.body)
          
          if (body.type === 'TYPING') {
            handleTypingSignal(body.sender)
            return
          }

          messages.value.push(body)
          
          const currentUser = sessionStorage.getItem('username')
          if (body.sender !== currentUser) {
             if (!unreadMap.value[body.sender]) unreadMap.value[body.sender] = 0
             unreadMap.value[body.sender]++
          }
        })

        // 訂閱通知
        client.subscribe('/user/queue/notifications', (message: Message) => {
          const body: ChatMessage = JSON.parse(message.body)
          handleNotification(body)
        })

        // 發送上線通知
        const currentUsername = sessionStorage.getItem('username') || 'Unknown User'
        client.publish({
          destination: '/app/chat.addUser',
          body: JSON.stringify({ sender: currentUsername, type: 'JOIN' })
        })
      },

      onStompError: (frame) => {
        console.error('[ChatStore] STOMP 錯誤:', frame.headers['message'])
        // 不要在此處設 isConnected = false，讓 stompjs 的重連機制處理
      },

      onWebSocketClose: () => {
        console.warn('[ChatStore] WebSocket 連線斷開')
        isConnected.value = false
        onlineUsers.value.clear() 
        typingUsers.value.clear()
      }
    })

    // 3. 立即賦值給 stompClient，防止快速連續呼叫時建立多個 Client
    stompClient.value = client
    client.activate()
  }

  const handleTypingSignal = (sender: string) => {
    typingUsers.value.add(sender)
    if (typingTimeouts.has(sender)) {
      clearTimeout(typingTimeouts.get(sender))
    }
    const timeoutId = setTimeout(() => {
      typingUsers.value.delete(sender)
      typingTimeouts.delete(sender)
    }, 3000)
    typingTimeouts.set(sender, timeoutId)
  }

  const sendTyping = (receiver?: string) => {
    if (stompClient.value && isConnected.value) {
      const currentUsername = sessionStorage.getItem('username') || 'Unknown User'
      const chatMessage = {
        sender: currentUsername,
        receiver: receiver || undefined,
        content: '',
        type: 'TYPING'
      }
      stompClient.value.publish({
        destination: '/app/chat.typing',
        body: JSON.stringify(chatMessage)
      })
    }
  }

  // ★★★ [Fix Duplicate Messages] 斷線時徹底清理 ★★★
  const disconnect = () => {
    if (stompClient.value) {
      console.log('[ChatStore] 主動斷開連線...')
      try {
        stompClient.value.deactivate()
      } catch (e) {
        // 忽略斷線錯誤
      }
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
    typingUsers,
    connect,
    disconnect,
    sendMessage,
    sendTyping,
    fetchHistory,
    fetchPrivateHistory,
    markRead,
    fetchUnreadCount,
    fetchOnlineUsers
  }
})