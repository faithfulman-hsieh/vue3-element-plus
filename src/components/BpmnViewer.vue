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

    canvas.zoom('fit-viewport', 'auto');
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
  transition: border-color 0.3s;
}

.bpmn-container {
  width: 100%;
  height: 100%;
  /* Light Mode 預設背景 */
  background-color: #ffffff;
  background-image: radial-gradient(#e0e0e0 1px, transparent 1px);
  background-size: 20px 20px;
}

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
</style>

<style>
/* =================================================================
   Light Mode 預設覆蓋 (保持原樣)
   ================================================================= */
.bpmn-container .djs-visual > rect,
.bpmn-container .djs-visual > polygon {
  fill: #FDF6EC !important; 
}
.bpmn-container .djs-visual > circle {
  fill: #ffffff !important; 
}

/* Highlight */
.bpmn-container .highlight .djs-visual > rect,
.bpmn-container .highlight .djs-visual > polygon {
  fill: rgba(103, 194, 58, 0.2) !important; 
  stroke: #67c23a !important;                
  stroke-width: 3px !important;            
}
.bpmn-container .highlight .djs-visual > circle {
  fill: rgba(103, 194, 58, 0.2) !important;
  stroke: #67c23a !important;
  stroke-width: 3px !important;
}
.bpmn-container .highlight .djs-label text {
  fill: #000000 !important; 
  font-weight: bold !important;
}
.bpmn-container .highlight .djs-label {
  z-index: 10 !important;
}

/* =================================================================
   Dark Mode 覆蓋 (核彈級)
   ================================================================= */

/* 1. 容器背景 */
html.dark .viewer-wrapper {
  border-color: #4C4D4F !important;
}
html.dark .bpmn-container {
  background-color: #141414 !important;
  background-image: radial-gradient(#333333 1px, transparent 1px) !important;
}

/* 2. 提示框 */
html.dark .viewer-hint {
  background: #1D1E1F !important;
  border-color: #4C4D4F !important;
  color: #CFD3DC !important;
}

/* 3. SVG 元素反色 */

/* 所有形狀 (Task, Gateway) -> 深灰底 */
html.dark .bpmn-container .djs-visual > rect,
html.dark .bpmn-container .djs-visual > polygon {
  fill: #1D1E1F !important;
  stroke: #A3A6AD !important;
  fill-opacity: 1 !important;
}

/* 圓形 (Start/End) -> 深灰底 */
html.dark .bpmn-container .djs-visual > circle {
  fill: #1D1E1F !important;
  stroke: #A3A6AD !important;
  fill-opacity: 1 !important;
}

/* 線條 -> 淺灰 */
html.dark .bpmn-container .djs-visual > path {
  stroke: #A3A6AD !important;
}

/* 文字 -> 淺灰 */
html.dark .bpmn-container .djs-label text,
html.dark .bpmn-container .djs-label tspan {
  fill: #E5EAF3 !important;
}

/* 4. Highlight (進行中) 微調 */
html.dark .bpmn-container .highlight .djs-visual > rect,
html.dark .bpmn-container .highlight .djs-visual > polygon,
html.dark .bpmn-container .highlight .djs-visual > circle {
  fill: rgba(103, 194, 58, 0.15) !important;
  stroke: #67c23a !important;
}

/* 進行中文字 -> 白色 */
html.dark .bpmn-container .highlight .djs-label text,
html.dark .bpmn-container .highlight .djs-label tspan {
  fill: #FFFFFF !important;
}
</style>