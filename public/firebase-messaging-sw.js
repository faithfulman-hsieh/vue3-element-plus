// public/firebase-messaging-sw.js

importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

// ★★★ 請務必確認這裡的 Firebase Config 與您 src/utils/firebase.ts 內的一致 ★★★
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

// 背景訊息處理器 (App 關閉或在背景時觸發)
messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] 收到背景訊息: ', payload);

  const data = payload.data || {};
  const notificationTitle = data.title || '新通知';
  const sender = data.sender || 'system';
  
  // ============================================
  // 1. 一般訊息設定
  // ============================================
  // 震動: 短促有力 (震動 200ms, 停 100ms, 震動 200ms)
  let vibratePattern = [200, 100, 200];
  
  // Tag: 使用 "chat-user-" + sender
  // 這樣來自同一人的訊息會合併顯示在同一格通知中 (避免洗版)，
  // 但因為 renotify: true，每一則新訊息都會強制手機「再次震動」！
  let tag = 'chat-user-' + sender; 
  let renotify = true; 

  // ============================================
  // 2. 通話特殊邏輯 (持續震動增強版)
  // ============================================
  
  if (data.type === 'OFFER') {
    // [情況：來電邀請]
    // ★★★ 修改點：使用迴圈生成「超長」且「強烈」的震動模式 ★★★
    // 總長度約 90 秒 (30次 * 3秒)，感覺上就像不會停一樣
    vibratePattern = [];
    for (let i = 0; i < 30; i++) {
        vibratePattern.push(2000); // 震動 2秒 (加長)
        vibratePattern.push(1000); // 停 1秒
    }
    
    // 使用專屬的 Tag，這很重要！
    // 這樣之後的 HANGUP 訊息才能精準地「找到並覆蓋」這一則正在震動的通知
    tag = 'incoming-call-' + sender; 
    renotify = true; 
  } 
  else if (data.type === 'HANGUP') {
    // [情況：對方掛斷 / 取消]
    // 這裡我們發送一個「極短震動」的通知。
    // 關鍵在於 tag 與上面一模一樣 ('incoming-call-' + sender)。
    // 瀏覽器會用這則新通知「取代」舊的。
    // 因為新通知震動很短，舊的長震動就會被迫立刻停止！
    vibratePattern = [200, 100]; 
    tag = 'incoming-call-' + sender; 
    renotify = true; 
  }

  const notificationOptions = {
    body: data.body || '您有一則新訊息',
    icon: '/favicon.ico', 
    
    vibrate: vibratePattern,
    tag: tag,
    renotify: renotify, // 這是「每次都震動」的關鍵
    
    // 強制通知不自動消失 (類似 Line)，需使用者手動點擊或滑掉
    requireInteraction: true, 
    
    data: data
  };

  // 顯示通知 (觸發作業系統層級行為)
  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// 通知識別點擊事件
self.addEventListener('notificationclick', function(event) {
  console.log('[firebase-messaging-sw.js] 通知被點擊');
  
  // 點擊後關閉通知 (也會停止震動)
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      // 1. 如果已經打開，聚焦該分頁
      for (var i = 0; i < clientList.length; i++) {
        var client = clientList[i];
        if (client.url.indexOf('/') !== -1 && 'focus' in client) {
          return client.focus();
        }
      }
      // 2. 如果沒打開，開啟新視窗
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});