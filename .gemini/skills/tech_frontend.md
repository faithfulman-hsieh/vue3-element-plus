# 前端技術基礎 (Tech Frontend)

## 核心棧 (Core Stack)
- **框架:** Vue 3.5 (Composition API)
- **語言:** TypeScript
- **組件庫:** Element Plus
- **樣式:** UnoCSS + SCSS
- **狀態管理:** Pinia
- **路由:** 基於文件的類型化路由 (unplugin-vue-router)

## 開發規範
1. **Script Setup:** 始終使用 `<script setup lang="ts">`。
2. **自動導入:** 組件與 Vue API 均採用自動導入，避免手動 import 增加冗餘。
3. **樣式規則:** 優先使用 UnoCSS 工具類處理間距、佈局與暗黑模式適配。
4. **API 調用:** 統一使用 `src/api` 下根據 OpenAPI 生成的 client。
