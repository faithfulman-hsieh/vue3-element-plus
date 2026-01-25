importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

// 1. 初始化 Firebase (請確保這裡的 Config 與 src/utils/firebase.ts 一致)
// 注意：Service Worker 無法讀取 .env 變數，所以這裡通常需要硬編碼 (Hardcode)
// 如果您之前的檔案裡已經有填好的 Config，請保留您的 Config，只替換下方的 messaging 邏輯
// 1. 初始化 Firebase (填入您的 Config)
firebase.initializeApp({
  apiKey: "AIzaSyDE8QenM05aEXUhKi890IJgLPBuuYNBmR4",
  authDomain: "jproject-push.firebaseapp.com",
  projectId: "jproject-push",
  storageBucket: "jproject-push.firebasestorage.app",
  messagingSenderId: "154327784476",
  appId: "1:154327784476:web:54e43ba1e64174782993d9"
});

const messaging = firebase.messaging();

// 2. 設定背景訊息處理器 (當瀏覽器在背景或關閉時觸發)
messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] 收到背景訊息: ', payload);

  // ★★★ [Line-like Fix] 從 data 讀取內容 (因為後端改成了 Data Message) ★★★
  // 如果後端傳的是 Notification Message，這裡會是 payload.notification
  // 但為了控制震動，我們使用 payload.data
  const notificationTitle = payload.data.title || '新通知';
  const notificationOptions = {
    body: payload.data.body || '您有一則新訊息',
    icon: '/favicon.ico', // 通知圖示，確保 public 資料夾有此檔案
    
    // ★★★ [關鍵] 強制震動與互動設定 ★★★
    // 震動模式：[震動, 停止, 震動, 停止, 震動] (單位 ms)
    // 注意：震動功能在某些 Android 版本或靜音模式下可能會被系統覆蓋
    vibrate: [200, 100, 200, 100, 200], 
    
    // 強制通知不自動消失，直到使用者點擊或滑掉 (類似 Line 的行為)
    // 這是解決 "不會跳出小框框" 的關鍵
    requireInteraction: true,
    
    // 將資料傳遞給點擊事件使用
    data: payload.data,
    
    // 設定標籤，相同 tag 的通知會覆蓋舊的 (避免通知欄爆炸)
    // 如果想要每條都顯示，可以移除這行
    tag: 'chat-message' 
  };

  // 顯示系統通知
  // 這會觸發作業系統層級的通知 (橫幅/震動)
  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// 3. 監聽通知點擊事件
self.addEventListener('notificationclick', function(event) {
  console.log('[firebase-messaging-sw.js] 通知被點擊');
  
  // 點擊後關閉通知
  event.notification.close();

  // 嘗試打開或聚焦視窗
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      // 1. 如果使用者已經打開了聊天室分頁，直接聚焦該分頁
      for (var i = 0; i < clientList.length; i++) {
        var client = clientList[i];
        if (client.url.indexOf('/') !== -1 && 'focus' in client) {
          return client.focus();
        }
      }
      // 2. 如果沒有打開，則開啟新視窗 (回到首頁)
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});

// public/firebase-messaging-sw.js

importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

// 1. 初始化 Firebase (請確保這裡的 Config 與 src/utils/firebase.ts 一致)
// 注意：Service Worker 無法讀取 .env 變數，所以這裡通常需要硬編碼 (Hardcode)
// 如果您之前的檔案裡已經有填好的 Config，請保留您的 Config，只替換下方的 messaging 邏輯
// 1. 初始化 Firebase (填入您的 Config)
const firebaseConfig = {
  apiKey: "AIzaSyDE8QenM05aEXUhKi890IJgLPBuuYNBmR4",
  authDomain: "jproject-push.firebaseapp.com",
  projectId: "jproject-push",
  storageBucket: "jproject-push.firebasestorage.app",
  messagingSenderId: "154327784476",
  appId: "1:154327784476:web:54e43ba1e64174782993d9"
};

// 避免重複初始化
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] 收到背景訊息: ', payload);

  const notificationTitle = payload.data.title || '新通知';
  const notificationOptions = {
    body: payload.data.body || '您有一則新訊息',
    icon: '/favicon.ico',
    
    // ★★★ 震動設定 ★★★
    vibrate: [200, 100, 200], 
    
    // ★★★ 關鍵修正 1: 確保每次都視為新通知 ★★★
    // 方法 A (推薦): 使用時間戳記當 Tag，保證每則都是新的
    tag: 'msg-' + Date.now(), 
    
    // 方法 B (如果你想合併通知但又要震動): 
    // tag: 'chat-message',
    // renotify: true,  <-- 加上這行，就會強制重新震動
    
    // ★★★ 關鍵修正 2: 互動設定 ★★★
    requireInteraction: true, // 需點擊才消失
    
    data: payload.data
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', function(event) {
  console.log('[firebase-messaging-sw.js] 通知被點擊');
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      for (var i = 0; i < clientList.length; i++) {
        var client = clientList[i];
        if (client.url.indexOf('/') !== -1 && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});