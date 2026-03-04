<template>
  <div class="payment-success-container">
    <!-- 验证中 -->
    <div v-if="status === 'verifying'" class="status-box">
      <van-loading type="spinner" color="#10b981" size="56" />
      <p class="status-text">{{ t("paymentSuccess.verifying") }}</p>
    </div>

    <!-- 验证成功 -->
    <div v-else-if="status === 'success'" class="status-box">
      <div class="success-icon-wrap">
        <van-icon name="success" size="56" color="#10b981" />
      </div>
      <h2 class="status-title">{{ t("paymentSuccess.successTitle") }}</h2>
      <p class="status-text">{{ t("paymentSuccess.successMessage") }}</p>
      <p class="redirect-hint">{{ t("paymentSuccess.redirecting", { seconds: countdown }) }}</p>
    </div>

    <!-- 验证失败 -->
    <div v-else-if="status === 'failed'" class="status-box">
      <div class="fail-icon-wrap">
        <van-icon name="warning-o" size="56" color="#ef4444" />
      </div>
      <h2 class="status-title">{{ t("paymentSuccess.failedTitle") }}</h2>
      <p class="status-text">{{ t("paymentSuccess.failedMessage") }}</p>
      <div class="action-btns">
        <van-button type="primary" round block class="retry-btn" @click="verify">
          {{ t("paymentSuccess.retry") }}
        </van-button>
        <van-button plain round block class="home-btn" @click="router.replace('/')">
          {{ t("paymentSuccess.backHome") }}
        </van-button>
      </div>
    </div>

    <!-- 缺少 token -->
    <div v-else class="status-box">
      <van-icon name="warning-o" size="56" color="#f59e0b" />
      <p class="status-text">{{ t("paymentSuccess.noToken") }}</p>
      <van-button type="primary" round @click="router.replace('/')">
        {{ t("paymentSuccess.backHome") }}
      </van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { verifyDepositPayment } from "@/api/deposit";

const { t } = useI18n();
const router = useRouter();
const route = useRoute();

type Status = "verifying" | "success" | "failed" | "no-token";

const status = ref<Status>("verifying");
const countdown = ref(3);
let countdownTimer: ReturnType<typeof setInterval> | null = null;
let redirectFn: () => void = () => {};

const goToPopping = () => {
  const sn = localStorage.getItem("deposit_sn") || "";
  localStorage.removeItem("deposit_sn");
  router.replace({ path: "/popping", query: sn ? { sn } : {} });
};

const goToOrderDetail = (orderId: string | number) => {
  router.replace({ path: "/order-complete", query: { id: String(orderId) } });
};

const startCountdown = () => {
  countdownTimer = setInterval(() => {
    countdown.value--;
    if (countdown.value <= 0) {
      clearInterval(countdownTimer!);
      redirectFn();
    }
  }, 1000);
};

const verify = async () => {
  const token = route.query.token as string;
  if (!token) {
    status.value = "no-token";
    return;
  }

  status.value = "verifying";
  try {
    const res = await verifyDepositPayment(token);
    const { type, orderId } = res.data ?? {};
    if (type === "rent" && orderId) {
      redirectFn = () => goToOrderDetail(orderId);
    } else {
      redirectFn = goToPopping;
    }
    status.value = "success";
    startCountdown();
  } catch {
    status.value = "failed";
  }
};

onMounted(() => {
  verify();
});

onUnmounted(() => {
  if (countdownTimer) clearInterval(countdownTimer);
});
</script>

<style scoped>
.payment-success-container {
  min-height: 100vh;
  background: linear-gradient(180deg, #f0fdf9 0%, #ffffff 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px 24px;
}

.status-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 16px;
  width: 100%;
  max-width: 320px;
}

.success-icon-wrap {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  background: #dcfce7;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: scaleIn 0.4s ease-out;
}

.fail-icon-wrap {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  background: #fee2e2;
  display: flex;
  align-items: center;
  justify-content: center;
}

.status-title {
  font-size: 22px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
}

.status-text {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  margin: 0;
}

.redirect-hint {
  font-size: 13px;
  color: #10b981;
  margin: 0;
}

.action-btns {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 8px;
}

.retry-btn {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border: none;
}

.home-btn {
  border-color: #d1d5db;
  color: #6b7280;
}

@keyframes scaleIn {
  from {
    transform: scale(0.6);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
