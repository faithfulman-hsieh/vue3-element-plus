import path from 'node:path'
import Vue from '@vitejs/plugin-vue'
import Unocss from 'unocss/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import Components from 'unplugin-vue-components/vite'
import VueRouter from 'unplugin-vue-router/vite'
import { defineConfig, loadEnv } from 'vite'

// Vite 配置文件
export default defineConfig(({ mode }) => {
  // 根據當前模式（development 或 production）載入環境變數
  const env = loadEnv(mode, process.cwd(), '')

  return {
    resolve: {
      alias: {
        '~/': `${path.resolve(__dirname, 'src')}/`, // 設定路徑別名
      },
    },

    // 動態設定 base URL，根據環境變數決定
    base: env.VITE_APP_BASE_URL || '/', // 使用 env.VITE_APP_BASE_URL

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
      VueRouter({
        extensions: ['.vue', '.md'],
        dts: 'src/typed-router.d.ts',
      }),
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
  }
})