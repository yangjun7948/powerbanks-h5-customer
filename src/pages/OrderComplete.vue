<template>
  <div class="order-complete-container">
    <!-- 顶部导航栏 -->
    <div class="header">
      <van-icon name="arrow-left" size="20" @click="router.back()" />
      <span class="title">{{ t("orderComplete.title") }}</span>
      <div style="width: 20px"></div>
    </div>

    <!-- 内容区域 -->
    <div class="content">
      <!-- 加载状态 -->
      <van-loading v-if="loading" type="spinner" vertical>{{ t("orderList.loading") }}</van-loading>

      <template v-else>
        <!-- 成功图标和提示 -->
        <div class="success-section">
          <div class="success-icon">
            <van-icon name="checked" color="#fff" size="32" />
          </div>
          <div class="success-text">{{ t("orderComplete.successMessage") }}</div>
          <!-- 支付状态提示 -->
          <div class="payment-status-badge" :class="{ unpaid: paymentStatus === 0 }">
            <van-icon :name="paymentStatus === 0 ? 'warning-o' : 'checked'" />
            <span>{{ paymentStatusText }}</span>
          </div>
        </div>

        <!-- 订单金额 -->
        <div class="amount-section">
          <div class="amount">{{ orderAmount }}</div>
          <div class="amount-label">{{ t("orderComplete.totalAmount") }}</div>
        </div>

        <!-- 订单详情 -->
        <div class="order-details">
          <div class="detail-item">
            <span class="detail-label">{{ t("orderComplete.duration") }}</span>
            <span class="detail-value">{{ orderDuration }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">{{ t("orderComplete.borrowTime") }}</span>
            <span class="detail-value">{{ borrowTime }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">{{ t("orderComplete.returnTime") }}</span>
            <span class="detail-value">{{ returnTime }}</span>
          </div>
          <div class="detail-item" v-if="orderData?.borrowStore">
            <span class="detail-label">{{ t("rentingOrder.rentalLocation") }}</span>
            <span class="detail-value">{{ rentalLocation }}</span>
          </div>
          <div class="detail-item" v-if="orderData?.returnStore">
            <span class="detail-label">{{ t("orderComplete.returnLocation") }}</span>
            <span class="detail-value">{{ returnLocation }}</span>
          </div>
          <div class="detail-item" v-if="orderData?.powerbank">
            <span class="detail-label">{{ t("rentingOrder.powerBankSN") }}</span>
            <span class="detail-value">{{ powerBankSN }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">{{ t("orderComplete.orderNumber") }}</span>
            <span class="detail-value">
              {{ orderNumber }}
              <van-button plain size="mini" type="default" class="copy-btn" @click="copyOrderNumber">
                {{ t("rentingOrder.copy") }}
              </van-button>
            </span>
          </div>
        </div>

        <!-- 资金结算说明 -->
        <div class="settlement-section" v-if="depositAmountValue > 0">
          <div class="section-title">
            {{ t("orderComplete.settlementTitle") }}
          </div>
          <div class="settlement-item">
            <span class="settlement-label">{{ t("orderComplete.depositPaid") }}</span>
            <span class="settlement-value">{{ t("rentingOrder.currency") }}{{ formatAmount(depositAmountValue) }}</span>
          </div>
          <div class="settlement-item">
            <span class="settlement-label">{{ t("orderComplete.rentalFee") }}</span>
            <span class="settlement-value negative">-{{ t("rentingOrder.currency") }}{{ orderAmount }}</span>
          </div>
          <div class="settlement-item total">
            <span class="settlement-label">{{ t("orderComplete.refundAmount") }}</span>
            <span class="settlement-value highlight">{{ t("rentingOrder.currency") }}{{ refundAmount }}</span>
          </div>
        </div>

        <!-- 退款提示 -->
        <div class="refund-notice" v-if="depositAmountValue > 0 && parseFloat(refundAmount) > 0">
          <van-icon name="clock-o" color="#f59e0b" size="18" />
          <span>{{ t("orderComplete.refundNotice") }}</span>
        </div>

        <!-- 支付按钮（未支付时显示） -->
        <van-button v-if="paymentStatus === 0" type="warning" block round class="pay-button" @click="handlePay" :loading="paying">
          {{ t("orderList.payNow") }}
        </van-button>

        <!-- 回到首页按钮 -->
        <van-button type="primary" block round class="home-button" @click="goHome">
          {{ t("orderComplete.backToHome") }}
        </van-button>

        <!-- 客服链接 -->
        <div class="customer-service">
          {{ t("orderComplete.haveQuestion") }}
          <span class="contact-link" @click="contactService">
            {{ t("orderComplete.contactService") }}
          </span>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter, useRoute } from "vue-router";
import { showToast, showDialog } from "vant";
import { getOrderDetail, payOrder } from "@/api/order";
import { useUserStore } from "@/store/modules/user";

const { t, locale } = useI18n();
const router = useRouter();
const route = useRoute();
const userStore = useUserStore();

// 订单数据
const orderData = ref<any>(null);
const loading = ref(false);
const depositAmount = ref(0); // 押金金额，需要从用户信息或其他接口获取
const paying = ref(false); // 支付中状态

// 计算属性
const depositAmountValue = computed(() => {
  return depositAmount.value || 0;
});

const orderAmount = computed(() => {
  if (!orderData.value) return "0.00";
  return formatAmount(orderData.value.amount || 0);
});

const orderDuration = computed(() => {
  if (!orderData.value) return formatDuration(0);
  if (orderData.value.durationText) {
    return orderData.value.durationText;
  }
  const minutes = orderData.value.durationMinutes || 0;
  return formatDuration(minutes);
});

const borrowTime = computed(() => {
  if (!orderData.value) return "--";
  return formatDateTime(orderData.value.startTime || orderData.value.createTime);
});

const returnTime = computed(() => {
  if (!orderData.value?.endTime) return "--";
  return formatDateTime(orderData.value.endTime);
});

const rentalLocation = computed(() => {
  if (!orderData.value?.borrowStore) return "--";
  return orderData.value.borrowStore.storeName || orderData.value.borrowStore.storeAddress || "--";
});

const returnLocation = computed(() => {
  if (!orderData.value?.returnStore) return "--";
  return orderData.value.returnStore.storeName || orderData.value.returnStore.storeAddress || "--";
});

const powerBankSN = computed(() => {
  if (!orderData.value?.powerbank) return "--";
  return orderData.value.powerbank.powerbankSn || "--";
});

const orderNumber = computed(() => {
  if (!orderData.value) return "--";
  return orderData.value.orderNo || orderData.value.orderNumber || "--";
});

const paymentStatus = computed(() => {
  if (!orderData.value) return 1;
  return orderData.value.paymentStatus ?? 1; // 0: 待支付, 1: 已支付
});

const paymentStatusText = computed(() => {
  if (!orderData.value) return t("orderList.paid");
  if (orderData.value.paymentStatusText) {
    return orderData.value.paymentStatusText;
  }
  return paymentStatus.value === 0 ? t("orderList.unpaid") : t("orderList.paid");
});

const refundAmount = computed(() => {
  const amount = parseFloat(orderAmount.value);
  const deposit = depositAmountValue.value;
  const refund = deposit - amount;
  return formatAmount(Math.max(0, refund));
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
    if (!orderId) {
      showToast(t("orderComplete.orderNotFound"));
      router.back();
      return;
    }

    const res: any = await getOrderDetail(orderId);
    const data = res?.data || res;

    if (data) {
      orderData.value = data;

      // 如果订单未完成，跳转到租借中页面
      if (data.status === 1 && !data.endTime) {
        router.replace(`/renting-order?id=${orderId}`);
        return;
      }

      // 获取押金金额（可以从用户信息或其他接口获取）
      // 这里暂时使用默认值，实际应该从用户信息或订单信息中获取
      depositAmount.value = data.depositAmount || 0;
    } else {
      showToast(t("orderComplete.orderNotFound"));
      router.back();
    }
  } catch (error: any) {
    console.error("获取订单详情失败:", error);
    showToast(t("orderComplete.loadFailed"));
    router.back();
  } finally {
    loading.value = false;
  }
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

// 回到首页
const goHome = () => {
  router.push("/");
};

// 联系客服
const contactService = () => {
  showToast(t("orderComplete.contactServiceToast"));
};

// 支付订单
const handlePay = async () => {
  if (paying.value) {
    return; // 防止重复点击
  }

  // 确认支付对话框
  try {
    await showDialog({
      title: t("orderList.payConfirmTitle"),
      message: t("orderList.payConfirmMessage", {
        amount: `${t("rentingOrder.currency")}${orderAmount.value}`,
      }),
      confirmButtonText: t("orderList.confirmPay"),
      cancelButtonText: t("orderList.cancel"),
    });

    // 用户确认支付
    paying.value = true;

    try {
      const orderId = route.query.id as string;
      // 调用支付接口（这里使用默认支付方式，实际应该让用户选择）
      const res: any = await payOrder(orderId, "wechat"); // 默认使用微信支付，实际应该让用户选择

      const paymentData = res?.data || res;
      const paymentUrl = paymentData?.paymentUrl;

      if (paymentUrl) {
        // 跳转到支付页面
        window.location.href = paymentUrl;
      } else {
        // 如果没有 paymentUrl，可能是直接支付成功
        showToast(t("orderList.paySuccess"));
        // 刷新订单详情
        await fetchOrderDetail();
      }
    } catch (error: any) {
      console.error("支付失败:", error);
      showToast(error?.message || t("orderList.payFailed"));
      paying.value = false;
    }
  } catch {
    // 用户取消支付
    // 不需要做任何处理
  }
};

onMounted(() => {
  fetchOrderDetail();
});
</script>

<style scoped>
.order-complete-container {
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

.success-section {
  text-align: center;
  padding: 16px 20px 20px;
  background: #fff;
  border-radius: 12px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.success-icon {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 12px;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.25);
}

.success-text {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 10px;
}

.payment-status-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
  background: #f0fdf4;
  color: #10b981;
  margin-top: 6px;
}

.payment-status-badge.unpaid {
  background: #fef2f2;
  color: #ef4444;
}

.amount-section {
  text-align: center;
  margin-bottom: 24px;
}

.amount {
  font-size: 42px;
  font-weight: 700;
  color: #333;
  margin-bottom: 8px;
}

.amount-label {
  font-size: 14px;
  color: #999;
}

.order-details {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f5f5f5;
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-label {
  font-size: 15px;
  color: #666;
}

.detail-value {
  font-size: 15px;
  color: #333;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
}

.copy-btn {
  height: 24px;
  padding: 0 8px;
  font-size: 12px;
  border-color: #e5e5e5;
  color: #666;
}

.settlement-section {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
}

.settlement-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
}

.settlement-label {
  font-size: 15px;
  color: #666;
}

.settlement-value {
  font-size: 15px;
  color: #333;
  font-weight: 500;
}

.settlement-value.negative {
  color: #ef4444;
}

.settlement-item.total {
  padding-top: 16px;
  margin-top: 12px;
  border-top: 1px solid #f5f5f5;
}

.settlement-item.total .settlement-label {
  font-weight: 600;
  color: #333;
}

.settlement-value.highlight {
  font-size: 18px;
  font-weight: 700;
  color: #10b981;
}

.refund-notice {
  background: #fff7ed;
  border-radius: 8px;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 24px;
}

.refund-notice span {
  flex: 1;
  font-size: 13px;
  color: #f59e0b;
  line-height: 1.5;
}

.pay-button {
  height: 50px;
  font-size: 17px;
  font-weight: 600;
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  border: none;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
  margin-bottom: 12px;
}

.pay-button:active {
  transform: translateY(1px);
  box-shadow: 0 2px 8px rgba(245, 158, 11, 0.3);
}

.home-button {
  height: 50px;
  font-size: 17px;
  font-weight: 600;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border: none;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
  margin-bottom: 16px;
}

.home-button:active {
  transform: translateY(1px);
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
}

.customer-service {
  text-align: center;
  font-size: 14px;
  color: #999;
  padding: 8px 0;
}

.contact-link {
  color: #10b981;
  font-weight: 500;
  cursor: pointer;
}

.contact-link:active {
  opacity: 0.7;
}
</style>
