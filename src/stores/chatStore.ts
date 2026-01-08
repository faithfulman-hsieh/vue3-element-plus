import { defineStore } from 'pinia'
import { ref } from 'vue'
import { Client, type Message } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { ElNotification } from 'element-plus'
import { chatApi } from '../api/client'

interface ChatMessage {
  sender: string
  content: string
  type: 'CHAT' | 'JOIN' | 'LEAVE' | 'NOTIFICATION' | 'OFFER' | 'ANSWER' | 'CANDIDATE' | 'HANGUP'
  time?: string
  receiver?: string // 新增：接收者欄位
  data?: string
}

export const useChatStore = defineStore('chat', () => {
  const stompClient = ref<Client | null>(null)
  const isConnected = ref(false)
  const messages = ref<ChatMessage[]>([])
  const unreadNotificationCount = ref(0)
  
  // 獲取歷史訊息
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

  // 連線到後端 WebSocket
  const connect = () => {
    if (isConnected.value) return

    // 1. 從 sessionStorage 讀取 Token
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
      // debug: (str) => console.log(str), // 需要除錯時可打開

      onConnect: () => {
        console.log('[ChatStore] ✅ STOMP 連線成功')
        isConnected.value = true
        fetchHistory()

        // 1. 訂閱廣播頻道 (Public)
        client.subscribe('/topic/public-chat', (message: Message) => {
          const body: ChatMessage = JSON.parse(message.body)
          if (['CHAT', 'JOIN', 'LEAVE'].includes(body.type)) {
            messages.value.push(body)
          }
        })

        // 2. ★★★ 新增：訂閱私訊頻道 (Private) ★★★
        client.subscribe('/user/queue/messages', (message: Message) => {
          console.log('[ChatStore] 收到私訊:', message.body)
          const body: ChatMessage = JSON.parse(message.body)
          messages.value.push(body)
        })

        // 3. 訂閱系統通知
        client.subscribe('/user/queue/notifications', (message: Message) => {
          const body: ChatMessage = JSON.parse(message.body)
          handleNotification(body)
        })

        // 4. 訂閱 WebRTC 信令
        client.subscribe('/user/queue/signal', (message: Message) => {
           // 預留給語音通話
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
        isConnected.value = false
      },

      onWebSocketClose: () => {
        console.warn('[ChatStore] WebSocket 連線斷開')
        isConnected.value = false
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
    }
  }

  // ★★★ 修改：支援發送私訊 ★★★
  const sendMessage = (content: string, receiver?: string) => {
    if (stompClient.value && isConnected.value) {
      const currentUsername = sessionStorage.getItem('username') || 'Unknown User'
      
      const chatMessage = {
        sender: currentUsername,
        receiver: receiver || undefined, // 如果有接收者就填入
        content: content,
        type: 'CHAT'
      }

      // 判斷是私訊還是廣播
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
    connect,
    disconnect,
    sendMessage,
    fetchHistory
  }
})