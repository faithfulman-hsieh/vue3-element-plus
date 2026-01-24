// ★★★ [PWA + Push] Firebase 初始化工具 ★★★
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage, type Messaging } from "firebase/messaging";
import { ElNotification } from 'element-plus';

// 1. Firebase 設定
const firebaseConfig = {
  apiKey: "AIzaSyDE8QenM05aEXUhKi890IJgLPBuuYNBmR4",
  authDomain: "jproject-push.firebaseapp.com",
  projectId: "jproject-push",
  storageBucket: "jproject-push.firebasestorage.app",
  messagingSenderId: "154327784476",
  appId: "1:154327784476:web:54e43ba1e64174782993d9"
};

// 2. 初始化 App
const app = initializeApp(firebaseConfig);
let messaging: Messaging | null = null;

try {
    messaging = getMessaging(app);
} catch (e) {
    console.warn('[Firebase] Messaging not supported (可能是在非 HTTPS 環境或瀏覽器不支援)', e);
}

// VAPID Key (公鑰)
const VAPID_KEY = "BKYi2fS_hp_ucyfZn-bmEuOy-p4HoShouWDEF4UcIp2yV-gL0M31md2HOhohG6P3273tKjJhyROyoBq-e3VkeQU";

export const initFirebaseMessaging = async () => {
  if (!messaging) return;

  try {
    // 3. 請求通知權限
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      console.log('[Firebase] 通知權限已允許');

      // 4. 註冊 Service Worker (明確指定檔案位置)
      // 注意：scope 設定為 '/' 確保它能控制整個網域
      if ('serviceWorker' in navigator) {
          const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', { scope: '/' });
          console.log('[Firebase] Service Worker 註冊成功:', registration);

          // 5. 取得 FCM Token
          const currentToken = await getToken(messaging, { 
            vapidKey: VAPID_KEY,
            serviceWorkerRegistration: registration 
          });

          if (currentToken) {
            console.log('[Firebase] FCM Token:', currentToken);
            // ★★★ TODO: 未來這裡要呼叫後端 API，將此 Token 傳給後端綁定到當前 User ★★★
            // userApi.updateFcmToken(currentToken);
            
            // 暫時存到 sessionStorage 供測試
            sessionStorage.setItem('fcmToken', currentToken);
          } else {
            console.log('[Firebase] 無法取得 Token，可能需要權限或 VAPID Key 錯誤');
          }
      }
    } else {
      console.log('[Firebase] 通知權限被拒絕');
    }
  } catch (err) {
    console.error('[Firebase] 初始化錯誤:', err);
  }

  // 6. 監聽前景訊息 (當使用者正在瀏覽網頁時收到通知)
  onMessage(messaging, (payload) => {
    console.log('[Firebase] 收到前景訊息:', payload);
    const { title, body } = payload.notification || {};
    
    // 使用 Element Plus 跳出通知
    ElNotification({
      title: title || '新訊息',
      message: body || '',
      type: 'info',
      duration: 5000,
      position: 'top-right'
    });
  });
};