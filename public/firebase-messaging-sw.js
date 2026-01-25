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

// 背景訊息處理器 (App 關閉或在背景時觸發)
messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] 收到背景訊息: ', payload);

  const data = payload.data || {};
  const notificationTitle = data.title || '新通知';
  
  // 預設設定 (一般訊息)
  // 震動: 震動 200ms, 停 100ms, 震動 200ms
  let vibratePattern = [200, 100, 200];
  // Tag: 使用時間戳記，確保每條訊息都是獨立的，不會被靜音覆蓋
  let tag = 'msg-' + Date.now(); 
  let renotify = false;

  // ★★★ [Line-like Call] 來電與掛斷邏輯 ★★★
  
  if (data.type === 'OFFER') {
    // [情況 1：來電中]
    // 設定長震動模式 (模擬電話響鈴)，持續約 30 秒
    // 格式：[震動, 停止, 震動, 停止, ...] (單位 ms)
    vibratePattern = [
      1500, 500, 1500, 500, 1500, 500, 1500, 500, 1500, 500,
      1500, 500, 1500, 500, 1500, 500, 1500, 500, 1500, 500
    ];
    // 使用固定 Tag，方便之後用 HANGUP 來覆蓋它
    tag = 'incoming-call'; 
    renotify = true; // 強制響鈴/震動
  } 
  else if (data.type === 'HANGUP') {
    // [情況 2：對方掛斷 / 停止響鈴]
    // 技巧：發送一個同 Tag ('incoming-call') 的通知來「覆蓋」原本的來電通知
    // 這次設定極短震動 (代表未接來電提示)，或是空陣列 [] 完全停止震動
    vibratePattern = [200, 100]; 
    tag = 'incoming-call'; 
    renotify = true; // 強制覆蓋舊通知，進而停止舊的震動模式
  }

  const notificationOptions = {
    body: data.body || '您有一則新訊息',
    icon: '/favicon.ico', // 請確保 public 資料夾有此圖示
    
    vibrate: vibratePattern,
    tag: tag,
    renotify: renotify,
    
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

  // 嘗試打開或聚焦聊天視窗
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