<template>
    <div class="item">
        <i>
            <slot name="icon"></slot>
        </i>
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
      margin: 1rem 0; /* 上下間距減半，從 2rem 改為 1rem */
      display: flex;
      position: relative;
      background-color: #f8f9fa;
      border-left: 4px solid #1a73e8;
      padding: 1.5rem;
      border-radius: 0 8px 8px 0;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
      transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1); /* 平滑過渡效果 */
      margin-right: -20px;
      transform: scale(1); /* 初始大小 */
    }

    .item:hover {
      transform: scale(1.02); /* 懸停時輕微放大 */
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
      z-index: 1; /* 確保放大時不會被其他元素遮擋 */
    }

    .details {
      flex: 1;
      margin-left: 1rem;
      text-align: left; /* 讓內容左對齊 */
    }

    i {
      display: flex;
      place-items: center;
      place-content: center;
      width: 32px;
      height: 32px;
      color: var(--color-text);
    }

    h3 {
      font-size: 1.2rem;
      font-weight: 500;
      margin-bottom: 0.1rem; /* 增加標題下方間距 */
      color: var(--color-heading);
      text-align: left; /* 確保標題也左對齊 */
    }

    /* 預設插槽內容左對齊 */
    :slotted(p), :slotted(a) {
      text-align: left;
    }

    @media (min-width: 1024px) {
      .item {
        margin: 0.5rem 0; /* 桌面端上下間距減半，從 1.0rem 改為 0.5rem */
        padding: 1.0rem;
      }

      i {
        top: calc(50% - 25px);
        left: -26px;
        position: absolute;
        border: 1px solid var(--color-border);
        background: var(--color-background);
        border-radius: 8px;
        width: 50px;
        height: 50px;
      }

      .item:before {
        content: ' ';
        border-left: 1px solid var(--color-border);
        position: absolute;
        left: 0;
        bottom: calc(50% + 25px);
        height: calc(50% - 25px);
      }

      .item:after {
        content: ' ';
        border-left: 1px solid var(--color-border);
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
        margin: 0.9rem 0; /* 移動端上下間距減半，從 1.8rem 改為 0.9rem */
        margin-right: -10px;
      }

      .item:hover {
        transform: scale(1.01); /* 移動端較小的放大效果 */
      }
    }
</style>