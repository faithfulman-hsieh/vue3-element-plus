import { defineStore } from 'pinia'
import { ref } from 'vue'
import { Client, type Message } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { useUserStore } from './userStore'
import { ElNotification } from 'element-plus'
import { chatApi } from '../api/client' // ★★★ 1. 引入 chatApi

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

  // ★★★ 2. 實作獲取歷史訊息 ★★★
  const fetchHistory = async () => {
    try {
      const response = await chatApi.getPublicHistory()
      if (response.data) {
        messages.value = response.data as unknown as ChatMessage[]
      }
    } catch (error) {
      console.error('無法載入聊天紀錄', error)
    }
  }

  const connect = () => {
    if (isConnected.value || !userStore.token) return

    const client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      connectHeaders: {
        Authorization: `Bearer ${userStore.token}`
      },
      
      onConnect: () => {
        isConnected.value = true
        console.log('✅ WebSocket 連線成功')

        // ★★★ 3. 連線成功後，立刻呼叫 API 載入歷史紀錄 ★★★
        fetchHistory()

        // 訂閱公共聊天室
        client.subscribe('/topic/public-chat', (message: Message) => {
          const body: ChatMessage = JSON.parse(message.body)
          if (['CHAT', 'JOIN', 'LEAVE'].includes(body.type)) {
            messages.value.push(body)
          }
        })

        // 訂閱個人通知
        client.subscribe('/user/queue/notifications', (message: Message) => {
          const body: ChatMessage = JSON.parse(message.body)
          handleNotification(body)
        })

        // 訂閱語音信令
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