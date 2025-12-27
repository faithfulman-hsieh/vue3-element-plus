<template>
  <div class="viewer-wrapper">
    <div class="bpmn-container" ref="bpmnContainer"></div>
    
    <div class="viewer-hint" v-if="currentTask">
      <span class="dot"></span> 
      <span>進行中任務</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue';
import BpmnJS from 'bpmn-js';

const props = defineProps({
  bpmnXml: {
    type: String,
    required: true,
  },
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
    if (bpmnViewer) {
      bpmnViewer.destroy();
    }

    bpmnViewer = new BpmnJS({
      container: bpmnContainer.value,
    });

    console.log('Rendering BPMN XML:', props.bpmnXml);
    await bpmnViewer.importXML(props.bpmnXml);
    
    const canvas = bpmnViewer.get('canvas');
    const elementRegistry = bpmnViewer.get('elementRegistry');

    // 1. 先讓圖表適應視窗大小 (此時可能會貼邊)
    canvas.zoom('fit-viewport', 'auto');

    // ★★★ 2. 修改：稍微縮小一點 (例如縮小到 90%)，製造四週留白 ★★★
    const currentZoom = canvas.zoom();
    canvas.zoom(currentZoom * 0.9);

    if (props.currentTask) {
      const tasksToHighlight = Array.isArray(props.currentTask) 
        ? props.currentTask 
        : [props.currentTask];

      tasksToHighlight.forEach(taskId => {
        const element = elementRegistry.get(taskId);
        if (element) {
          canvas.addMarker(taskId, 'highlight');
        }
      });
    }
  } catch (error) {
    console.error('渲染流程圖失敗:', error);
  }
};

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

onUnmounted(() => {
  if (bpmnViewer) {
    bpmnViewer.destroy();
    bpmnViewer = null;
  }
});
</script>

<style scoped>
.viewer-wrapper {
  position: relative;
  width: 100%;
  height: 600px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;
}

.bpmn-container {
  width: 100%;
  height: 100%;
  background-color: #ffffff;
  background-image: radial-gradient(#e0e0e0 1px, transparent 1px);
  background-size: 20px 20px;
}

/* 提示標籤樣式 */
.viewer-hint {
  position: absolute;
  bottom: 20px;
  left: 20px;
  z-index: 9999;
  background: rgba(255, 255, 255, 0.95);
  padding: 8px 12px;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  font-size: 12px;
  color: #606266;
  border: 1px solid #ebeef5;
}

.viewer-hint .dot {
  width: 12px;
  height: 12px;
  border-radius: 2px;
  background-color: rgba(103, 194, 58, 0.2);
  border: 2px solid #67c23a;
  margin-right: 8px;
  display: inline-block;
}

/* 未執行的任務 (預設樣式)：米黃色底 */
:deep(.djs-visual > rect),
:deep(.djs-visual > polygon) {
  fill: #FDF6EC !important; 
}

/* 圓形保持白色 */
:deep(.djs-visual > circle) {
  fill: #ffffff !important; 
}

/* 執行中的任務 (Highlight)：綠色底 + 綠色框 */
:deep(.highlight .djs-visual > rect),
:deep(.highlight .djs-visual > polygon) {
  fill: rgba(103, 194, 58, 0.2) !important; 
  stroke: #67c23a !important;               
  stroke-width: 3px !important;            
}

/* 執行中的圓形 */
:deep(.highlight .djs-visual > circle) {
  fill: rgba(103, 194, 58, 0.2) !important;
  stroke: #67c23a !important;
  stroke-width: 3px !important;
}

/* 執行中的任務文字：黑色 */
:deep(.highlight .djs-label text) {
  fill: #000000 !important; 
  font-weight: bold !important;
}

:deep(.highlight .djs-label) {
  z-index: 10 !important;
}
</style>