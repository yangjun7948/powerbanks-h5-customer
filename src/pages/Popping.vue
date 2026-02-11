<template>
  <div class="popping-container">
    <!-- 顶部导航栏 -->
    <div class="header">
      <van-icon name="arrow-left" size="20" @click="router.back()" />
      <span class="title">{{ t("popping.title") }}</span>
      <div style="width: 20px"></div>
    </div>

    <!-- 内容区域 -->
    <div class="content">
      <!-- 弹出中状态（包括创建订单时） -->
      <template v-if="status === 'loading' || status === 'popping'">
        <!-- 提示信息 -->
        <div class="tip-banner">
          <van-icon name="info-o" color="#f59e0b" size="16" />
          <span>{{ t("popping.tip") }}</span>
        </div>

        <!-- 充电宝机柜示意图 -->
        <div class="cabinet-container">
          <div class="cabinet-grid">
            <div v-for="slot in 8" :key="slot" class="slot" :class="{ active: activeSlot !== null && slot === activeSlot }">
              <div class="slot-inner"></div>
            </div>
          </div>
          <!-- 创建订单中提示 -->
          <div v-if="status === 'loading' && activeSlot === null" class="cabinet-tip">
            {{ t("popping.creating") }}
          </div>
        </div>

        <!-- 弹出提示框 -->
        <div class="popping-notice">
          <van-icon name="checked" color="#4080FF" size="24" />
          <span>{{ t("popping.notice") }}</span>
        </div>

        <!-- 进度条（仅在弹出中状态显示） -->
        <div v-if="status === 'popping'" class="progress-container">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: progress + '%' }">
              <div class="progress-icon">
                <van-icon name="lightning" color="#fff" size="16" />
              </div>
            </div>
          </div>
          <div class="progress-text">{{ progress }}%</div>
        </div>
      </template>

      <!-- 成功状态 -->
      <div v-else-if="status === 'success'" class="result-container">
        <van-icon name="success" size="64" color="#10b981" />
        <h2 class="result-title">{{ t("popping.success") }}</h2>
        <p class="result-message">{{ t("popping.successMessage") }}</p>
        <van-button type="primary" block round class="result-button" @click="goToRentingOrder">
          {{ t("popping.viewOrder") }}
        </van-button>
      </div>

      <!-- 失败状态 -->
      <div v-else-if="status === 'failed'" class="result-container">
        <van-icon name="close" size="64" color="#ef4444" />
        <h2 class="result-title">{{ t("popping.failed") }}</h2>
        <p class="result-message">{{ errorMessage || t("popping.failedMessage") || t("popping.failedMessage") }}</p>
        <van-button type="primary" block round class="result-button" @click="retry">
          {{ t("popping.retry") }}
        </van-button>
        <van-button plain block round class="result-button-secondary" @click="goToHome">
          {{ t("popping.backToHome") }}
        </van-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter, useRoute } from "vue-router";
import { showToast } from "vant";
import { createRentalOrder, getPoppingStatus } from "@/api/order";
import { useUserStore } from "@/store/modules/user";
const userStore = useUserStore();
const { t } = useI18n();
const router = useRouter();
const route = useRoute();

// 状态：loading | popping | success | failed
const status = ref<"loading" | "popping" | "success" | "failed">("loading");
const activeSlot = ref<number | null>(null); // 高亮的充电槽位置，null 表示未确定
const progress = ref(0);
const errorMessage = ref("");
const orderId = ref<string>("");

let progressTimer: number | null = null;
let pollingTimer: number | null = null;
let pollingDelay = 2000; // 初始轮询间隔（2秒）
const maxPollingDelay = 30000; // 最大轮询间隔（30秒）
const backoffMultiplier = 1.5; // 退避倍数

// 从路由参数获取 sn
const sn = ref<string>((route.query.sn as string) || "");

// 模拟进度更新（仅用于视觉效果）
const startProgress = () => {
  progressTimer = window.setInterval(() => {
    if (progress.value < 90) {
      progress.value += 1;
    }
  }, 200);
};

// 创建租赁订单
const createOrder = async () => {
  if (!sn.value) {
    status.value = "failed";
    errorMessage.value = t("popping.snRequired");
    return;
  }

  try {
    // 创建订单时显示机柜（不显示加载状态）
    status.value = "loading";

    const res: any = await createRentalOrder({
      userId: userStore.userInfo.userId,
      cabinetSn: sn.value,
    });

    // 获取订单ID和弹出槽位编号
    const data = res?.data || res;
    orderId.value = data?.orderId || "";

    if (!orderId.value) {
      status.value = "failed";
      errorMessage.value = t("popping.createOrderFailed");
      return;
    }

    // 设置高亮的弹出槽位（如果后端返回 slotNo，则使用它）
    if (data?.slotNo !== undefined && data?.slotNo !== null) {
      activeSlot.value = Number(data.slotNo);
    }

    // 创建订单成功，开始轮询状态
    status.value = "popping";
    startProgress();
    startPolling();
  } catch (error: any) {
    status.value = "failed";
    errorMessage.value = t("popping.createOrderFailed");
  }
};

// 开始轮询状态
const startPolling = () => {
  if (!orderId.value) {
    return;
  }

  pollingTimer = window.setInterval(async () => {
    try {
      const res: any = await getPoppingStatus(orderId.value);
      const data = res?.data || res;
      const poppingStatus = data?.status || data?.poppingStatus;

      // 根据状态处理
      if (poppingStatus === 1) {
        // 成功
        stopPolling();
        stopProgress();
        progress.value = 100;
        status.value = "success";
        showToast({
          message: t("popping.success"),
          icon: "success",
          duration: 2000,
        });
      } else if (poppingStatus === 2) {
        // 失败
        stopPolling();
        stopProgress();
        status.value = "failed";
        errorMessage.value = t("popping.failedMessage");
      } else if (poppingStatus === "0" || poppingStatus === "popping") {
        // 继续轮询，弹出中状态
        if (progress.value === 0) {
          startProgress();
        }
      } else if (poppingStatus === 3) {
        // 超时失败
        stopPolling();
        stopProgress();
        status.value = "failed";
        errorMessage.value = t("popping.failedMessage");
      }
    } catch (error: any) {
      console.error("查询状态失败:", error);
    }
  }, 2000); // 每2秒轮询一次
};

// 停止轮询
const stopPolling = () => {
  if (pollingTimer) {
    clearTimeout(pollingTimer);
    pollingTimer = null;
  }
  // 重置轮询间隔
  pollingDelay = 2000;
};

// 停止进度
const stopProgress = () => {
  if (progressTimer) {
    clearInterval(progressTimer);
    progressTimer = null;
  }
};

// 重试
const retry = () => {
  status.value = "loading";
  progress.value = 0;
  activeSlot.value = null;
  errorMessage.value = "";
  orderId.value = "";
  pollingDelay = 2000; // 重置轮询间隔
  stopPolling();
  stopProgress();
  createOrder();
};

// 跳转到租借中订单
const goToRentingOrder = () => {
  if (orderId.value) {
    router.replace(`/renting-order?id=${orderId.value}`);
  } else {
    router.replace("/renting-order");
  }
};

// 返回首页
const goToHome = () => {
  router.replace("/");
};

onMounted(() => {
  createOrder();
});

onUnmounted(() => {
  stopPolling();
  stopProgress();
});
</script>

<style scoped>
.popping-container {
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
}

.title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.content {
  padding: 16px;
}

.tip-banner {
  background: #fff7ed;
  border-radius: 8px;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 24px;
}

.tip-banner span {
  flex: 1;
  font-size: 13px;
  color: #f59e0b;
  line-height: 1.5;
}

.cabinet-container {
  background: #fff;
  border-radius: 16px;
  padding: 32px 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  position: relative;
}

.cabinet-tip {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  white-space: nowrap;
}

.cabinet-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  max-width: 400px;
  margin: 0 auto;
}

.slot {
  aspect-ratio: 2.5 / 1;
  background: #f0f0f0;
  border-radius: 20px;
  padding: 4px;
  transition: all 0.3s ease;
}

.slot.active {
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  box-shadow: 0 4px 12px rgba(251, 191, 36, 0.4);
  animation: pulse 2s infinite;
}

.slot-inner {
  width: 100%;
  height: 100%;
  background: #e5e5e5;
  border-radius: 16px;
}

.slot.active .slot-inner {
  background: linear-gradient(135deg, #fde68a 0%, #fbbf24 100%);
}

@keyframes pulse {
  0%,
  100% {
    box-shadow: 0 4px 12px rgba(251, 191, 36, 0.4);
  }
  50% {
    box-shadow: 0 4px 20px rgba(251, 191, 36, 0.6);
  }
}

.popping-notice {
  background: #eff6ff;
  border-radius: 12px;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 32px;
}

.popping-notice span {
  flex: 1;
  font-size: 15px;
  color: #4080ff;
  font-weight: 500;
}

.progress-container {
  text-align: center;
}

.progress-bar {
  position: relative;
  height: 12px;
  background: #f0f0f0;
  border-radius: 6px;
  overflow: visible;
  margin-bottom: 12px;
}

.progress-fill {
  position: relative;
  height: 100%;
  background: linear-gradient(90deg, #fbbf24 0%, #f59e0b 100%);
  border-radius: 6px;
  transition: width 0.3s ease;
}

.progress-icon {
  position: absolute;
  right: -12px;
  top: 50%;
  transform: translateY(-50%);
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(251, 191, 36, 0.4);
}

.progress-text {
  font-size: 18px;
  font-weight: 600;
  color: #fbbf24;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 16px;
}

.result-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: 32px;
  text-align: center;
}

.result-title {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 24px 0 12px;
}

.result-message {
  font-size: 15px;
  color: #666;
  line-height: 1.6;
  margin-bottom: 32px;
}

.result-button {
  height: 50px;
  font-size: 17px;
  font-weight: 600;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border: none;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
  margin-bottom: 16px;
}

.result-button-secondary {
  height: 50px;
  font-size: 17px;
  font-weight: 600;
  border-color: #10b981;
  color: #10b981;
}
</style>
