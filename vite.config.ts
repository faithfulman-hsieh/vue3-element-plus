import { fileURLToPath, URL } from 'node:url'
import Vue from '@vitejs/plugin-vue'
import Unocss from 'unocss/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import Components from 'unplugin-vue-components/vite'
import VueRouter from 'unplugin-vue-router/vite'
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    resolve: {
      alias: {
        // 使用 fileURLToPath 確保路徑在所有環境下都正確
        '~/': fileURLToPath(new URL('./src/', import.meta.url)),
        '@/': fileURLToPath(new URL('./src/', import.meta.url)), // 補上常用的 @ 別名
      },
    },

    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@use "~/styles/element/index.scss" as *;`,
          api: 'modern-compiler',
        },
      },
    },

    plugins: [
      Vue(),
      VueRouter({
        extensions: ['.vue', '.md'],
        dts: 'src/typed-router.d.ts',
      }),
      Components({
        extensions: ['vue', 'md'],
        include: [/\.vue$/, /\.vue\?vue/, /\.md$/],
        resolvers: [
          ElementPlusResolver({
            importStyle: 'sass',
          }),
        ],
        dts: 'src/components.d.ts',
      }),
      Unocss(),
    ],

    define: {
      global: 'window',
    },
  }
})