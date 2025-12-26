<template>
    <div class="bpmn-container" ref="bpmnContainer"></div>
  </template>

  <script setup>
  import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue';
  import BpmnJS from 'bpmn-js';
  import { ElMessage } from 'element-plus';

  const props = defineProps({
    bpmnXml: {
      type: String,
      required: true,
    },
    currentTask: {
      type: String,
      required: false,
      default: null,
    },
  });

  let bpmnViewer = null;
  const bpmnContainer = ref(null);

  const renderDiagram = async () => {
    try {
      // 如果 bpmnViewer 已存在，先銷毀
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

      // 高亮當前任務
      if (props.currentTask) {
        console.log('Highlighting task:', props.currentTask);
        const element = elementRegistry.get(props.currentTask);
        if (element) {
          console.log('Element found:', element);
          canvas.addMarker(props.currentTask, 'highlight');
        } else {
          console.error('Element not found in diagram:', props.currentTask);
        }
      } else {
        console.warn('No current task to highlight');
      }
    } catch (error) {
      // ElMessage.error('渲染流程圖失敗');
      console.error('渲染流程圖失敗:', error);
    }
  };

  // 監聽 bpmnXml 和 currentTask 變化，重新渲染流程圖
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

  // 組件卸載時銷毀 bpmnViewer
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
  }

  /* ★★★ 修正點：擴充支援 circle (圓形) 與 polygon (多邊形) ★★★ */
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