<template>
  <div class="qr-scanner-container">
    <!-- 顶部导航栏 -->
    <div class="header">
      <van-icon name="cross" size="24" color="#fff" @click="handleClose" />
      <span class="title">{{ t("scanner.title") }}</span>
      <div style="width: 24px"></div>
    </div>

    <!-- 扫码区域 -->
    <div class="scanner-wrapper">
      <qrcode-stream v-if="showScanner" :constraints="constraints" :torch="torchActive" :track="paintBoundingBox" @detect="onDetect" @camera-on="onCameraReady" @error="onError" class="scanner-video">
        <!-- 扫描框 -->
        <div class="scan-frame">
          <div class="corner corner-top-left"></div>
          <div class="corner corner-top-right"></div>
          <div class="corner corner-bottom-left"></div>
          <div class="corner corner-bottom-right"></div>
          <div class="scan-line"></div>
        </div>
      </qrcode-stream>

      <!-- 加载中 -->
      <div v-if="loading" class="loading-overlay">
        <van-loading size="48" color="#10b981" vertical>{{ t("scanner.loading") }}</van-loading>
      </div>
    </div>

    <!-- 底部提示 -->
    <div class="scanner-footer">
      <div class="tip-text">{{ t("scanner.tip") }}</div>

      <div class="action-buttons">
        <!-- 切换摄像头按钮 -->
        <van-button v-if="hasMultipleCameras" round plain size="small" class="action-btn" @click="switchCamera">
          <van-icon name="replay" />
          {{ t("scanner.switchCamera") }}
        </van-button>

        <!-- 闪光灯按钮 -->
        <van-button v-if="torchSupported" round plain size="small" class="action-btn" :class="{ active: torchActive }" @click="toggleTorch">
          <van-icon :name="torchActive ? 'fire' : 'fire-o'" />
          {{ t("scanner.flashlight") }}
        </van-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { showToast, showDialog } from "vant";
import { QrcodeStream } from "vue-qrcode-reader";
import { getDepositStatus } from "@/api/deposit";

const { t } = useI18n();
const router = useRouter();

// 状态
const showScanner = ref(true);
const loading = ref(true);
const hasMultipleCameras = ref(false);
const torchSupported = ref(false);
const torchActive = ref(false);
const currentCamera = ref<"user" | "environment">("environment"); // environment=后置, user=前置

// 摄像头约束
const constraints = ref({
  facingMode: currentCamera.value,
  width: { ideal: 1920 },
  height: { ideal: 1080 },
});

// 绘制边界框
const paintBoundingBox = (detectedCodes: any[], ctx: CanvasRenderingContext2D) => {
  for (const detectedCode of detectedCodes) {
    const {
      boundingBox: { x, y, width, height },
    } = detectedCode;

    ctx.lineWidth = 2;
    ctx.strokeStyle = "#10b981";
    ctx.strokeRect(x, y, width, height);
  }
};

// 摄像头就绪
const onCameraReady = async (capabilities: any) => {
  loading.value = false;
  console.log("摄像头就绪", capabilities);

  // 检查是否支持闪光灯
  torchSupported.value = !!capabilities?.torch;
  console.log("是否支持闪光灯:", torchSupported.value);

  // 检查是否有多个摄像头
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter((device) => device.kind === "videoinput");
    hasMultipleCameras.value = videoDevices.length > 1;
    console.log("摄像头数量:", videoDevices.length);
  } catch (error) {
    console.error("Error checking cameras:", error);
  }
};

// 检测到二维码
const onDetect = (detectedCodes: any[]) => {
  if (detectedCodes && detectedCodes.length > 0) {
    const qrCode = detectedCodes[0].rawValue;
    handleScanResult(qrCode);
  }
};

// 处理扫码结果
const handleScanResult = async (qrCode: string) => {
  console.log("扫码结果:", qrCode);

  // 暂停扫描
  showScanner.value = false;

  // 这里根据二维码内容进行相应的处理
  // 例如：跳转到押金页面、显示设备信息等
  try {
    await showDialog({
      title: t("scanner.scanSuccess"),
      message: `${t("scanner.qrCodeContent")}: ${qrCode}`,
      confirmButtonText: t("common.confirm"),
      confirmButtonColor: "#10b981",
    });

    // todo 先调用接口判断押金够不够
    const res = await getDepositStatus(qrCode);
    if (res.data.depositStatus === "PAID") {
      router.push({
        path: "/popping",
        query: { qrCode },
      });
    } else if (res.data.depositStatus === "UNPAID") {
      router.push({
        path: "/deposit",
        query: { qrCode },
      });
    } else {
      showToast(t("scanner.depositStatusError"));
    }
  } catch (error) {
    // 用户取消对话框或其他错误
    console.error("处理扫码结果失败:", error);
    // 恢复扫描
    showScanner.value = true;
  }
};

// 切换摄像头
const switchCamera = () => {
  currentCamera.value = currentCamera.value === "environment" ? "user" : "environment";
  constraints.value = {
    ...constraints.value,
    facingMode: currentCamera.value,
  };

  // 切换摄像头时关闭闪光灯
  torchActive.value = false;

  // 重新加载扫描器
  showScanner.value = false;
  loading.value = true;
  setTimeout(() => {
    showScanner.value = true;
  }, 100);
};

// 切换闪光灯
const toggleTorch = () => {
  if (torchSupported.value) {
    torchActive.value = !torchActive.value;
    showToast({
      message: torchActive.value ? t("scanner.flashlightOn") : t("scanner.flashlightOff"),
      duration: 1000,
    });
  } else {
    showToast({
      message: t("scanner.flashlightNotSupported"),
      duration: 2000,
    });
  }
};

// 错误处理
const onError = (error: Error) => {
  loading.value = false;
  console.error("Camera error:", error);

  let errorMessage = t("scanner.cameraError");

  if (error.name === "NotAllowedError") {
    errorMessage = t("scanner.permissionDenied");
  } else if (error.name === "NotFoundError") {
    errorMessage = t("scanner.noCameraFound");
  } else if (error.name === "NotReadableError") {
    errorMessage = t("scanner.cameraInUse");
  } else if (error.name === "NotSupportedError") {
    errorMessage = t("scanner.notSupported");
  } else if (error.name === "InsecureContextError") {
    errorMessage = t("scanner.httpsRequired");
  }

  showDialog({
    title: t("scanner.errorTitle"),
    message: errorMessage,
    confirmButtonText: t("common.confirm"),
    confirmButtonColor: "#ef4444",
  }).then(() => {
    router.back();
  });
};

// 关闭扫描
const handleClose = () => {
  torchActive.value = false; // 关闭闪光灯
  router.back();
};

// 组件卸载时清理
onUnmounted(() => {
  torchActive.value = false; // 确保关闭闪光灯
  showScanner.value = false;
});
</script>

<style scoped>
.qr-scanner-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #000;
  z-index: 9999;
}

.header {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 56px;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  padding-top: env(safe-area-inset-top);
  z-index: 10;
}

.title {
  font-size: 18px;
  font-weight: 600;
  color: #fff;
}

.scanner-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
}

.scanner-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.scanner-video :deep(video) {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.scan-frame {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 280px;
  height: 280px;
  border: 2px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 0 0 2000px rgba(0, 0, 0, 0.5);
}

.corner {
  position: absolute;
  width: 24px;
  height: 24px;
  border: 3px solid #10b981;
}

.corner-top-left {
  top: -2px;
  left: -2px;
  border-right: none;
  border-bottom: none;
}

.corner-top-right {
  top: -2px;
  right: -2px;
  border-left: none;
  border-bottom: none;
}

.corner-bottom-left {
  bottom: -2px;
  left: -2px;
  border-right: none;
  border-top: none;
}

.corner-bottom-right {
  bottom: -2px;
  right: -2px;
  border-left: none;
  border-top: none;
}

.scan-line {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: linear-gradient(90deg, transparent, #10b981, transparent);
  animation: scan 2s infinite;
  box-shadow: 0 0 10px #10b981;
}

@keyframes scan {
  0% {
    top: 0;
  }
  50% {
    top: calc(100% - 3px);
  }
  100% {
    top: 0;
  }
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 5;
}

.scanner-footer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 24px 16px;
  padding-bottom: calc(24px + env(safe-area-inset-bottom));
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
  text-align: center;
  z-index: 10;
}

.tip-text {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 20px;
  line-height: 1.5;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
}

.action-btn {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.3);
  color: #fff;
  min-width: 120px;
}

.action-btn.active {
  background: rgba(16, 185, 129, 0.2);
  border-color: #10b981;
  color: #10b981;
}

.action-btn:active {
  opacity: 0.7;
}
</style>
