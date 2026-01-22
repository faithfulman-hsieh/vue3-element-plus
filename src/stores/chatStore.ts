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
  // ★★★ [WebRTC Phase 3] 補上 REJECT 類型 ★★★
  // ★★★ [Call Record] 增加 CALL_START, CALL_END 類型 ★★★
  type: 'CHAT' | 'JOIN' | 'LEAVE' | 'NOTIFICATION' | 'OFFER' | 'ANSWER' | 'CANDIDATE' | 'HANGUP' | 'TYPING' | 'READ' | 'REJECT' | 'CALL_START' | 'CALL_END'
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

  // ★★★ [WebRTC Phase 3] 來電資訊狀態 ★★★
  // 當有人打來時，暫存對方的資料 (sender, offer SDP)
  const incomingCall = ref<{ sender: string, offerData: any } | null>(null)

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

          // ★★★ [Call Record] 加入 CALL_START, CALL_END 到接收列表 ★★★
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

  // ★★★ [Call Record] 發送通話紀錄系統訊息 ★★★
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
        
        // 將自己的紀錄也推入列表 (如果後端沒有回傳給發送者的話)
        messages.value.push(msg as ChatMessage)
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

  // ★★★ [WebRTC Phase 3] 接聽電話 (使用者點擊接聽後觸發) ★★★
  const acceptCall = async () => {
    if (!incomingCall.value) return
    
    const { sender, offerData } = incomingCall.value
    currentCallTarget.value = sender // 設定通話對象
    
    // 1. 初始化 WebRTC
    await initWebRTC()
    
    // 2. 設定 Remote Desc
    await peerConnection.value.setRemoteDescription(new RTCSessionDescription(offerData))
    
    // 3. 處理累積的 Candidates (Fix)
    await processCandidateQueue()
    
    // 4. 建立 Answer 並傳送
    const answer = await peerConnection.value.createAnswer()
    await peerConnection.value.setLocalDescription(answer)
    
    console.log('[WebRTC] 同意接聽，發送 ANSWER')
    sendSignal({
        type: 'ANSWER',
        receiver: sender,
        data: JSON.stringify(answer)
    })
    
    // ★★★ [Call Record] 發送通話開始紀錄 ★★★
    sendCallRecord('CALL_START', '通話開始')

    // 清空來電狀態
    incomingCall.value = null
  }

  // ★★★ [WebRTC Phase 3] 拒絕接聽 ★★★
  const rejectCall = () => {
    if (!incomingCall.value) return
    
    const { sender } = incomingCall.value
    console.log('[WebRTC] 拒絕接聽')
    
    // 發送 HANGUP 或 REJECT 訊號通知對方
    sendSignal({
        type: 'HANGUP', // 或者用 REJECT
        receiver: sender
    })
    
    incomingCall.value = null
  }

  // ★★★ [WebRTC] 處理接收到的信令 ★★★
  const handleWebRTCSignal = async (msg: ChatMessage) => {
    const signalData = msg.data ? JSON.parse(msg.data) : null

    if (msg.type === 'OFFER') {
        // ★★★ [WebRTC Phase 3] 收到來電，不自動接聽，改為顯示通知 ★★★
        console.log('[WebRTC] 收到來電 OFFER，等待使用者接聽...')
        
        // 如果已經在通話中，可能要回覆 Busy
        if (peerConnection.value) {
            console.warn('[WebRTC] 通話中收到新來電，暫時忽略')
            return
        }

        // 設定來電狀態，讓 UI 顯示彈窗
        incomingCall.value = {
            sender: msg.sender,
            offerData: signalData
        }
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
            if (peerConnection.value && peerConnection.value.remoteDescription) {
                try {
                    await peerConnection.value.addIceCandidate(new RTCIceCandidate(signalData))
                } catch (e) {
                    console.error('[WebRTC] AddIceCandidate Error', e)
                }
            } else {
                console.log('[WebRTC] RemoteDescription 未就緒，緩存 Candidate')
                candidateQueue.value.push(signalData)
            }
        }
    }
    else if (msg.type === 'HANGUP' || msg.type === 'REJECT') {
        // ★★★ [Call Record] 收到掛斷訊號，只關閉連線，不重複發送紀錄 ★★★
        closeCall(false) 
        ElNotification.info('通話已結束或被拒絕')
    }
  }

  // ★★★ [Call Record] 修改 closeCall，加入 notify 參數 ★★★
  const closeCall = (notify: boolean = true) => {
    if (peerConnection.value) {
        // ★★★ [Call Record] 只有主動掛斷的一方發送結束紀錄，避免重複 ★★★
        if (notify && currentCallTarget.value) {
            sendCallRecord('CALL_END', '通話結束')
            
            // 發送 HANGUP 信令
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
    incomingCall.value = null // 清空來電
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
    // ★★★ [WebRTC Phase 3] 匯出新狀態與方法 ★★★
    incomingCall,
    acceptCall,
    rejectCall,
    // ---
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