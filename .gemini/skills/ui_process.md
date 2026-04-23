# 界面定義：流程管理 (UI Process)

## 畫面描述
管理與發起 BPM 流程的入口，包含發起、狀態監控與調整三個主要視圖。

## 畫面欄位 (Views & Fields)
- **發起申請 (ProcessStartView)**:
    - 以卡片 (Card) 形式展示流程定義。
    - `名稱`, `版本`, `狀態` (v.active 顯示為立即申請)。
- **我的申請紀錄 (MyRequestView / ProcessStatusView)**:
    - 表格展示：`ID`, `流程名稱`, `當前任務`, `負責人`, `啟動時間`, `狀態` (Running/Completed)。
- **流程調整面板 (ProcessAdjustView)**:
    - 集成 BPMN 定義圖，支援「跳關」至指定節點。

## 技術行為
- **啟動表單**: 透過 `getProcessFormFields` 獲取啟動變數定義。
- **流程圖展示**: 透過 `getProcessInstanceDiagram` 獲取 XML 與當前路徑。
