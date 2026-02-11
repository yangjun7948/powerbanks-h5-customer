<template>
  <div class="qr-result-container">
    <!-- 加载中 -->
    <div v-if="loading" class="loading-container">
      <van-loading type="spinner" color="#10b981" size="48" vertical>
        {{ t("qrResult.checking") }}
      </van-loading>
    </div>

    <!-- 错误提示 -->
    <div v-else-if="error" class="error-container">
      <van-icon name="warning-o" size="48" color="#ef4444" />
      <p class="error-message">{{ error }}</p>
      <van-button type="primary" @click="router.push('/')">
        {{ t("common.back") }}
      </van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { getDepositStatus } from "@/api/deposit";
import { useUserStore } from "@/store/modules/user";
const userStore = useUserStore();
const { t } = useI18n();
const router = useRouter();
const route = useRoute();

// 状态
const loading = ref(true);
const error = ref("");

// 检查押金并跳转
const checkDepositAndRedirect = async () => {
  try {
    loading.value = true;
    error.value = "";

    // 获取设备编号（从 query 参数中获取）
    const sn = route.query.sn as string;
    if (!sn) {
      error.value = t("qrResult.noDeviceCode");
      loading.value = false;
      return;
    }

    // 查询押金状态
    const res: any = await getDepositStatus(userStore.userInfo.userId);

    // 根据押金状态跳转
    const depositStatus = res?.isDepositSufficient;
    const needPayAmount = res?.needPayAmount;
    //押金足够
    if (depositStatus) {
      // 押金已支付，跳转到 Popping 页面
      router.replace({
        path: "/popping",
        query: {
          sn: sn,
        },
      });
    } else if (!depositStatus) {
      // 押金未支付，跳转到押金支付页面
      router.replace({
        path: "/deposit",
        query: {
          sn: sn,
          amount: needPayAmount,
        },
      });
    }
  } catch (err: any) {   
    error.value = t("qrResult.checkFailed");
    loading.value = false;
  }
};

// 组件挂载时执行检查
onMounted(() => {
  checkDepositAndRedirect();
});
</script>

<style scoped>
.qr-result-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
}

.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24px;
  padding: 32px;
}

.error-message {
  font-size: 16px;
  color: #666;
  text-align: center;
  margin: 0;
}
</style>
