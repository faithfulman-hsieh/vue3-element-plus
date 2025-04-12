<!-- src/components/WelcomeItem.vue -->
<template>
  <div class="item">
    <!-- <i>
       <slot name="icon"></slot> 
    </i> -->
    <div class="details">
      <h3>
        <slot name="heading"></slot>
      </h3>
      <slot></slot>
    </div>
  </div>
</template>

<style scoped>
.item {
  margin: 1rem 0;
  display: flex;
  position: relative;
  background-color: var(--ep-bg-color-overlay, #f8f9fa); /* 使用 Element Plus 背景色，適配暗色模式 */
  border-left: 4px solid var(--ep-color-primary, #1a73e8); /* 使用 Element Plus 主色 */
  padding: 1.5rem;
  border-radius: 0 8px 8px 0;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  margin-right: -20px;
  transform: scale(1);
}

.item:hover {
  transform: scale(1.02);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  z-index: 1;
}

.details {
  flex: 1;
  margin-left: 1rem;
  text-align: left;
}

i {
  display: flex;
  place-items: center;
  place-content: center;
  width: 32px;
  height: 32px;
  color: var(--ep-text-color-primary, #303133); /* 使用 Element Plus 主文字顏色 */
}

h3 {
  font-size: 1.2rem;
  font-weight: 500;
  margin-bottom: 0.1rem;
  color: var(--ep-text-color-primary, #303133); /* 使用 Element Plus 主文字顏色 */
  text-align: left;
}

/* 預設插槽內容左對齊 */
:slotted(p),
:slotted(a) {
  text-align: left;
  color: var(--ep-text-color-regular, #606266); /* 使用 Element Plus 常規文字顏色 */
}

@media (min-width: 1024px) {
  .item {
    margin: 0.5rem 0;
    padding: 1.0rem;
  }

  i {
    top: calc(50% - 25px);
    left: -26px;
    position: absolute;
    border: 1px solid var(--ep-border-color, #dcdfe6); /* 使用 Element Plus 邊框顏色 */
    background: var(--ep-bg-color, #ffffff); /* 使用 Element Plus 背景顏色 */
    border-radius: 8px;
    width: 50px;
    height: 50px;
  }

  .item:before {
    content: ' ';
    border-left: 1px solid var(--ep-border-color, #dcdfe6);
    position: absolute;
    left: 0;
    bottom: calc(50% + 25px);
    height: calc(50% - 25px);
  }

  .item:after {
    content: ' ';
    border-left: 1px solid var(--ep-border-color, #dcdfe6);
    position: absolute;
    left: 0;
    top: calc(50% + 25px);
    height: calc(50% - 25px);
  }

  .item:first-of-type:before {
    display: none;
  }

  .item:last-of-type:after {
    display: none;
  }
}

@media (max-width: 768px) {
  .item {
    margin: 0.9rem 0;
    margin-right: -10px;
  }

  .item:hover {
    transform: scale(1.01);
  }
}
</style>