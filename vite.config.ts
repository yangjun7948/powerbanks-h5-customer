import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";
import Components from "unplugin-vue-components/vite";
import { VantResolver } from "unplugin-vue-components/resolvers";
import AutoImport from "unplugin-auto-import/vite";
import VueSetupExtend from "vite-plugin-vue-setup-extend";
import vueJsx from "@vitejs/plugin-vue-jsx";
import { NaiveUiResolver } from "unplugin-vue-components/resolvers";

// https://vitejs.dev/config/
export default defineConfig(({ mode, command }) => {
  const env = loadEnv(mode, process.cwd());
  const { VITE_APP_ENV } = env;
  return {
    base: VITE_APP_ENV === "production" ? "/" : "/",
    server: {
      port: 3003,
      host: "0.0.0.0",
      hmr: true,
      open: true,
      proxy: {
        // https://cn.vitejs.dev/config/#server-proxy
        "/dev-api": {
          target: "http://localhost:9999",
          changeOrigin: true,
          rewrite: (p) => p.replace(/^\/dev-api/, ""),
        },
      },
    },
    plugins: [
      vue(),
      vueJsx(),
      VueSetupExtend(),
      Components({
        resolvers: [VantResolver(), NaiveUiResolver()],
      }),
      AutoImport({
        imports: ["vue", "vue-router", "vue-i18n"], // 自动导入vue和vue-router相关函数
        dts: "src/auto-import.d.ts", // 生成 `auto-import.d.ts` 全局声明
      }),
    ],
    resolve: {
      alias: {
        "@": resolve(__dirname, "src"),
        "@pages": resolve(__dirname, "src/pages"),
        "@components": resolve(__dirname, "src/components"),
        "@layout": resolve(__dirname, "src/layout"),
        "@api": resolve(__dirname, "src/api"),
        "@utils": resolve(__dirname, "src/utils"),
        "@store": resolve(__dirname, "src/store"),
        "@assets": resolve(__dirname, "src/assets"),
        "@i18n": resolve(__dirname, "src/i18n"),
        "@plugins": resolve(__dirname, "src/plugins"),
      },
    },
  };
});
