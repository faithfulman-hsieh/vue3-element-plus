import { defineStore } from 'pinia'
import { ref } from 'vue'
import { Client, type Message } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { useUserStore } from './userStore'
import { ElNotification } from 'element-plus'
import { chatApi } from '../api/client'

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
  
  const userStore = useUserStore()

  // 獲取歷史訊息
  const fetchHistory = async () => {
    console.log('[ChatStore] 準備呼叫後端 API 獲取歷史訊息...')
    try {
      // 這裡呼叫後端 REST API
      const response = await chatApi.getPublicHistory()
      console.log('[ChatStore] 歷史訊息獲取成功，筆數:', response.data?.length || 0)
      
      if (response.data) {
        messages.value = response.data as unknown as ChatMessage[]
      }
    } catch (error) {
      console.error('[ChatStore] ❌ 無法載入聊天紀錄 (API 呼叫失敗):', error)
    }
  }

  // 連線到後端 WebSocket
  const connect = () => {
    console.log('[ChatStore] connect() 被觸發')

    // 1. 檢查連線狀態
    if (isConnected.value) {
        console.warn('[ChatStore] 狀態顯示已連線，跳過本次連線請求')
        return
    }

    // 2. 檢查 Token
    const token = userStore.token
    if (!token) {
        console.error('[ChatStore] ❌ 找不到 Token！請確認使用者是否已登入')
        return
    }
    console.log('[ChatStore] Token 檢查通過:', token.substring(0, 10) + '...')

    // 3. 設定網址 (變數宣告要在物件外面!)
    const envUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080'
    const BASE_URL = envUrl.replace(/\/+$/, '')
    const wsUrl = `${BASE_URL}/ws`
    console.log('[ChatStore] 目標 WebSocket 網址:', wsUrl)

    // 建立 STOMP 客戶端
    const client = new Client({
      // 指向後端的 /ws 端點
      webSocketFactory: () => {
          console.log('[ChatStore] 正在建立 SockJS 物件...')
          return new SockJS(wsUrl)
      },
      
      connectHeaders: {
        Authorization: `Bearer ${token}`
      },
      
      // ★★★ 開啟 STOMP 除錯模式，這會印出所有底層傳輸細節 ★★★
      debug: (str) => {
        console.log('[STOMP Debug]:', str)
      },

      onConnect: () => {
        console.log('[ChatStore] ✅ STOMP 連線成功 (onConnect)！')
        isConnected.value = true

        // 連線成功後，呼叫 API
        fetchHistory()

        // 訂閱頻道
        console.log('[ChatStore] 開始訂閱頻道...')
        
        client.subscribe('/topic/public-chat', (message: Message) => {
          console.log('[ChatStore] 收到廣播訊息:', message.body)
          const body: ChatMessage = JSON.parse(message.body)
          if (['CHAT', 'JOIN', 'LEAVE'].includes(body.type)) {
            messages.value.push(body)
          }
        })

        client.subscribe('/user/queue/notifications', (message: Message) => {
          console.log('[ChatStore] 收到個人通知:', message.body)
          const body: ChatMessage = JSON.parse(message.body)
          handleNotification(body)
        })

        client.subscribe('/user/queue/signal', (message: Message) => {
          console.log('[ChatStore] 收到語音信令:', message.body)
        })

        // 發送上線通知
        console.log('[ChatStore] 發送上線封包 (JOIN)...')
        client.publish({
          destination: '/app/chat.addUser',
          body: JSON.stringify({
            sender: userStore.userName,
            type: 'JOIN'
          })
        })
      },

      onStompError: (frame) => {
        console.error('[ChatStore] ❌ STOMP 協定錯誤:', frame.headers['message'])
        console.error('[ChatStore] 錯誤詳情:', frame.body)
        isConnected.value = false
      },

      onWebSocketClose: (evt) => {
        console.warn('[ChatStore] 🔌 WebSocket 連線已斷開 (onWebSocketClose)', evt)
        isConnected.value = false
      }
    })

    console.log('[ChatStore] 啟動 Client (activate)...')
    client.activate()
    stompClient.value = client
  }

  const disconnect = () => {
    console.log('[ChatStore] 正在斷線...')
    if (stompClient.value) {
      stompClient.value.deactivate()
      stompClient.value = null
      isConnected.value = false
    }
  }

  const sendMessage = (content: string) => {
    if (stompClient.value && isConnected.value) {
      console.log('[ChatStore] 發送訊息:', content)
      const chatMessage = {
        sender: userStore.userName,
        content: content,
        type: 'CHAT'
      }
      stompClient.value.publish({
        destination: '/app/chat.sendMessage',
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
    if (Notification.permission === "granted") {
      new Notification("工作流通知", { body: msg.content })
    }
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