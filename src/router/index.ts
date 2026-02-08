import { ss } from "@/utils/storage/local";
import { showDialog } from "vant";
import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import { i18n } from "@/i18n";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "Home",
    component: () => import("@/pages/Home.vue"),
    meta: {
      title: "routes.home",
      keepAlive: false,
      noAuth: true,
    },
  },
  {
    path: "/login",
    name: "Login",
    component: () => import("@/pages/Login.vue"),
    meta: {
      title: "routes.login",
      keepAlive: false,
      noAuth: true,
    },
  },
  {
    path: "/deposit",
    name: "Deposit",
    component: () => import("@/pages/Deposit.vue"),
    meta: {
      title: "routes.deposit",
      keepAlive: false,
      noAuth: false,
    },
  },
  {
    path: "/popping",
    name: "Popping",
    component: () => import("@/pages/Popping.vue"),
    meta: {
      title: "routes.popping",
      keepAlive: false,
      noAuth: false,
    },
  },
  {
    path: "/order-complete",
    name: "OrderComplete",
    component: () => import("@/pages/OrderComplete.vue"),
    meta: {
      title: "routes.orderComplete",
      keepAlive: false,
      noAuth: false,
    },
  },
  {
    path: "/renting-order",
    name: "RentingOrder",
    component: () => import("@/pages/RentingOrder.vue"),
    meta: {
      title: "routes.rentingOrder",
      keepAlive: false,
      noAuth: false,
    },
  },
  {
    path: "/order-list",
    name: "OrderList",
    component: () => import("@/pages/OrderList.vue"),
    meta: {
      title: "routes.orderList",
      keepAlive: false,
      noAuth: false,
    },
  },
  {
    path: "/mine",
    name: "Mine",
    component: () => import("@/pages/Mine.vue"),
    meta: {
      title: "routes.mine",
      keepAlive: false,
      noAuth: false,
    },
  },
  {
    path: "/qr-scanner",
    name: "QRScanner",
    component: () => import("@/pages/QRScanner.vue"),
    meta: {
      title: "routes.qrScanner",
      keepAlive: false,
      noAuth: false,
    },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 全局前置守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题 - 使用国际化
  const titleKey = to.meta.title as string;
  document.title = titleKey ? i18n.global.t(titleKey) : "Allo Charge";

  if (to.meta.notInWechat) {
    next();
    return;
  }
  // 如果路由配置了不需要权限校验，直接放行
  if (to.meta.noAuth) {
    next();
    return;
  }
  // 检查用户是否登录
  if (!ss.get("token")) {
    //添加弹窗提醒，点击确认跳转登录页
    showDialog({
      title: i18n.global.t("common.tip"),
      message: i18n.global.t("routes.needLogin"),
      confirmButtonText: i18n.global.t("routes.goLogin"),
      cancelButtonText: i18n.global.t("routes.thinkAgain"),
      confirmButtonColor: "#3b82f6",
      showCancelButton: true,
    }).then(() => {
      next({
        path: "/login",
        query: { redirect: to.fullPath },
      });
    });
    return;
  }
  next();
});

export default router;
