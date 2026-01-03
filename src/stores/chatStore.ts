import { defineStore } from 'pinia'
import { ref } from 'vue'
import { Client, type Message } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { useUserStore } from './userStore'
import { ElNotification } from 'element-plus'

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

  // 連線到後端 WebSocket
  const connect = () => {
    if (isConnected.value || !userStore.token) return

    // 建立 STOMP 客戶端
    const client = new Client({
      // 指向後端的 /ws 端點
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      
      // 將 Token 放入 Header (雖然目前後端 permitAll，但為了未來擴充先放著)
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

        // 1. 訂閱公共聊天室
        client.subscribe('/topic/public-chat', (message: Message) => {
          const body: ChatMessage = JSON.parse(message.body)
          // 只接收聊天相關訊息，避免混入其他類型
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
          // 暫時留空，之後實作語音時會用到
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

  // 處理系統通知 (彈出視窗)
  const handleNotification = (msg: ChatMessage) => {
    unreadNotificationCount.value++
    
    // 使用 Element Plus 的通知元件彈出右下角提醒
    ElNotification({
      title: '系統通知',
      message: msg.content,
      type: 'info',
      duration: 5000, // 5秒後自動消失
      position: 'bottom-right'
    })

    // 如果瀏覽器支援且允許，也可以彈出原生系統通知 (即使瀏覽器縮小也能看到)
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
    sendMessage
  }
})