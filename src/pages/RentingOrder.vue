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
      <!-- 状态标题 -->
      <div class="status-header">
        <span class="status-text">{{ t("rentingOrder.renting") }}</span>
        <van-icon name="replay" class="refresh-icon" @click="refreshOrder" />
      </div>

      <!-- 提示信息 -->
      <div class="tip-text">{{ t("rentingOrder.tip") }}</div>

      <!-- 时长和金额卡片 -->
      <div class="duration-card">
        <div class="duration-item">
          <div class="duration-value">{{ usageDuration }}</div>
          <div class="duration-label">{{ t("rentingOrder.usageTime") }}</div>
        </div>
        <div class="duration-item">
          <div class="duration-value">
            {{ estimatedAmount }}{{ t("rentingOrder.currency") }}
          </div>
          <div class="duration-label">
            {{ t("rentingOrder.estimatedAmount") }}
          </div>
        </div>
        <van-icon
          name="arrow-up"
          class="collapse-icon"
          @click="toggleCollapse"
          :class="{ collapsed: isCollapsed }"
        />
      </div>

      <!-- 价格明细 -->
      <div v-show="!isCollapsed" class="price-detail">
        <div class="detail-title">{{ t("rentingOrder.priceDetail") }}</div>

        <div class="detail-row">
          <span class="detail-label">{{ t("rentingOrder.orderAmount") }}</span>
          <span class="detail-value"
            >{{ orderAmount }} {{ t("rentingOrder.currency") }}</span
          >
        </div>

        <div class="pricing-rules">
          {{ t("rentingOrder.pricingRules") }}
        </div>
      </div>

      <!-- 租借信息 -->
      <div class="rental-info">
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
          <span class="info-label">{{ t("rentingOrder.returnTime") }}</span>
          <span class="info-value gray">--</span>
        </div>

        <div class="info-row">
          <span class="info-label">{{ t("rentingOrder.returnLocation") }}</span>
          <span class="info-value gray">--</span>
        </div>

        <div class="info-row">
          <span class="info-label">{{ t("rentingOrder.powerBankSN") }}</span>
          <span class="info-value">{{ powerBankSN }}</span>
        </div>

        <div class="info-row">
          <span class="info-label">{{ t("rentingOrder.orderNumber") }}</span>
          <span class="info-value">
            {{ orderNumber }}
            <van-button
              plain
              size="mini"
              type="default"
              class="copy-btn"
              @click="copyOrderNumber"
            >
              {{ t("rentingOrder.copy") }}
            </van-button>
          </span>
        </div>
      </div>

      <!-- 底部按钮 -->
      <div class="action-buttons">
        <van-button
          type="warning"
          block
          round
          class="return-store-button"
          @click="viewReturnStores"
        >
          {{ t("rentingOrder.viewReturnStores") }}
        </van-button>
        <van-button
          plain
          block
          round
          class="contact-button"
          @click="contactService"
        >
          {{ t("rentingOrder.contactService") }}
        </van-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { showToast } from "vant";

const { t } = useI18n();
const router = useRouter();

// 订单信息
const usageDuration = ref("1分钟");
const estimatedAmount = ref("0");
const orderAmount = ref("0");
const rentalTime = ref("2026-01-24 17:45:00");
const rentalLocation = ref("CHOISAN丘山咖啡（设计公社店）");
const powerBankSN = ref("A4113325120104101");
const orderNumber = ref("2014997816753143864");

// 折叠状态
const isCollapsed = ref(false);

// 计时器
let durationTimer: number | null = null;
let startTime = new Date("2026-01-24 17:45:00").getTime();

// 更新使用时长
const updateDuration = () => {
  const now = Date.now();
  const diff = now - startTime;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours > 0) {
    usageDuration.value = `${hours}小时${mins}分钟`;
  } else {
    usageDuration.value = `${mins}分钟`;
  }

  // 计算预估金额（5分钟内免费，超过按规则计费）
  if (minutes <= 5) {
    estimatedAmount.value = "0";
    orderAmount.value = "0";
  } else {
    // 超过5分钟，不足1小时按1小时计算
    const chargeMinutes = minutes - 5;
    let chargeHours = Math.ceil(chargeMinutes / 60);

    if (chargeHours > 0) {
      // 第一个小时的费用（假设是200 FCFA）
      let amount = 200;

      // 超过1小时的部分，每30分钟100 FCFA
      if (chargeMinutes > 60) {
        const extraMinutes = chargeMinutes - 60;
        const extra30mins = Math.ceil(extraMinutes / 30);
        amount += extra30mins * 100;
      }

      // 封顶5000 FCFA
      amount = Math.min(amount, 5000);

      estimatedAmount.value = amount.toString();
      orderAmount.value = amount.toString();
    }
  }
};

// 刷新订单
const refreshOrder = () => {
  showToast(t("rentingOrder.refreshing"));
  updateDuration();
};

// 切换折叠
const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value;
};

// 复制订单号
const copyOrderNumber = () => {
  navigator.clipboard
    .writeText(orderNumber.value)
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

onMounted(() => {
  // 启动计时器
  updateDuration();
  durationTimer = window.setInterval(() => {
    updateDuration();
  }, 60000); // 每分钟更新一次
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
  margin-bottom: 0;
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
