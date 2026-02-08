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
      <!-- 提示信息 -->
      <div class="tip-banner">
        <van-icon name="info-o" color="#f59e0b" size="16" />
        <span>{{ t("popping.tip") }}</span>
      </div>

      <!-- 充电宝机柜示意图 -->
      <div class="cabinet-container">
        <div class="cabinet-grid">
          <div
            v-for="slot in 8"
            :key="slot"
            class="slot"
            :class="{ active: slot === activeSlot }"
          >
            <div class="slot-inner"></div>
          </div>
        </div>
      </div>

      <!-- 弹出提示框 -->
      <div class="popping-notice">
        <van-icon name="checked" color="#4080FF" size="24" />
        <span>{{ t("popping.notice") }}</span>
      </div>

      <!-- 进度条 -->
      <div class="progress-container">
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: progress + '%' }">
            <div class="progress-icon">
              <van-icon name="lightning" color="#fff" size="16" />
            </div>
          </div>
        </div>
        <div class="progress-text">{{ progress }}%</div>
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

const activeSlot = ref(2); // 高亮的充电槽位置（右上角第一个）
const progress = ref(0);
let progressTimer: number | null = null;

// 模拟进度更新
const startProgress = () => {
  progressTimer = window.setInterval(() => {
    if (progress.value < 100) {
      progress.value += 1;
    } else {
      if (progressTimer) {
        clearInterval(progressTimer);
      }
      // 完成后跳转或提示
      showToast({
        message: t("popping.success"),
        icon: "success",
        duration: 2000,
        onClose: () => {
          // router.back();
        },
      });
    }
  }, 100);
};

onMounted(() => {
  // 延迟开始进度
  setTimeout(() => {
    startProgress();
  }, 500);
});

onUnmounted(() => {
  if (progressTimer) {
    clearInterval(progressTimer);
  }
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
</style>
