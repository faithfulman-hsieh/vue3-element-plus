import { defineStore } from 'pinia'
import { ref } from 'vue'
import { Client, type Message } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { ElNotification } from 'element-plus'
import { chatApi } from '../api/client' 

interface ChatMessage {
  sender: string
  content: string
  // ★★★ [即時已讀回執] 增加 READ 類型 ★★★
  type: 'CHAT' | 'JOIN' | 'LEAVE' | 'NOTIFICATION' | 'OFFER' | 'ANSWER' | 'CANDIDATE' | 'HANGUP' | 'TYPING' | 'READ'
  time?: string
  receiver?: string
  data?: string
  // ★★★ [即時已讀回執] 增加已讀狀態屬性 ★★★
  read?: boolean
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

  // ★★★ [WebRTC] 新增狀態變數 (Phase 1) ★★★
  // 使用 any 避免 TypeScript 對 RTCPeerConnection 的嚴格檢查報錯 (Legacy Mode)
  const peerConnection = ref<any>(null) 
  const localStream = ref<MediaStream | null>(null)
  const remoteStream = ref<MediaStream | null>(null)
  const currentCallTarget = ref<string>('') // 紀錄當前通話對象

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

  const fetchPrivateHistory = async (contactName: string) => {
    try {
      const res = await chatApi.getPrivateHistory(contactName)
      if (res.data) {
        // 後端 Entity 更新後，這裡會自動帶入 read 狀態
        messages.value = res.data as unknown as ChatMessage[]
      }
    } catch (e) {
      console.error('歷史紀錄獲取失敗', e)
    }
  }

  const markRead = async (contactName: string) => {
    try {
      await chatApi.markAsRead(contactName)
      unreadMap.value[contactName] = 0
    } catch (e) {
      console.error(e)
    }
  }

  const fetchUnreadCount = async (contactName: string) => {
    try {
      const res = await chatApi.getUnreadCount(contactName)
      unreadMap.value[contactName] = Number(res.data)
    } catch (e) {
      console.error(e)
    }
  }

  const connect = () => {
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

    const client = new Client({
      webSocketFactory: () => new SockJS(wsUrl),
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,

      onConnect: () => {
        console.log('[ChatStore] ✅ STOMP 連線成功')
        isConnected.value = true
        fetchHistory()
        fetchOnlineUsers()

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

        client.subscribe('/user/queue/messages', (message: Message) => {
          const body: ChatMessage = JSON.parse(message.body)
          
          // ★★★ [即時已讀回執] 收到已讀訊號：更新本地訊息狀態 ★★★
          if (body.type === 'READ') {
            const reader = body.sender
            const myUsername = sessionStorage.getItem('username')
            messages.value.forEach(msg => {
                if (msg.receiver === reader && msg.sender === myUsername) {
                    msg.read = true
                }
            })
            return
          }

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

        // ★★★ [WebRTC] 訂閱 WebRTC 信令頻道 ★★★
        client.subscribe('/user/queue/signal', (message: Message) => {
          const body: ChatMessage = JSON.parse(message.body)
          console.log('[WebRTC] 收到信令:', body.type)
          handleWebRTCSignal(body)
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
      },

      onWebSocketClose: () => {
        console.warn('[ChatStore] WebSocket 連線斷開')
        isConnected.value = false
        onlineUsers.value.clear() 
        typingUsers.value.clear()
        // [WebRTC] 斷線時也關閉通話
        closeCall()
      }
    })

    stompClient.value = client
    client.activate()
  }

  // ★★★ [WebRTC] 初始化 RTCPeerConnection ★★★
  const initWebRTC = async () => {
    console.log('[WebRTC] 初始化 PeerConnection')
    const config = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' } // Google 免費 STUN
      ]
    }
    peerConnection.value = new RTCPeerConnection(config)

    // 監聽 ICE Candidate
    peerConnection.value.onicecandidate = (event: any) => {
      if (event.candidate) {
        sendSignal({
          type: 'CANDIDATE',
          receiver: currentCallTarget.value,
          data: JSON.stringify(event.candidate)
        })
      }
    }

    // 監聽遠端流
    peerConnection.value.ontrack = (event: any) => {
      console.log('[WebRTC] 收到遠端影像流')
      remoteStream.value = event.streams[0]
    }

    // 獲取本地媒體流
    try {
      localStream.value = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      localStream.value.getTracks().forEach((track) => {
        peerConnection.value.addTrack(track, localStream.value)
      })
    } catch (e) {
      console.error('[WebRTC] 無法存取攝影機/麥克風', e)
      ElNotification.error('無法存取攝影機或麥克風')
    }
  }

  // ★★★ [WebRTC] 發送信令封包 (透過 WebSocket) ★★★
  const sendSignal = (signalMsg: Partial<ChatMessage>) => {
    if (stompClient.value && isConnected.value) {
      const currentUsername = sessionStorage.getItem('username') || 'Unknown User'
      const msg = {
        sender: currentUsername,
        ...signalMsg
      }
      stompClient.value.publish({
        destination: '/app/chat.signal', // 對應 ChatController
        body: JSON.stringify(msg)
      })
    }
  }

  // ★★★ [WebRTC] 發起通話 (Call) ★★★
  const callUser = async (targetUser: string) => {
    currentCallTarget.value = targetUser
    await initWebRTC()
    
    // 建立 Offer
    const offer = await peerConnection.value.createOffer()
    await peerConnection.value.setLocalDescription(offer)
    
    console.log('[WebRTC] 發送 OFFER 給', targetUser)
    sendSignal({
      type: 'OFFER',
      receiver: targetUser,
      data: JSON.stringify(offer)
    })
  }

  // ★★★ [WebRTC] 處理接收到的信令 ★★★
  const handleWebRTCSignal = async (msg: ChatMessage) => {
    const signalData = msg.data ? JSON.parse(msg.data) : null

    // 如果收到 OFFER 且沒有連線，代表是來電 -> 初始化並接聽
    if (msg.type === 'OFFER') {
        if (!peerConnection.value) {
            currentCallTarget.value = msg.sender // 記錄對方是誰
            await initWebRTC()
        }
        
        await peerConnection.value.setRemoteDescription(new RTCSessionDescription(signalData))
        const answer = await peerConnection.value.createAnswer()
        await peerConnection.value.setLocalDescription(answer)
        
        console.log('[WebRTC] 發送 ANSWER 回覆')
        sendSignal({
            type: 'ANSWER',
            receiver: msg.sender,
            data: JSON.stringify(answer)
        })
    }
    else if (msg.type === 'ANSWER') {
        if (peerConnection.value) {
            await peerConnection.value.setRemoteDescription(new RTCSessionDescription(signalData))
        }
    }
    else if (msg.type === 'CANDIDATE') {
        if (peerConnection.value && signalData) {
            await peerConnection.value.addIceCandidate(new RTCIceCandidate(signalData))
        }
    }
    else if (msg.type === 'HANGUP') {
        closeCall()
        ElNotification.info('通話已結束')
    }
  }

  // ★★★ [WebRTC] 掛斷/結束通話 ★★★
  const closeCall = () => {
    if (peerConnection.value) {
        // 通知對方掛斷
        if (currentCallTarget.value) {
            sendSignal({
                type: 'HANGUP',
                receiver: currentCallTarget.value
            })
        }
        peerConnection.value.close()
        peerConnection.value = null
    }
    
    if (localStream.value) {
        localStream.value.getTracks().forEach(track => track.stop())
        localStream.value = null
    }
    
    remoteStream.value = null
    currentCallTarget.value = ''
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

  const disconnect = () => {
    if (stompClient.value) {
      try {
        stompClient.value.deactivate()
      } catch (e) {}
      stompClient.value = null
      isConnected.value = false
      onlineUsers.value.clear() 
      typingUsers.value.clear()
      // [WebRTC]
      closeCall()
    }
  }

  const sendMessage = (content: string, receiver?: string) => {
    if (stompClient.value && isConnected.value) {
      const currentUsername = sessionStorage.getItem('username') || 'Unknown User'
      
      const chatMessage = {
        sender: currentUsername,
        receiver: receiver || undefined,
        content: content,
        type: 'CHAT',
        // ★★★ [即時已讀回執] 發送時預設為未讀 ★★★
        read: false 
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
    // ★★★ [WebRTC] 匯出變數供 UI 使用 ★★★
    localStream,
    remoteStream,
    callUser, // 用於撥打
    closeCall, // 用於掛斷
    // --- End WebRTC ---
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