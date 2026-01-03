import { defineStore } from 'pinia'
import { ref } from 'vue'
import { Client, type Message } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { useUserStore } from './userStore'
import { ElNotification } from 'element-plus'
// ★★★ 1. 引入剛剛匯出的 chatApi ★★★
import { chatApi } from '../api/client'

// 這裡定義的介面要與後端 DTO 對應
interface ChatMessage {
  sender: string
  content: string
  type: 'CHAT' | 'JOIN' | 'LEAVE' | 'NOTIFICATION' | 'OFFER' | 'ANSWER' | 'CANDIDATE' | 'HANGUP'
  time: string
  receiver?: string
  data?: string
}

export const useChatStore = defineStore('chat', () => {
  const stompClient = ref<Client | null>(null)
  const isConnected = ref(false)
  const messages = ref<ChatMessage[]>([])
  const unreadNotificationCount = ref(0)
  
  const userStore = useUserStore()

  // ★★★ 2. 新增：從後端 API 獲取歷史訊息 ★★★
  const fetchHistory = async () => {
    try {
      // 這裡呼叫剛剛實作的 getPublicHistory
      const response = await chatApi.getPublicHistory()
      if (response.data) {
        // 將 API 回傳的資料填入 messages
        messages.value = response.data as unknown as ChatMessage[]
      }
    } catch (error) {
      console.error('無法載入聊天紀錄', error)
    }
  }

  // 連線到後端 WebSocket
  const connect = () => {
    if (isConnected.value || !userStore.token) return

    const client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      connectHeaders: {
        Authorization: `Bearer ${userStore.token}`
      },
      debug: (str) => {
        // 開發階段可以打開 Log
        // console.log('STOMP: ' + str)
      },

      onConnect: () => {
        isConnected.value = true
        console.log('✅ WebSocket 連線成功')

        // ★★★ 3. 連線成功後，立刻載入歷史訊息 ★★★
        fetchHistory()

        // 1. 訂閱公共聊天室
        client.subscribe('/topic/public-chat', (message: Message) => {
          const body: ChatMessage = JSON.parse(message.body)
          if (['CHAT', 'JOIN', 'LEAVE'].includes(body.type)) {
            messages.value.push(body)
          }
        })

        // 2. 訂閱個人通知 (整合工作流通知)
        client.subscribe('/user/queue/notifications', (message: Message) => {
          const body: ChatMessage = JSON.parse(message.body)
          handleNotification(body)
        })

        // 3. 訂閱語音信令 (預留給 Phase 2)
        client.subscribe('/user/queue/signal', (message: Message) => {
          console.log('收到信令:', message.body)
        })

        // 發送上線通知
        client.publish({
          destination: '/app/chat.addUser',
          body: JSON.stringify({
            sender: userStore.userName,
            type: 'JOIN'
          })
        })
      },

      onStompError: (frame) => {
        console.error('❌ STOMP 錯誤', frame.headers['message'])
        isConnected.value = false
      },

      onWebSocketClose: () => {
        console.log('🔌 WebSocket 連線中斷')
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

  // 發送聊天訊息
  const sendMessage = (content: string) => {
    if (stompClient.value && isConnected.value) {
      const chatMessage = {
        sender: userStore.userName,
        content: content,
        type: 'CHAT'
      }
      stompClient.value.publish({
        destination: '/app/chat.sendMessage',
        body: JSON.stringify(chatMessage)
      })
    }
  }

  // 處理系統通知
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
    fetchHistory // 也可以匯出給 UI 手動重新整理用
  }
})