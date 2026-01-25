importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

// ★★★ 請務必填回您的 Firebase Config ★★★
const firebaseConfig = {
  apiKey: "AIzaSyDE8QenM05aEXUhKi890IJgLPBuuYNBmR4",
  authDomain: "jproject-push.firebaseapp.com",
  projectId: "jproject-push",
  storageBucket: "jproject-push.firebasestorage.app",
  messagingSenderId: "154327784476",
  appId: "1:154327784476:web:54e43ba1e64174782993d9"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] 收到背景訊息: ', payload);

  const data = payload.data || {};
  const notificationTitle = data.title || '新通知';
  const sender = data.sender || 'system';
  
  // ============================================
  // 1. 一般訊息設定 (您覺得好的部分)
  // ============================================
  // 震動: 短促有力 (震動 200ms, 停 100ms, 震動 200ms)
  let vibratePattern = [200, 100, 200];
  
  // Tag: 使用 "chat-user-" + sender
  // 這樣來自同一人的訊息會合併顯示在同一格通知中 (避免洗版)，
  // 但因為 renotify: true，每一則新訊息都會強制手機「再次震動」！
  let tag = 'chat-user-' + sender; 
  let renotify = true; 

  // ============================================
  // 2. 通話特殊邏輯 (您希望持續震動的部分)
  // ============================================
  
  if (data.type === 'OFFER') {
    // [情況：來電邀請]
    // 我們手動建立一個超長的震動陣列，模擬持續響鈴約 45 秒。
    // 瀏覽器不支援無限 loop，所以用這種暴力法最穩。
    vibratePattern = [
      1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, // 10秒
      1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, // 20秒
      1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, // 30秒
      1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, // 40秒
      1000, 1000, 1000, 1000, 1000
    ];
    
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

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', function(event) {
  console.log('[firebase-messaging-sw.js] 通知被點擊');
  
  // 點擊後關閉通知 (這也會停止震動)
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      // 嘗試聚焦已經打開的分頁
      for (var i = 0; i < clientList.length; i++) {
        var client = clientList[i];
        if (client.url.indexOf('/') !== -1 && 'focus' in client) {
          return client.focus();
        }
      }
      // 否則開啟新視窗
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});