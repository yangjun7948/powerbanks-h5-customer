<template>
  <div class="renting-order-container">
    <!-- 顶部导航栏 -->
    <div class="header">
      <van-icon name="arrow-left" size="20" @click="router.back()" />
      <span class="title">{{ t("rentingOrder.title") }}</span>
      <div style="width: 20px"></div>
    </div>

    <!-- 内容区域 -->
    <div class="content">
      <!-- 加载状态 -->
      <van-loading v-if="loading" type="spinner" vertical>{{ t("orderList.loading") }}</van-loading>

      <!-- 状态标题 -->
      <div v-if="!loading" class="status-header">
        <span class="status-text">{{ statusText }}</span>
        <van-icon name="replay" class="refresh-icon" @click="refreshOrder" />
      </div>

      <!-- 提示信息 -->
      <div v-if="!loading" class="tip-text">{{ t("rentingOrder.tip") }}</div>

      <!-- 时长和金额卡片 -->
      <div v-if="!loading" class="duration-card">
        <div class="duration-item">
          <div class="duration-value">{{ usageDuration }}</div>
          <div class="duration-label">{{ t("rentingOrder.usageTime") }}</div>
        </div>
        <div class="duration-item">
          <div class="duration-value">{{ estimatedAmount }}{{ t("rentingOrder.currency") }}</div>
          <div class="duration-label">
            {{ orderData?.isEstimated ? t("rentingOrder.estimatedAmount") : t("rentingOrder.orderAmount") }}
          </div>
        </div>
        <van-icon name="arrow-up" class="collapse-icon" @click="toggleCollapse" :class="{ collapsed: isCollapsed }" />
      </div>

      <!-- 价格明细 -->
      <div v-if="!loading" v-show="!isCollapsed" class="price-detail">
        <div class="detail-title">{{ t("rentingOrder.priceDetail") }}</div>

        <div class="detail-row" v-if="orderData?.isEstimated">
          <span class="detail-label">{{ t("rentingOrder.orderAmount") }}</span>
          <span class="detail-value">{{ orderAmount }} {{ t("rentingOrder.currency") }}</span>
        </div>        

        <div class="detail-row" v-if="orderData?.borrowStore?.cabinetSn">
          <span class="detail-label">{{ t("rentingOrder.cabinetSn") }}</span>
          <span class="detail-value">{{ orderData.borrowStore.cabinetSn }}</span>
        </div>

        <div class="pricing-rules">
          {{ t("rentingOrder.pricingRules") }}
        </div>
      </div>

      <!-- 租借信息 -->
      <div v-if="!loading" class="rental-info">
        <div class="section-title">{{ t("rentingOrder.rentalInfo") }}</div>

        <div class="info-row">
          <span class="info-label">{{ t("rentingOrder.rentalTime") }}</span>
          <span class="info-value">{{ rentalTime }}</span>
        </div>

        <div class="info-row">
          <span class="info-label">{{ t("rentingOrder.rentalMethod") }}</span>
          <span class="info-value">{{ t("rentingOrder.depositRental") }}</span>
        </div>

        <div class="info-row">
          <span class="info-label">{{ t("rentingOrder.rentalLocation") }}</span>
          <span class="info-value">{{ rentalLocation }}</span>
        </div>           

        <div class="info-row">
          <span class="info-label">{{ t("rentingOrder.orderNumber") }}</span>
          <span class="info-value">
            {{ orderNumber }}
            <van-button plain size="mini" type="default" class="copy-btn" @click="copyOrderNumber">
              {{ t("rentingOrder.copy") }}
            </van-button>
          </span>
        </div>
      </div>

      <!-- 底部按钮 -->
      <div v-if="!loading" class="action-buttons">
        <van-button type="warning" block round class="return-store-button" @click="viewReturnStores">
          {{ t("rentingOrder.viewReturnStores") }}
        </van-button>
        <van-button plain block round class="contact-button" @click="contactService">
          {{ t("rentingOrder.contactService") }}
        </van-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter, useRoute } from "vue-router";
import { showToast } from "vant";
import { getOrderDetail, getRentingOrder } from "@/api/order";
import { useUserStore } from "@/store/modules/user";

const { t, locale } = useI18n();
const router = useRouter();
const route = useRoute();
const userStore = useUserStore();

// 订单数据
const orderData = ref<any>(null);
const loading = ref(false);

// 折叠状态
const isCollapsed = ref(false);

// 计时器
let durationTimer: number | null = null;

// 计算属性
const usageDuration = computed(() => {
  if (!orderData.value) return formatDuration(0);
  return orderData.value.durationText || formatDuration(orderData.value.durationMinutes || 0);
});

const estimatedAmount = computed(() => {
  if (!orderData.value) return "0.00";
  return formatAmount(orderData.value.estimatedAmount || 0);
});

const orderAmount = computed(() => {
  if (!orderData.value) return "0.00";
  return formatAmount(orderData.value.amount || 0);
});

const rentalTime = computed(() => {
  if (!orderData.value) return "--";
  return formatDateTime(orderData.value.startTime || orderData.value.createTime);
});

const rentalLocation = computed(() => {
  if (!orderData.value?.borrowStore) return "--";
  return orderData.value.borrowStore.storeName || orderData.value.borrowStore.storeAddress || "--";
});

const powerBankSN = computed(() => {
  if (!orderData.value?.powerbank) return "--";
  return orderData.value.powerbank.powerbankSn || "--";
});

const orderNumber = computed(() => {
  if (!orderData.value) return "--";
  return orderData.value.orderNo || orderData.value.orderNumber || "--";
});

const statusText = computed(() => {
  if (!orderData.value) return t("rentingOrder.renting");
  return orderData.value.statusText || t("rentingOrder.renting");
});

// 格式化时长
const formatDuration = (minutes: number) => {
  if (!minutes || minutes <= 0) {
    return `0${t("rentingOrder.minutes")}`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  // 获取当前语言环境，判断是否需要空格（中文不需要空格，英文和法文需要）
  const currentLocale = locale.value || 'zh-CN';
  const needSpace = currentLocale !== 'zh-CN';
  const space = needSpace ? ' ' : '';
  
  if (hours > 0) {
    const hourText = hours === 1 ? t("rentingOrder.hour") : t("rentingOrder.hours");
    if (mins > 0) {
      const minuteText = mins === 1 ? t("rentingOrder.minute") : t("rentingOrder.minutes");
      return `${hours}${space}${hourText}${space}${mins}${space}${minuteText}`;
    }
    return `${hours}${space}${hourText}`;
  }
  const minuteText = mins === 1 ? t("rentingOrder.minute") : t("rentingOrder.minutes");
  return `${mins}${space}${minuteText}`;
};

// 格式化金额
const formatAmount = (amount: number | string) => {
  if (amount === null || amount === undefined) return "0.00";
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return num.toFixed(2);
};

// 格式化日期时间
const formatDateTime = (dateTime: string | Date) => {
  if (!dateTime) return "--";
  const date = typeof dateTime === "string" ? new Date(dateTime) : dateTime;
  if (isNaN(date.getTime())) return "--";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

// 获取订单详情
const fetchOrderDetail = async () => {
  loading.value = true;
  try {
    const orderId = route.query.id as string;
    let res: any;

    // 如果有订单ID，使用订单ID查询；否则使用用户ID查询进行中的订单
    if (orderId) {
      res = await getOrderDetail(orderId);
    } else if (userStore.userInfo?.userId) {
      res = await getRentingOrder(userStore.userInfo.userId);
    } else {
      showToast(t("rentingOrder.loginRequired"));
      router.back();
      return;
    }

    // 处理返回数据
    const data = res?.data || res;
    if (data) {
      orderData.value = data;

      // 如果订单已结束，跳转到完成页面
      if (data.status !== 1 || data.endTime) {
        router.replace(`/order-complete?id=${data.orderId || orderId}`);
        return;
      }
    } else {
      showToast(t("rentingOrder.orderNotFound"));
      router.back();
    }
  } catch (error: any) {
    console.error("获取订单详情失败:", error);
    showToast(t("rentingOrder.loadFailed"));
    router.back();
  } finally {
    loading.value = false;
  }
};

// 更新使用时长（实时计算）
const updateDuration = () => {
  if (!orderData.value?.startTime) return;

  const startTime = new Date(orderData.value.startTime).getTime();
  const now = Date.now();
  const diff = now - startTime;
  const minutes = Math.floor(diff / 60000);

  // 更新时长文本
  if (orderData.value) {
    orderData.value.durationMinutes = minutes;
    orderData.value.durationText = formatDuration(minutes);
  }
};

// 刷新订单
const refreshOrder = async () => {
  showToast(t("rentingOrder.refreshing"));
  await fetchOrderDetail();
};

// 切换折叠
const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value;
};

// 复制订单号
const copyOrderNumber = () => {
  const text = orderNumber.value;
  if (text === "--") return;

  navigator.clipboard
    .writeText(text)
    .then(() => {
      showToast(t("rentingOrder.copySuccess"));
    })
    .catch(() => {
      showToast(t("rentingOrder.copyFailed"));
    });
};

// 查看可归还门店
const viewReturnStores = () => {
  router.push("/");
};

// 联系客服
const contactService = () => {
  showToast(t("rentingOrder.contactServiceToast"));
};

onMounted(async () => {
  await fetchOrderDetail();

  // 启动计时器，每分钟更新一次时长
  if (orderData.value?.startTime) {
    updateDuration();
    durationTimer = window.setInterval(() => {
      updateDuration();
    }, 60000); // 每分钟更新一次
  }
});

onUnmounted(() => {
  if (durationTimer) {
    clearInterval(durationTimer);
  }
});
</script>

<style scoped>
.renting-order-container {
  min-height: 100vh;
  background: #f5f5f5;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.header {
  background: #fff;
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 10;
}

.title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.content {
  padding: 16px;
  padding-bottom: 32px;
}

.status-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.status-text {
  font-size: 20px;
  font-weight: 600;
  color: #333;
}

.refresh-icon {
  color: #666;
  cursor: pointer;
}

.refresh-icon:active {
  opacity: 0.6;
}

.tip-text {
  font-size: 13px;
  color: #999;
  margin-bottom: 20px;
  line-height: 1.5;
}

.duration-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 5px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  display: flex;
  gap: 40px;
  position: relative;
  }

.duration-item {
  flex: 1;
}

.duration-value {
  font-size: 28px;
  font-weight: 700;
  color: #333;
  margin-bottom: 8px;
}

.duration-label {
  font-size: 14px;
  color: #999;
}

.collapse-icon {
  position: absolute;
  top: 20px;
  right: 20px;
  color: #999;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.collapse-icon.collapsed {
  transform: rotate(180deg);
}

.price-detail {
  background: #fff;
  border-radius: 0 0 12px 12px;
  padding: 0 20px 20px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.detail-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
  padding-top: 16px;
  border-top: 1px solid #f5f5f5;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.detail-label {
  font-size: 15px;
  color: #666;
}

.detail-value {
  font-size: 15px;
  color: #333;
  font-weight: 500;
}

.pricing-rules {
  background: #f5f5f5;
  padding: 12px;
  border-radius: 8px;
  font-size: 13px;
  color: #666;
  line-height: 1.6;
  margin-top: 12px;
}

.rental-info {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f5f5f5;
}

.info-row:last-child {
  border-bottom: none;
}

.info-label {
  font-size: 15px;
  color: #666;
  flex-shrink: 0;
}

.info-value {
  font-size: 15px;
  color: #333;
  font-weight: 500;
  text-align: right;
  flex: 1;
  margin-left: 16px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
}

.info-value.gray {
  color: #999;
}

.copy-btn {
  height: 24px;
  padding: 0 8px;
  font-size: 12px;
  border-color: #e5e5e5;
  color: #666;
}

.action-buttons {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.return-store-button {
  flex: 1;
  height: 50px;
  font-size: 17px;
  font-weight: 600;
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  border: none;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
}

.return-store-button:active {
  transform: translateY(1px);
  box-shadow: 0 2px 8px rgba(245, 158, 11, 0.3);
}

.contact-button {
  flex: 1;
  height: 50px;
  font-size: 17px;
  font-weight: 600;
  border-color: #e5e5e5;
  color: #666;
}

.contact-button:active {
  opacity: 0.7;
}
</style>
