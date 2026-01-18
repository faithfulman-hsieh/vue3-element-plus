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
  const peerConnection = ref<any>(null) 
  const localStream = ref<MediaStream | null>(null)
  const remoteStream = ref<MediaStream | null>(null)
  const currentCallTarget = ref<string>('') 
  // ★★★ [WebRTC Fix] 新增 ICE Candidate 緩存佇列 ★★★
  const candidateQueue = ref<RTCIceCandidateInit[]>([])

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
        closeCall()
      }
    })

    stompClient.value = client
    client.activate()
  }

  // ★★★ [WebRTC] 初始化 RTCPeerConnection ★★★
  const initWebRTC = async () => {
    console.log('[WebRTC] 初始化 PeerConnection')
    candidateQueue.value = [] // 初始化時清空佇列
    
    const config = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' } 
      ]
    }
    peerConnection.value = new RTCPeerConnection(config)

    peerConnection.value.onicecandidate = (event: any) => {
      if (event.candidate) {
        sendSignal({
          type: 'CANDIDATE',
          receiver: currentCallTarget.value,
          data: JSON.stringify(event.candidate)
        })
      }
    }

    peerConnection.value.ontrack = (event: any) => {
      console.log('[WebRTC] 收到遠端影像流')
      remoteStream.value = event.streams[0]
    }

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

  const sendSignal = (signalMsg: Partial<ChatMessage>) => {
    if (stompClient.value && isConnected.value) {
      const currentUsername = sessionStorage.getItem('username') || 'Unknown User'
      const msg = {
        sender: currentUsername,
        ...signalMsg
      }
      stompClient.value.publish({
        destination: '/app/chat.signal', 
        body: JSON.stringify(msg)
      })
    }
  }

  const callUser = async (targetUser: string) => {
    currentCallTarget.value = targetUser
    await initWebRTC()
    
    const offer = await peerConnection.value.createOffer()
    await peerConnection.value.setLocalDescription(offer)
    
    console.log('[WebRTC] 發送 OFFER 給', targetUser)
    sendSignal({
      type: 'OFFER',
      receiver: targetUser,
      data: JSON.stringify(offer)
    })
  }

  // ★★★ [WebRTC Fix] 處理緩存的 ICE Candidates ★★★
  const processCandidateQueue = async () => {
    if (!peerConnection.value || !peerConnection.value.remoteDescription) return
    
    while (candidateQueue.value.length > 0) {
      const candidate = candidateQueue.value.shift()
      if (candidate) {
        try {
          await peerConnection.value.addIceCandidate(new RTCIceCandidate(candidate))
          console.log('[WebRTC] 成功加入緩存的 ICE Candidate')
        } catch (e) {
          console.error('[WebRTC] 加入緩存 ICE Candidate 失敗', e)
        }
      }
    }
  }

  // ★★★ [WebRTC] 處理接收到的信令 ★★★
  const handleWebRTCSignal = async (msg: ChatMessage) => {
    const signalData = msg.data ? JSON.parse(msg.data) : null

    if (msg.type === 'OFFER') {
        if (!peerConnection.value) {
            currentCallTarget.value = msg.sender
            await initWebRTC()
        }
        
        await peerConnection.value.setRemoteDescription(new RTCSessionDescription(signalData))
        // 設定完 Remote Description 後，立刻處理累積的 Candidates
        await processCandidateQueue() 
        
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
            // 設定完 Remote Description 後，立刻處理累積的 Candidates
            await processCandidateQueue()
        }
    }
    else if (msg.type === 'CANDIDATE') {
        if (signalData) {
            // ★★★ [WebRTC Fix] 判斷是否準備好接收 Candidate ★★★
            if (peerConnection.value && peerConnection.value.remoteDescription) {
                try {
                    await peerConnection.value.addIceCandidate(new RTCIceCandidate(signalData))
                } catch (e) {
                    console.error('[WebRTC] AddIceCandidate Error', e)
                }
            } else {
                // 如果還沒準備好，先存起來
                console.log('[WebRTC] RemoteDescription 未就緒，緩存 Candidate')
                candidateQueue.value.push(signalData)
            }
        }
    }
    else if (msg.type === 'HANGUP') {
        closeCall()
        ElNotification.info('通話已結束')
    }
  }

  const closeCall = () => {
    if (peerConnection.value) {
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
    candidateQueue.value = [] // 清空緩存
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
    localStream,
    remoteStream,
    callUser, 
    closeCall, 
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