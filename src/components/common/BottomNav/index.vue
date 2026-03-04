<template>
  <div class="bottom-nav">
    <!-- 左侧导航项 -->
    <div class="nav-item" :class="{ active: currentActiveTab === leftNavKey }" @click="handleLeftNav">
      <van-icon :name="leftNavIcon" size="24" />
      <span>{{ leftNavText }}</span>
    </div>
    
    <!-- 中间扫码按钮 -->
    <div class="nav-item nav-center" @click="handleScan">
      <div class="scan-button" :class="{ 'renting-button': isRenting, 'unpaid-button': isUnpaid }">
        <van-icon :name="isRenting ? 'clock-o' : isUnpaid ? 'balance-o' : 'scan'" size="28" color="#fff" />
      </div>
      <span class="scan-text" :class="{ 'unpaid-text': isUnpaid }">
        {{ isRenting ? t("store.renting") : isUnpaid ? t("store.unpaid") : t("store.scanToRent") }}
      </span>
    </div>
    
    <!-- 右侧我的 -->
    <div class="nav-item" :class="{ active: currentActiveTab === 'mine' }" @click="handleMine">
      <van-icon name="user-o" size="24" />
      <span>{{ t("store.mine") }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter, useRoute } from "vue-router";
import { getRentingOrder } from "@/api/order";
import { useUserStore } from "@/store/modules/user";

interface Props {
  activeTab?: "home" | "orders" | "mine";
  showOrders?: boolean; // 是否显示订单而不是首页
}

const props = withDefaults(defineProps<Props>(), {
  activeTab: undefined,
  showOrders: false,
});

const route = useRoute();

// 如果没有传入 activeTab，根据路由自动判断
const currentActiveTab = computed<"home" | "orders" | "mine">(() => {
  if (props.activeTab) {
    return props.activeTab;
  }
  // 根据路由自动判断
  const path = route.path;
  if (path === "/mine" || path.startsWith("/mine")) {
    return "mine";
  }
  if (path === "/order-list" || path.startsWith("/order-list")) {
    return "orders";
  }
  return "home";
});

const emit = defineEmits<{
  scan: [];
  home: [];
  orders: [];
  mine: [];
}>();

const { t } = useI18n();
const router = useRouter();
const userStore = useUserStore();

// 是否有进行中的订单
const hasRentingOrder = ref(false);
const rentingOrderId = ref<string | null>(null);
// 订单状态：1=进行中，2=已完成；paymentStatus：0=未支付，1=已支付
const rentingOrderStatus = ref<number | null>(null);
const rentingOrderPaymentStatus = ref<number | null>(null);

// 查询进行中的订单
const checkRentingOrder = async () => {
  // 如果没有登录，不检查
  if (!userStore.userInfo?.userId) {
    hasRentingOrder.value = false;
    rentingOrderId.value = null;
    rentingOrderStatus.value = null;
    rentingOrderPaymentStatus.value = null;
    return;
  }

  try {
    const res: any = await getRentingOrder(userStore.userInfo.userId);
    const order = res?.order;
    if (res?.hasOngoingOrder && order) {
      hasRentingOrder.value = true;
      rentingOrderId.value = String(order.id);
      rentingOrderStatus.value = order.status ?? null;
      rentingOrderPaymentStatus.value = order.paymentStatus ?? null;
    } else {
      hasRentingOrder.value = false;
      rentingOrderId.value = null;
      rentingOrderStatus.value = null;
      rentingOrderPaymentStatus.value = null;
    }
  } catch (error) {
    console.warn("查询进行中订单失败:", error);
    hasRentingOrder.value = false;
    rentingOrderId.value = null;
    rentingOrderStatus.value = null;
    rentingOrderPaymentStatus.value = null;
  }
};

// 是否进行中：status === 1
const isRenting = computed(() => hasRentingOrder.value && rentingOrderStatus.value === 1);
// 是否待支付：有订单 且 非进行中 且 paymentStatus === 0
const isUnpaid = computed(() => hasRentingOrder.value && !isRenting.value && rentingOrderPaymentStatus.value === 0);

// 左侧导航项配置
// 如果在首页，显示订单；如果在订单列表页，显示首页；否则根据 showOrders prop 决定
const leftNavKey = computed(() => {
  if (currentActiveTab.value === "home") {
    return "orders"; // 在首页时显示订单
  }
  if (currentActiveTab.value === "orders") {
    return "home"; // 在订单页时显示首页
  }
  return props.showOrders ? "orders" : "home";
});

const leftNavIcon = computed(() => {
  if (currentActiveTab.value === "home") {
    return "orders-o"; // 在首页时显示订单图标
  }
  if (currentActiveTab.value === "orders") {
    return "wap-home-o"; // 在订单页时显示首页图标
  }
  return props.showOrders ? "orders-o" : "wap-home-o";
});

const leftNavText = computed(() => {
  if (currentActiveTab.value === "home") {
    return t("store.orders"); // 在首页时显示订单文字
  }
  if (currentActiveTab.value === "orders") {
    return t("store.home"); // 在订单页时显示首页文字
  }
  return props.showOrders ? t("store.orders") : t("store.home");
});

// 处理左侧导航点击
const handleLeftNav = () => {
  const activeTab = currentActiveTab.value;
  
  // 如果在首页，点击左侧应该跳转到订单列表
  if (activeTab === "home") {
    router.push("/order-list");
    emit("orders");
    return;
  }
  // 如果在订单列表页，点击左侧应该跳转到首页
  if (activeTab === "orders") {
    router.push("/");
    emit("home");
    return;
  }
  // 其他情况（如我的页面）根据 showOrders prop 决定
  if (props.showOrders) {
    router.push("/order-list");
    emit("orders");
  } else {
    router.push("/");
    emit("home");
  }
};

// 处理扫码点击
const handleScan = async () => {  
  if (hasRentingOrder.value && rentingOrderId.value) {
    // status === 1：进行中 → 租借订单页
    if (rentingOrderStatus.value === 1) {
      router.push(`/renting-order?id=${rentingOrderId.value}`);
      return;
    }
    // 未支付（paymentStatus === 0）→ 已完成订单页
    if (rentingOrderPaymentStatus.value === 0) {
      router.push(`/order-complete?id=${rentingOrderId.value}`);
      return;
    }
  }
  // 无订单或其他状态，跳转到扫码页面
  router.push("/qr-scanner");
  emit("scan");
};

// 处理我的点击
const handleMine = () => {
  if (currentActiveTab.value !== "mine") {
    router.push("/mine");
  }
  emit("mine");
};

// 监听路由变化，当从租借订单页面返回时重新检查
watch(
  () => route.path,
  () => {
    // 如果不在租借订单页面，重新检查订单状态
    if (route.path !== "/renting-order") {
      checkRentingOrder();
    }
  }
);

// 组件挂载时检查订单状态
onMounted(() => {
  checkRentingOrder();
});
</script>

<style scoped>
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 70px;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-around;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);
  padding-bottom: env(safe-area-inset-bottom);
  z-index: 100;
}

.nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  color: #666;
  font-size: 12px;
  cursor: pointer;
  transition: color 0.3s ease;
}

.nav-item.active {
  color: #10b981;
}

.nav-item:active {
  opacity: 0.7;
}

.nav-center {
  position: relative;
  top: -10px;
}

.scan-button {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);
  transition: all 0.3s ease;
}

.scan-button.renting-button {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
}

.scan-button.unpaid-button {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);
}

.scan-button:active {
  transform: scale(0.95);
  box-shadow: 0 2px 8px rgba(245, 158, 11, 0.4);
}

.scan-button.renting-button:active {
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.4);
}

.scan-text {
  margin-top: 4px;
  color: #333;
  font-weight: 500;
}

.scan-text.unpaid-text {
  color: #d97706;
}
</style>

