import path from 'node:path'
import Vue from '@vitejs/plugin-vue'
import Unocss from 'unocss/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import Components from 'unplugin-vue-components/vite'
import VueRouter from 'unplugin-vue-router/vite'
import { defineConfig } from 'vite'

// Vite 配置文件
export default defineConfig({
  resolve: {
    alias: {
      '~/': `${path.resolve(__dirname, 'src')}/`, // 設定路徑別名
    },
  },

  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "~/styles/element/index.scss" as *;`, // 引入全局 SCSS
        api: 'modern-compiler',
      },
    },
  },

  plugins: [
    Vue(), // Vue 插件

    // Vue Router 自動化路由插件
    VueRouter({
      extensions: ['.vue', '.md'],
      dts: 'src/typed-router.d.ts',
    }),

    // 自動導入元件插件
    Components({
      extensions: ['vue', 'md'],
      include: [/\.vue$/, /\.vue\?vue/, /\.md$/],
      resolvers: [
        ElementPlusResolver({
          importStyle: 'sass', // 使用 SASS 樣式
        }),
      ],
      dts: 'src/components.d.ts',
    }),

    Unocss(), // UnoCSS 插件
  ],
})