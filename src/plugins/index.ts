import auth from "./auth";
import cache from "./cache";

export default function installPlugins(app: any) {
  // 认证对象
  app.config.globalProperties.$auth = auth;
  app.config.globalProperties.$cache = cache;
}
