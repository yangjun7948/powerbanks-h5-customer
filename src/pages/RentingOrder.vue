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
          <div class="duration-value">{{ estimatedAmount }} {{ t("rentingOrder.currency") }}</div>
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

        <div class="detail-row" v-if="orderData?.borrowStore?.cabinetSn || orderData?.borrowCabinetSn">
          <span class="detail-label">{{ t("rentingOrder.cabinetSn") }}</span>
          <span class="detail-value">{{ orderData.borrowCabinetSn || orderData.borrowStore?.cabinetSn }}</span>
        </div>

        <div class="pricing-rules">
          <div class="pricing-rules__title" v-if="pricingRuleTitle">
            <van-icon name="bill-o" size="13" color="#10b981" />
            <span>{{ pricingRuleTitle }}</span>
          </div>
          <div class="pricing-rules__desc">{{ pricingRuleDesc }}</div>
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

      <!-- 购买充电宝 -->
      <div v-if="!loading && purchasePrice > 0" class="purchase-section">
        <van-button plain type="primary" block round class="purchase-button" @click="handlePurchase" :loading="purchasing">
          {{ t("orderComplete.purchaseButton") }} · FCFA {{ formatAmount(purchasePrice) }}
        </van-button>
        <div class="purchase-tip">
          <van-icon name="bulb-o" size="16" color="#8b5cf6" />
          <span>{{ t("orderComplete.purchaseTip") }}</span>
        </div>
      </div>

      <!-- 底部按钮 -->
      <div v-if="!loading" class="action-buttons">
        <van-button type="warning" block round class="return-store-button" @click="viewReturnStores">
          {{ t("rentingOrder.viewReturnStores") }}
        </van-button>
        <van-button plain block round class="contact-button" @click="showContactSheet = true">
          {{ t("rentingOrder.contactService") }}
        </van-button>
      </div>
    </div>

    <ContactService v-model:show="showContactSheet" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter, useRoute } from "vue-router";
import { showToast, showDialog } from "vant";
import { getOrderDetail, getRentingOrder, purchasePowerbank, getPurchasePrice } from "@/api/order";
import { useUserStore } from "@/store/modules/user";
import { ContactService } from "@/components/common";
import { formatUtcToLocal } from "@/utils/datetime";

const { t, locale } = useI18n();
const router = useRouter();
const route = useRoute();
const userStore = useUserStore();

// 联系客服弹窗
const showContactSheet = ref(false);

// 订单数据
const orderData = ref<any>(null);
const loading = ref(false);
const purchasing = ref(false);
const purchasePrice = ref<number>(0);

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

// 计费规则对象
const pricingRule = computed(() => orderData.value?.pricingRule ?? null);

// 计费规则标题（小标题行）
const pricingRuleTitle = computed(() => {
  const rule = pricingRule.value;
  if (!rule) return "";
  if (rule.freeMinutes > 0) {
    return t("deposit.priceTitleTemplate", {
      price: rule.pricePerHour,
      freeMinutes: rule.freeMinutes,
    });
  }
  return t("deposit.priceTitleNoFree", { price: rule.pricePerHour });
});

// 计费规则详细描述
const pricingRuleDesc = computed(() => { 
  
  const rule = pricingRule.value;
  if (!rule) return t("deposit.pricingRules");
  const lines: string[] = [];
  if (rule.freeMinutes > 0) {
    lines.push(
      t("deposit.priceDescTemplate", {
        freeMinutes: rule.freeMinutes,
        pricePerHour: rule.pricePerHour,
      })
    );
  } else {
    lines.push(t("deposit.priceDescNoFree", { pricePerHour: rule.pricePerHour }));
  }
  if (rule.maxPricePerDay > 0) {
    lines.push(t("deposit.maxPricePerDay", { maxPrice: rule.maxPricePerDay }));
  }
  return lines.join(" ");
});

// 格式化时长
const formatDuration = (minutes: number) => {
  if (!minutes || minutes <= 0) {
    return `0${t("rentingOrder.minutes")}`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  // 获取当前语言环境，判断是否需要空格（中文不需要空格，英文和法文需要）
  const currentLocale = locale.value || "zh-CN";
  const needSpace = currentLocale !== "zh-CN";
  const space = needSpace ? " " : "";

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

// 格式化日期时间（UTC → 本地时区，含秒）
const formatDateTime = (dateTime: string | Date) =>
  formatUtcToLocal(dateTime, true, "--");

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

    // 处理返回数据：getOrderDetail 返回 res.data，getRentingOrder 返回 res.order
    const data = orderId ? (res?.data || res) : (res?.order || res?.data || res);
    if (data) {
      orderData.value = data;

      // 如果订单已结束，跳转到完成页面
      if (data.status == 2) {
        router.replace(`/order-complete?id=${data.id || data.orderId || orderId}`);
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

// 购买充电宝
const handlePurchase = async () => {
  if (purchasing.value) return;

  try {
    await showDialog({
      title: t("orderComplete.purchaseConfirmTitle"),
      message: t("orderComplete.purchaseConfirmMessage", { price: formatAmount(purchasePrice.value) }),
      confirmButtonText: t("common.confirm"),
      cancelButtonText: t("common.cancel"),
      showCancelButton: true,
    });

    purchasing.value = true;
    const orderId = Number(route.query.id || orderData.value?.id);
    const res: any = await purchasePowerbank(orderId);
    const paymentData = res?.data || res;
    const paymentUrl = paymentData?.paymentUrl;

    if (paymentUrl) {
      window.location.href = paymentUrl;
    } else {
      showToast(t("orderComplete.purchaseSuccess"));
      router.replace(`/order-complete?id=${orderId}`);
    }
  } catch (error: any) {
    if (error !== "cancel" && error?.message) {
      showToast(error.message || t("orderComplete.purchaseFailed"));
    }
    purchasing.value = false;
  }
};

// 获取购买价格
const fetchPurchasePrice = async () => {
  try {
    const res: any = await getPurchasePrice();
    const data = res?.data || res;
    purchasePrice.value = parseFloat(data?.price || 0);
  } catch {
    purchasePrice.value = 0;
  }
};

onMounted(async () => {
  await fetchOrderDetail();
  fetchPurchasePrice();

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
  background: #f0fdf4;
  border: 1px solid #d1fae5;
  padding: 12px;
  border-radius: 8px;
  margin-top: 12px;
}

.pricing-rules__title {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 13px;
  font-weight: 600;
  color: #059669;
  margin-bottom: 6px;
}

.pricing-rules__desc {
  font-size: 12px;
  color: #666;
  line-height: 1.7;
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

.purchase-section {
  margin-bottom: 16px;
}

.purchase-button {
  height: 48px;
  font-size: 16px;
  font-weight: 600;
  border-color: #8b5cf6;
  color: #8b5cf6;
}

.purchase-button:active {
  transform: translateY(1px);
  background: #f5f3ff;
}

.purchase-tip {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f5f3ff;
  border: 1px solid #ddd6fe;
  border-radius: 10px;
  padding: 10px 14px;
  margin-top: 10px;
  font-size: 13px;
  color: #5b21b6;
  line-height: 1.5;
}
</style>
