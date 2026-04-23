# 協作領域邏輯 (Domain Collaboration)

## 核心概念
- **STOMP 信令**: 包含 `CHAT`, `JOIN`, `LEAVE`, `TYPING`, `CALL_START`, `CALL_END`。
- **WebRTC 會話**: 用於點對點音視訊。

## 業務規則
1. **即時性**: 
    - 輸入狀態 (`TYPING`) 在 3 秒內自動失效。
    - 在線用戶狀態隨 WebSocket 連線動態更新。
2. **通話邏輯**: 
    - 採用 SDP 修改技術強制優先使用 `H264` 編碼。
    - 通話紀錄隨結束信令同步發送至私訊歷史。
3. **系統通知**: 
    - 所有後端推播的通知透過全域 `ElNotification` 提醒並更新未讀數。
