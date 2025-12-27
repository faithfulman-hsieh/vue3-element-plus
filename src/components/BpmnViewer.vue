<template>
  <div class="bpmn-container" ref="bpmnContainer"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue';
// 這裡保留您原本的引用方式
import BpmnJS from 'bpmn-js/lib/NavigatedViewer'; 
// 或 import BpmnJS from 'bpmn-js'; 視您專案安裝的套件而定，建議用 NavigatedViewer 較輕量且支援導航

const props = defineProps({
  bpmnXml: {
    type: String,
    required: true,
  },
  // ★★★ 修改 1：允許 String 或 Array，以支援並行任務 ★★★
  currentTask: {
    type: [String, Array],
    required: false,
    default: null,
  },
});

let bpmnViewer = null;
const bpmnContainer = ref(null);

const renderDiagram = async () => {
  try {
    // 如果 bpmnViewer 已存在，先銷毀 (保留原本邏輯)
    if (bpmnViewer) {
      bpmnViewer.destroy();
    }

    // 初始化 BPMN.js
    bpmnViewer = new BpmnJS({
      container: bpmnContainer.value,
    });

    console.log('Rendering BPMN XML:', props.bpmnXml);
    await bpmnViewer.importXML(props.bpmnXml);
    
    const canvas = bpmnViewer.get('canvas');
    const elementRegistry = bpmnViewer.get('elementRegistry');

    // 自動縮放以適應視窗
    canvas.zoom('fit-viewport', 'auto');

    // ★★★ 修改 2：支援陣列迴圈高亮 ★★★
    if (props.currentTask) {
      console.log('Highlighting tasks:', props.currentTask);
      
      // 統一轉為陣列處理：如果是字串就轉成單一元素的陣列，如果是陣列就直接用
      const tasksToHighlight = Array.isArray(props.currentTask) 
        ? props.currentTask 
        : [props.currentTask];

      tasksToHighlight.forEach(taskId => {
        const element = elementRegistry.get(taskId);
        if (element) {
          // console.log('Element found:', element);
          canvas.addMarker(taskId, 'highlight');
        } else {
          console.warn('Element not found in diagram:', taskId);
        }
      });
      
    } else {
      console.warn('No current task to highlight');
    }
  } catch (error) {
    console.error('渲染流程圖失敗:', error);
  }
};

// 監聽 bpmnXml 和 currentTask 變化，重新渲染流程圖 (保留原本邏輯)
watch(
  () => [props.bpmnXml, props.currentTask],
  async () => {
    if (props.bpmnXml) {
      await nextTick();
      renderDiagram();
    }
  },
  { immediate: true }
);

// 組件卸載時銷毀 bpmnViewer (保留原本邏輯)
onUnmounted(() => {
  if (bpmnViewer) {
    bpmnViewer.destroy();
    bpmnViewer = null;
  }
});
</script>

<style scoped>
.bpmn-container {
  height: 600px;
  width: 100%;
  overflow: auto;
  background-color: #fff; /* 建議加上背景色，避免透明 */
}

/* ★★★ 保留您原本定義完善的樣式 ★★★ */
:deep(.highlight .djs-visual > rect),
:deep(.highlight .djs-visual > circle),
:deep(.highlight .djs-visual > polygon) {
  fill: #fff9c4 !important; /* 淺黃底色 */
  stroke: #ff0000 !important; /* 紅色邊框 */
  stroke-width: 3px !important; /* 加粗一點讓圓形更明顯 */
  stroke-opacity: 1 !important; /* 邊框不透明 */
}

/* 調整文字樣式，確保文字不被遮擋 */
:deep(.highlight .djs-label text) {
  fill: #0000ff !important; /* 藍色文字 */
  stroke: none !important; /* 移除文字邊框 */
  dominant-baseline: middle !important; /* 垂直居中 */
  text-anchor: middle !important; /* 水平居中 */
}

/* 確保文字層級高於邊框 */
:deep(.highlight .djs-label) {
  z-index: 10 !important; /* 提高文字層級 */
}
</style>