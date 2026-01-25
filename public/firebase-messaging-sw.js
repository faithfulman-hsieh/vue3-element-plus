importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

// ★★★ 重要：請填回您原本的 Firebase Config 數值 ★★★
// Service Worker 無法讀取 .env，必須在此寫死
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

  const data = payload.data || {};
  const notificationTitle = data.title || '新通知';
  const sender = data.sender || 'system';
  
  // 預設設定 (一般訊息)
  // 震動: 短震動
  let vibratePattern = [200, 100, 200];
  
  // ★★★ 關鍵修正 1: 標籤策略 ★★★
  // 使用 "chat-user-" + sender。
  // 這樣來自同一人的訊息會合併顯示(更新內容)，且配合 renotify: true 會再次震動。
  // 這解決了 "第二則訊息不震動" 的問題 (因為系統不會把它當作 spam，而是當作更新)。
  let tag = 'chat-user-' + sender; 
  let renotify = true; // 強制再次震動

  // ★★★ [Line-like Call] 來電與掛斷邏輯 ★★★
  
  if (data.type === 'OFFER') {
    // [情況 1：來電中]
    // 解決 "不會持續震動"：我們必須給一個超長的震動陣列 (Service Worker 不支援 loop)
    // 這裡定義約 40 秒的響鈴震動 (震動 1s, 停 0.5s ...)
    vibratePattern = [];
    for (let i = 0; i < 30; i++) {
        vibratePattern.push(1000); // 震動 1秒
        vibratePattern.push(500);  // 停 0.5秒
    }
    
    // 使用專屬 Tag，方便 HANGUP 覆蓋
    tag = 'incoming-call-' + sender; 
    renotify = true; 
  } 
  else if (data.type === 'HANGUP') {
    // [情況 2：對方掛斷 / 停止響鈴]
    // 解決 "取消沒有訊息"：使用與 OFFER 相同的 Tag，發送一個 "短震動" 通知來覆蓋舊的
    vibratePattern = [200, 100]; 
    tag = 'incoming-call-' + sender; // 必須完全一樣才能覆蓋
    renotify = true; // 強制覆蓋，這會停止舊的長震動，改為短震動
  }

  const notificationOptions = {
    body: data.body || '您有一則新訊息',
    icon: '/favicon.ico', 
    
    vibrate: vibratePattern,
    tag: tag,
    renotify: renotify, // 這是關鍵！
    
    // 強制通知常駐 (需點擊才消失)
    requireInteraction: true, 
    
    data: data
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