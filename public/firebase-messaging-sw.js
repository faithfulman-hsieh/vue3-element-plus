// ★★★ [PWA + Push] Firebase Service Worker ★★★
// Service Worker 運行在獨立執行緒，必須使用 importScripts 引入 SDK
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// 1. 初始化 Firebase (填入您的 Config)
firebase.initializeApp({
  apiKey: "AIzaSyDE8QenM05aEXUhKi890IJgLPBuuYNBmR4",
  authDomain: "jproject-push.firebaseapp.com",
  projectId: "jproject-push",
  storageBucket: "jproject-push.firebasestorage.app",
  messagingSenderId: "154327784476",
  appId: "1:154327784476:web:54e43ba1e64174782993d9"
});

// 2. 取得 Messaging 實例
const messaging = firebase.messaging();

// 3. 設定背景訊息處理器 (當網頁被關閉或在背景時觸發)
messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] 收到背景訊息: ', payload);
  
  // 自訂通知內容
  const notificationTitle = payload.notification?.title || '新通知';
  const notificationOptions = {
    body: payload.notification?.body || '您有一則新訊息',
    icon: '/favicon.ico', // 請確保這個路徑有圖檔，或改為 '/pwa-192x192.png'
    vibrate: [200, 100, 200], // 震動模式 (Android 支援)
    data: payload.data, // 傳遞額外資料
    // 加入這個讓點擊通知時能聚焦視窗
    requireInteraction: true
  };

  // 顯示系統通知
  self.registration.showNotification(notificationTitle, notificationOptions);
});

// 4. 監聽通知點擊事件
self.addEventListener('notificationclick', function(event) {
  console.log('[firebase-messaging-sw.js] 通知被點擊');
  event.notification.close();

  // 點擊後打開或聚焦到 App 頁面
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      // 如果已經有打開的視窗，就聚焦
      for (var i = 0; i < clientList.length; i++) {
        var client = clientList[i];
        if (client.url.indexOf('/') !== -1 && 'focus' in client) {
          return client.focus();
        }
      }
      // 否則打開新視窗
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});