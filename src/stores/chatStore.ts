import { defineStore } from 'pinia'
import { ref } from 'vue'
import { Client, type Message } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { ElNotification } from 'element-plus'
import { chatApi, userApi } from '../api/client'

interface ChatMessage {
  sender: string
  content: string
  type: 'CHAT' | 'JOIN' | 'LEAVE' | 'NOTIFICATION' | 'OFFER' | 'ANSWER' | 'CANDIDATE' | 'HANGUP' | 'TYPING' | 'READ' | 'REJECT' | 'CALL_START' | 'CALL_END'
  time?: string
  receiver?: string
  data?: string
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

  // WebRTC 相關狀態
  const peerConnection = ref<RTCPeerConnection | null>(null)
  const localStream = ref<MediaStream | null>(null)
  const remoteStream = ref<MediaStream | null>(null)
  const currentCallTarget = ref<string>('') 
  const candidateQueue = ref<RTCIceCandidateInit[]>([])
  const incomingCall = ref<{ sender: string, offerData: any } | null>(null)
  
  // ★★★ [Line-like Call UX] 狀態追蹤 ★★★
  const isCallEstablished = ref(false)
  const callStartTime = ref<number>(0) 

  // ★★★ [Line-like Call UX] 格式化通話時長 (例如 65秒 -> 1:05) ★★★
  const formatDuration = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

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
      const res = await userApi.getUsers()
      if (res.data && Array.isArray(res.data)) {
        res.data.forEach((user: any) => {
            const name = user.username || user.name
            if (name) onlineUsers.value.add(name)
        })
      }
    } catch (e) {
      console.error('[ChatStore] 無法取得使用者名單', e)
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
      heartbeatIncoming: 20000, 
      heartbeatOutgoing: 20000,

      onConnect: () => {
        console.log('[ChatStore] ✅ STOMP 連線成功')
        isConnected.value = true
        fetchHistory()
        fetchOnlineUsers() 

        client.subscribe('/topic/public-chat', (message: Message) => {
          const body: ChatMessage = JSON.parse(message.body)
          if (body.type === 'JOIN') onlineUsers.value.add(body.sender)
          if (body.type === 'TYPING') {
            handleTypingSignal(body.sender)
            return
          }
          if (['CHAT', 'JOIN', 'LEAVE', 'CALL_START', 'CALL_END'].includes(body.type)) {
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
        typingUsers.value.clear()
        closeCall()
      }
    })

    stompClient.value = client
    client.activate()
  }

  // --- WebRTC Logic ---
  const initWebRTC = async () => {
    console.log('[WebRTC] 初始化 PeerConnection')
    candidateQueue.value = [] 
    
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
      
      // ★★★ [Modern Fix] 使用 addTransceiver 並設定 Codec Preferences (解決黑屏) ★★★
      if (localStream.value && peerConnection.value) {
          localStream.value.getTracks().forEach((track) => {
            // 1. 使用 addTransceiver 來建立發送器 (比 addTrack 更穩定)
            const transceiver = peerConnection.value!.addTransceiver(track, { 
                direction: 'sendrecv', 
                streams: [localStream.value!] 
            });

            // 2. 針對視訊軌道，嘗試設定 H.264 為優先編碼
            if (track.kind === 'video') {
                if ('setCodecPreferences' in RTCRtpTransceiver.prototype && RTCRtpSender.getCapabilities) {
                    try {
                        const codecs = RTCRtpSender.getCapabilities('video')?.codecs || [];
                        // 找出所有 H.264 的編碼 (iOS 與 Android 通用的關鍵)
                        const h264Codecs = codecs.filter(c => c.mimeType === 'video/H264');
                        const otherCodecs = codecs.filter(c => c.mimeType !== 'video/H264');
                        
                        if (h264Codecs.length > 0) {
                            // 將 H.264 排在最前面，其他的排在後面
                            transceiver.setCodecPreferences([...h264Codecs, ...otherCodecs]);
                            console.log('[WebRTC] 成功設定 H.264 為優先編碼');
                        } else {
                            console.warn('[WebRTC] 瀏覽器不支援 H.264，維持預設');
                        }
                    } catch (e) {
                        console.warn('[WebRTC] 設定編碼偏好失敗 (非致命錯誤):', e);
                    }
                }
            }
          })
      }
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

  const sendCallRecord = (type: 'CALL_START' | 'CALL_END', content: string) => {
    if (stompClient.value && isConnected.value && currentCallTarget.value) {
        const currentUsername = sessionStorage.getItem('username') || 'Unknown User'
        const msg = {
            sender: currentUsername,
            receiver: currentCallTarget.value,
            content: content,
            type: type,
            read: false
        }
        stompClient.value.publish({
            destination: '/app/chat.sendPrivateMessage',
            body: JSON.stringify(msg)
        })
    }
  }

  const callUser = async (targetUser: string) => {
    currentCallTarget.value = targetUser
    await initWebRTC()
    
    if (!peerConnection.value) return;

    // ★★★ [Safe] 移除手動修改 SDP 的邏輯，使用瀏覽器原生協商 ★★★
    const offer = await peerConnection.value.createOffer()
    await peerConnection.value.setLocalDescription(offer)
    
    console.log('[WebRTC] 發送 OFFER 給', targetUser)
    sendSignal({
      type: 'OFFER',
      receiver: targetUser,
      data: JSON.stringify(offer)
    })
  }

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

  const acceptCall = async () => {
    if (!incomingCall.value) return
    
    const { sender, offerData } = incomingCall.value
    currentCallTarget.value = sender 
    
    isCallEstablished.value = true
    callStartTime.value = Date.now()

    await initWebRTC()
    
    if (!peerConnection.value) return;

    await peerConnection.value.setRemoteDescription(new RTCSessionDescription(offerData))
    await processCandidateQueue()
    
    // ★★★ [Safe] 移除手動修改 SDP 的邏輯 ★★★
    const answer = await peerConnection.value.createAnswer()
    await peerConnection.value.setLocalDescription(answer)
    
    console.log('[WebRTC] 同意接聽，發送 ANSWER')
    sendSignal({
        type: 'ANSWER',
        receiver: sender,
        data: JSON.stringify(answer)
    })
    
    incomingCall.value = null
  }

  const rejectCall = () => {
    if (!incomingCall.value) return
    const { sender } = incomingCall.value
    currentCallTarget.value = sender 
    console.log('[WebRTC] 拒絕接聽')
    
    sendSignal({
        type: 'HANGUP', 
        receiver: sender
    })
    
    sendCallRecord('CALL_END', '未接來電')
    incomingCall.value = null
    currentCallTarget.value = ''
  }

  const handleWebRTCSignal = async (msg: ChatMessage) => {
    const signalData = msg.data ? JSON.parse(msg.data) : null

    if (msg.type === 'OFFER') {
        if (peerConnection.value) { return }
        incomingCall.value = {
            sender: msg.sender,
            offerData: signalData
        }
    }
    else if (msg.type === 'ANSWER') {
        isCallEstablished.value = true
        callStartTime.value = Date.now()

        if (peerConnection.value) {
            await peerConnection.value.setRemoteDescription(new RTCSessionDescription(signalData))
            await processCandidateQueue()
        }
    }
    else if (msg.type === 'CANDIDATE') {
        if (signalData) {
            if (peerConnection.value && peerConnection.value.remoteDescription) {
                try {
                    await peerConnection.value.addIceCandidate(new RTCIceCandidate(signalData))
                } catch (e) {
                    console.error('[WebRTC] AddIceCandidate Error', e)
                }
            } else {
                candidateQueue.value.push(signalData)
            }
        }
    }
    else if (msg.type === 'HANGUP' || msg.type === 'REJECT') {
        closeCall(false) 
        ElNotification.info('通話已結束或被拒絕')
    }
  }

  const closeCall = (notify: boolean = true) => {
    if (peerConnection.value) {
        if (notify && currentCallTarget.value) {
            let msgContent = '取消通話'
            
            if (isCallEstablished.value && callStartTime.value > 0) {
                const durationMs = Date.now() - callStartTime.value
                msgContent = formatDuration(durationMs)
            }

            sendCallRecord('CALL_END', msgContent)
            
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
    candidateQueue.value = [] 
    incomingCall.value = null
    isCallEstablished.value = false
    callStartTime.value = 0
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
    incomingCall,
    acceptCall,
    rejectCall,
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