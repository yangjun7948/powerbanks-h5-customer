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
        <!-- ① 核心费用卡：归还状态 + 时长 + 金额 -->
        <div class="fee-card" :class="paymentStatus === 0 ? 'fee-card--unpaid' : 'fee-card--paid'">
          <!-- 归还状态行 -->
          <div class="fee-card__status-row">
            <div class="order-status-badge" :class="statusIconClass">
              <van-icon :name="statusIconName" size="14" color="#fff" />
              <span>{{ orderStatusText }}</span>
            </div>
            <div class="pay-status-badge" :class="paymentStatus === 0 ? 'pay-badge--unpaid' : 'pay-badge--paid'">
              <van-icon :name="paymentStatus === 0 ? 'warning-o' : 'checked'" size="12" />
              <span>{{ paymentStatusText }}</span>
            </div>
          </div>

          <!-- 使用时长（大字展示） -->
          <div class="fee-card__duration">
            <span class="duration-label-sm">{{ t("orderComplete.duration") }}</span>
            <span class="duration-big">{{ orderDuration }}</span>
            <span class="duration-range">{{ borrowTime }} → {{ returnTime }}</span>
          </div>

          <div class="fee-divider" />

          <!-- 应付金额（大字展示） -->
          <div class="fee-card__amount">
            <span class="amount-label-sm">
              {{ paymentStatus === 0 ? t("orderComplete.amountDue") : t("orderComplete.totalAmount") }}
            </span>
            <div class="amount-big-row">
              <span class="amount-currency">FCFA</span>
              <span class="amount-big" :class="paymentStatus === 0 ? 'amount-big--unpaid' : ''">{{ orderAmount }}</span>
            </div>
          </div>

          <!-- 计费规则 -->
          <div class="pricing-breakdown" v-if="pricingRuleTitle || pricingRuleDesc">
            <div class="pricing-breakdown__title" v-if="pricingRuleTitle">
              <van-icon name="bill-o" size="13" color="#10b981" />
              <span>{{ pricingRuleTitle }}</span>
            </div>
            <div class="pricing-breakdown__desc" v-if="pricingRuleDesc">{{ pricingRuleDesc }}</div>
          </div>
        </div>

        <!-- ② 未支付时：突出支付提示 -->
        <div class="unpaid-notice" v-if="paymentStatus === 0">
          <van-icon name="info-o" size="16" color="#f59e0b" />
          <span>{{ t("orderComplete.unpaidNotice") }}</span>
        </div>

        <div class="action-area">
          <van-button v-if="paymentStatus === 0" type="warning" block round class="pay-button" @click="handlePay" :loading="paying"> {{ t("orderList.payNow") }} · FCFA {{ orderAmount }} </van-button>
          <van-button v-if="paymentStatus === 0 && purchasePrice > 0" plain type="primary" block round class="purchase-button" @click="handlePurchase" :loading="purchasing"> {{ t("orderComplete.purchaseButton") }} · FCFA {{ formatAmount(purchasePrice) }} </van-button>
          <div class="purchase-tip" v-if="paymentStatus === 0 && purchasePrice > 0">
            <van-icon name="bulb-o" size="16" color="#8b5cf6" />
            <span>{{ t("orderComplete.purchaseTip") }}</span>
          </div>
        </div>
        <!-- ③ 订单详情 -->
        <div class="order-details">
          <div class="section-title">{{ t("orderComplete.orderInfo") }}</div>

          <div class="detail-item" v-if="orderData?.borrowStoreName || orderData?.borrowStore">
            <span class="detail-label">{{ t("rentingOrder.rentalLocation") }}</span>
            <span class="detail-value">{{ rentalLocation }}</span>
          </div>
          <div class="detail-item" v-if="orderData?.returnStoreName || orderData?.returnStore">
            <span class="detail-label">{{ t("orderComplete.returnLocation") }}</span>
            <span class="detail-value">{{ returnLocation }}</span>
          </div>
          <div class="detail-item" v-if="powerBankSN !== '--'">
            <span class="detail-label">{{ t("rentingOrder.powerBankSN") }}</span>
            <span class="detail-value">{{ powerBankSN }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">{{ t("orderComplete.orderNumber") }}</span>
            <span class="detail-value order-no-row">
              <span class="order-no-text">{{ orderNumber }}</span>
              <van-button plain size="mini" type="default" class="copy-btn" @click="copyOrderNumber">
                {{ t("rentingOrder.copy") }}
              </van-button>
            </span>
          </div>
        </div>
        <!-- ④ 资金结算说明（有押金时） -->
        <div class="settlement-section" v-if="depositAmountValue > 0">
          <div class="section-title">{{ t("orderComplete.settlementTitle") }}</div>
          <div class="settlement-item">
            <span class="settlement-label">{{ t("orderComplete.depositPaid") }}</span>
            <span class="settlement-value">FCFA {{ formatAmount(depositAmountValue) }}</span>
          </div>
          <div class="settlement-item">
            <span class="settlement-label">{{ t("orderComplete.rentalFee") }}</span>
            <span class="settlement-value negative">- FCFA {{ orderAmount }}</span>
          </div>
          <div class="settlement-item total">
            <span class="settlement-label">{{ t("orderComplete.refundAmount") }}</span>
            <span class="settlement-value highlight">FCFA {{ refundAmount }}</span>
          </div>
        </div>

        <!-- 退款提示 -->
        <div class="refund-notice" v-if="depositAmountValue > 0 && parseFloat(refundAmount) > 0">
          <van-icon name="clock-o" color="#f59e0b" size="16" />
          <span>{{ t("orderComplete.refundNotice") }}</span>
        </div>

        <!-- ⑤ 操作按钮 -->
        <div class="action-area">
       
          <van-button type="primary" block round class="home-button" @click="goHome">
            {{ t("orderComplete.backToHome") }}
          </van-button>

          <div class="customer-service">
            {{ t("orderComplete.haveQuestion") }}
            <span class="contact-link" @click="showContact = true">
              {{ t("orderComplete.contactService") }}
            </span>
          </div>
        </div>
      </template>
    </div>

    <ContactService v-model:show="showContact" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter, useRoute } from "vue-router";
import { showToast, showDialog } from "vant";
import { getOrderDetail, payOrder, purchasePowerbank, getPurchasePrice } from "@/api/order";
import { useUserStore } from "@/store/modules/user";
import { ContactService } from "@/components/common";
import { formatUtcToLocal } from "@/utils/datetime";

const { t, locale } = useI18n();
const router = useRouter();
const route = useRoute();
const userStore = useUserStore();

// 订单数据
const orderData = ref<any>(null);
const loading = ref(false);
const depositAmount = ref(0);
const paying = ref(false);
const purchasing = ref(false);
const purchasePrice = ref<number>(0);
const showContact = ref(false);

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
  if (!orderData.value) return "--";
  return orderData.value.borrowStoreName || orderData.value.borrowStore?.storeName || orderData.value.borrowStore?.storeAddress || "--";
});

const returnLocation = computed(() => {
  if (!orderData.value) return "--";
  return orderData.value.returnStoreName || orderData.value.returnStore?.storeName || orderData.value.returnStore?.storeAddress || "--";
});

const powerBankSN = computed(() => {
  if (!orderData.value) return "--";
  return orderData.value.powerbankSn || orderData.value.powerbank?.powerbankSn || "--";
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

// 订单状态（来自接口 status 字段）
const orderStatus = computed(() => orderData.value?.status ?? 2);

// 订单状态文本（优先使用接口返回的 statusText）
const orderStatusText = computed(() => {
  return orderData.value?.statusText || t("orderComplete.successMessage");
});

// 根据 status 决定图标样式
const statusIconClass = computed(() => {
  // status: 2 = 已归还（正常完成），其他状态可扩展
  return orderStatus.value === 2 ? "status-icon--success" : "status-icon--warning";
});

const statusIconName = computed(() => {
  return orderStatus.value === 2 ? "checked" : "warning-o";
});

const refundAmount = computed(() => {
  const amount = parseFloat(orderAmount.value);
  const deposit = depositAmountValue.value;
  const refund = deposit - amount;
  return formatAmount(Math.max(0, refund));
});

// 计费规则对象
const pricingRule = computed(() => orderData.value?.pricingRule ?? null);

// 计费规则标题
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

// 计费规则描述
const pricingRuleDesc = computed(() => {
  const rule = pricingRule.value;
  if (!rule) return "";
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
const formatDateTime = (dateTime: string | Date) => formatUtcToLocal(dateTime, true, "--");

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

      // status !== 2（未归还）时跳转到租借中页面
      if (data.status !== 2) {
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

// 支付订单
const handlePay = async () => {
  if (paying.value) {
    return; // 防止重复点击
  }

  // 确认支付对话框
  try {
    // 用户确认支付
    paying.value = true;

    try {
      const orderId = Number(route.query.id);
      // 调用支付接口（这里使用默认支付方式，实际应该让用户选择）
      const res: any = await payOrder(orderId, "paydunya"); // 默认使用微信支付，实际应该让用户选择

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
    const orderId = Number(route.query.id);
    const res: any = await purchasePowerbank(orderId);
    const paymentData = res?.data || res;
    const paymentUrl = paymentData?.paymentUrl;

    if (paymentUrl) {
      window.location.href = paymentUrl;
    } else {
      showToast(t("orderComplete.purchaseSuccess"));
      await fetchOrderDetail();
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

onMounted(() => {
  fetchOrderDetail();
  fetchPurchasePrice();
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
  padding-bottom: 40px;
}

/* ── 核心费用卡 ── */
.fee-card {
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.fee-card--paid {
  background: linear-gradient(160deg, #f0fdf4 0%, #fff 100%);
  border: 1.5px solid #d1fae5;
}

.fee-card--unpaid {
  background: linear-gradient(160deg, #fffbeb 0%, #fff 100%);
  border: 1.5px solid #fde68a;
}

/* 状态徽标行 */
.fee-card__status-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.order-status-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.status-icon--success {
  background: #10b981;
  color: #fff;
}

.status-icon--warning {
  background: #f59e0b;
  color: #fff;
}

.pay-status-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.pay-badge--paid {
  background: #f0fdf4;
  color: #10b981;
}

.pay-badge--unpaid {
  background: #fef3c7;
  color: #d97706;
}

/* 时长区 */
.fee-card__duration {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 6px;
  margin-bottom: 20px;
}

.duration-label-sm {
  font-size: 13px;
  color: #999;
}

.duration-big {
  font-size: 40px;
  font-weight: 800;
  color: #1a1a1a;
  line-height: 1;
  letter-spacing: -1px;
}

.duration-range {
  font-size: 12px;
  color: #aaa;
  letter-spacing: 0.2px;
}

/* 分割线 */
.fee-divider {
  border: none;
  border-top: 1px dashed #e5e7eb;
  margin: 0 0 20px;
}

/* 金额区 */
.fee-card__amount {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  margin-bottom: 16px;
}

.amount-label-sm {
  font-size: 13px;
  color: #999;
}

.amount-big-row {
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.amount-currency {
  font-size: 16px;
  font-weight: 600;
  color: #666;
}

.amount-big {
  font-size: 48px;
  font-weight: 800;
  color: #1a1a1a;
  line-height: 1;
  letter-spacing: -1px;
}

.amount-big--unpaid {
  color: #d97706;
}

/* 计费明细 */
.pricing-breakdown {
  background: #f0fdf4;
  border: 1px solid #d1fae5;
  border-radius: 8px;
  padding: 10px 12px;
  margin-top: 4px;
}

.pricing-breakdown__title {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 13px;
  font-weight: 600;
  color: #059669;
  margin-bottom: 4px;
}

.pricing-breakdown__desc {
  font-size: 12px;
  color: #666;
  line-height: 1.7;
}

/* 未支付提示条 */
.unpaid-notice {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #fffbeb;
  border: 1px solid #fde68a;
  border-radius: 10px;
  padding: 10px 14px;
  margin-bottom: 12px;
  font-size: 13px;
  color: #92400e;
  line-height: 1.5;
}

/* 订单详情卡 */
.order-details {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #999;
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 11px 0;
  border-bottom: 1px solid #f5f5f5;
}

.detail-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.detail-label {
  font-size: 14px;
  color: #666;
  flex-shrink: 0;
}

.detail-value {
  font-size: 14px;
  color: #333;
  font-weight: 500;
  text-align: right;
  flex: 1;
  margin-left: 16px;
}

.order-no-row {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
}

.order-no-text {
  word-break: break-all;
}

.copy-btn {
  flex-shrink: 0;
  height: 24px;
  padding: 0 8px;
  font-size: 12px;
  border-color: #e5e5e5;
  color: #666;
}

/* 结算卡 */
.settlement-section {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.settlement-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
}

.settlement-label {
  font-size: 14px;
  color: #666;
}

.settlement-value {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.settlement-value.negative {
  color: #ef4444;
}

.settlement-item.total {
  padding-top: 14px;
  margin-top: 10px;
  border-top: 1px solid #f0f0f0;
}

.settlement-item.total .settlement-label {
  font-weight: 600;
  color: #333;
}

.settlement-value.highlight {
  font-size: 17px;
  font-weight: 700;
  color: #10b981;
}

/* 退款提示 */
.refund-notice {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #fff7ed;
  border-radius: 8px;
  padding: 10px 14px;
  margin-bottom: 12px;
  font-size: 13px;
  color: #92400e;
  line-height: 1.5;
}

/* 购买提示 */
.purchase-tip {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f5f3ff;
  border: 1px solid #ddd6fe;
  border-radius: 10px;
  padding: 10px 14px;
  margin-bottom: 12px;
  font-size: 13px;
  color: #5b21b6;
  line-height: 1.5;
}

/* 操作区 */
.action-area {
  margin-top: 8px;
}

.pay-button {
  height: 52px;
  font-size: 17px;
  font-weight: 700;
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  border: none;
  box-shadow: 0 4px 16px rgba(245, 158, 11, 0.35);
  margin-bottom: 12px;
  letter-spacing: 0.5px;
}

.pay-button:active {
  transform: translateY(1px);
  box-shadow: 0 2px 8px rgba(245, 158, 11, 0.3);
}

.purchase-button {
  height: 48px;
  font-size: 16px;
  font-weight: 600;
  border-color: #8b5cf6;
  color: #8b5cf6;
  margin-bottom: 12px;
}

.purchase-button:active {
  transform: translateY(1px);
  background: #f5f3ff;
}

.home-button {
  height: 50px;
  font-size: 16px;
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
  font-size: 13px;
  color: #aaa;
  padding: 4px 0;
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
