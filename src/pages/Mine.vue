<template>
  <div class="mine-container">
    <!-- 顶部个人信息 -->
    <div class="profile-header">
      <div class="user-info">
        <div class="avatar">
          <van-icon name="user-o" size="48" color="#fff" />
        </div>
        <div class="user-details">
          <div class="username">{{ username || t("mine.notLoggedIn") }}</div>
          <div class="user-id" v-if="userId">ID: {{ userId }}</div>
          <div class="login-tip" v-else @click="goToLogin">
            {{ t("mine.clickToLogin") }}
          </div>
        </div>
      </div>
    </div>

    <!-- 我的钱包 -->
    <div class="wallet-section">
      <div class="section-title">{{ t("mine.myWallet") }}</div>
      <div class="wallet-card">
        <div class="wallet-item">
          <div class="wallet-value">¥{{ balance }}</div>
          <div class="wallet-label">{{ t("mine.balance") }}</div>
        </div>
        <div class="wallet-divider"></div>
        <div class="wallet-item">
          <div class="wallet-value">¥{{ deposit }}</div>
          <div class="wallet-label">{{ t("mine.deposit") }}</div>
        </div>
        <van-button
          type="primary"
          size="small"
          round
          class="withdraw-btn"
          @click="handleWithdraw"
        >
          {{ t("mine.withdraw") }}
        </van-button>
      </div>
    </div>

    <!-- 菜单列表 -->
    <div class="menu-section">
      <div class="menu-item" @click="goToOrders">
        <div class="menu-left">
          <van-icon name="orders-o" size="20" color="#10b981" />
          <span class="menu-text">{{ t("mine.myOrders") }}</span>
        </div>
        <van-icon name="arrow" color="#ccc" />
      </div>

      <div class="menu-item" @click="goToCoupon">
        <div class="menu-left">
          <van-icon name="coupon-o" size="20" color="#f59e0b" />
          <span class="menu-text">{{ t("mine.myCoupons") }}</span>
        </div>
        <div class="menu-right">
          <span class="badge" v-if="couponCount > 0">{{ couponCount }}</span>
          <van-icon name="arrow" color="#ccc" />
        </div>
      </div>

      <div class="menu-item" @click="goToAddress">
        <div class="menu-left">
          <van-icon name="location-o" size="20" color="#3b82f6" />
          <span class="menu-text">{{ t("mine.myAddress") }}</span>
        </div>
        <van-icon name="arrow" color="#ccc" />
      </div>
    </div>

    <!-- 设置菜单 -->
    <div class="menu-section">
      <div class="menu-item" @click="goToLanguage">
        <div class="menu-left">
          <van-icon name="globe-o" size="20" color="#8b5cf6" />
          <span class="menu-text">{{ t("mine.language") }}</span>
        </div>
        <div class="menu-right">
          <span class="current-value">{{ currentLanguageName }}</span>
          <van-icon name="arrow" color="#ccc" />
        </div>
      </div>

      <div class="menu-item" @click="goToAbout">
        <div class="menu-left">
          <van-icon name="info-o" size="20" color="#64748b" />
          <span class="menu-text">{{ t("mine.about") }}</span>
        </div>
        <van-icon name="arrow" color="#ccc" />
      </div>

      <div class="menu-item" @click="goToHelp">
        <div class="menu-left">
          <van-icon name="question-o" size="20" color="#ec4899" />
          <span class="menu-text">{{ t("mine.help") }}</span>
        </div>
        <van-icon name="arrow" color="#ccc" />
      </div>
    </div>

    <!-- 退出登录按钮 -->
    <div class="logout-section" v-if="isLoggedIn">
      <van-button block round class="logout-btn" @click="handleLogout">
        {{ t("mine.logout") }}
      </van-button>
    </div>

    <!-- 底部导航 -->
    <div class="bottom-nav">
      <div class="nav-item" @click="goToHome">
        <van-icon name="wap-home-o" size="24" />
        <span>{{ t("store.home") }}</span>
      </div>
      <div class="nav-item nav-center" @click="handleScanToRent">
        <div class="scan-button">
          <van-icon name="scan" size="28" color="#fff" />
        </div>
        <span class="scan-text">{{ t("store.scanToRent") }}</span>
      </div>
      <div class="nav-item active">
        <van-icon name="user-o" size="24" />
        <span>{{ t("store.mine") }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { showToast, showDialog } from "vant";
import { ss } from "@/utils/storage/local";

const { t, locale } = useI18n();
const router = useRouter();

// 用户信息
const username = ref("用户123456");
const userId = ref("123456789");
const balance = ref("96.00");
const deposit = ref("99.00");
const couponCount = ref(2);

// 是否登录
const isLoggedIn = computed(() => {
  return !!ss.get("token");
});

// 当前语言名称
const currentLanguageName = computed(() => {
  const langMap: Record<string, string> = {
    "zh-CN": "中文",
    "en-US": "English",
    "fr-FR": "Français",
  };
  return langMap[locale.value] || "中文";
});

// 跳转到首页
const goToHome = () => {
  router.push("/");
};

// 跳转到登录
const goToLogin = () => {
  router.push("/login");
};

// 跳转到订单列表
const goToOrders = () => {
  router.push("/order-list");
};

// 跳转到优惠券
const goToCoupon = () => {
  showToast(t("mine.featureComingSoon"));
};

// 跳转到地址管理
const goToAddress = () => {
  showToast(t("mine.featureComingSoon"));
};

// 跳转到语言设置
const goToLanguage = () => {
  showToast(t("mine.featureComingSoon"));
};

// 跳转到关于我们
const goToAbout = () => {
  showToast(t("mine.featureComingSoon"));
};

// 跳转到帮助中心
const goToHelp = () => {
  showToast(t("mine.featureComingSoon"));
};

// 提现
const handleWithdraw = () => {
  if (!isLoggedIn.value) {
    showToast(t("mine.pleaseLoginFirst"));
    return;
  }
  showToast(t("mine.featureComingSoon"));
};

// 扫码租借
const handleScanToRent = () => {
  showToast(t("mine.scanFeature"));
};

// 退出登录
const handleLogout = () => {
  showDialog({
    title: t("mine.logoutConfirm"),
    message: t("mine.logoutMessage"),
    confirmButtonText: t("common.confirm"),
    cancelButtonText: t("common.cancel"),
    confirmButtonColor: "#ef4444",
    showCancelButton: true,
  }).then(() => {
    ss.remove("token");
    username.value = "";
    userId.value = "";
    showToast(t("mine.logoutSuccess"));
    router.push("/login");
  });
};
</script>

<style scoped>
.mine-container {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 80px;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.profile-header {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  padding: 24px 16px;
  padding-top: calc(24px + env(safe-area-inset-top));
}

.user-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.avatar {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3px solid rgba(255, 255, 255, 0.3);
}

.user-details {
  flex: 1;
  color: #fff;
}

.username {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 6px;
}

.user-id {
  font-size: 13px;
  opacity: 0.9;
}

.login-tip {
  font-size: 14px;
  opacity: 0.9;
  cursor: pointer;
  text-decoration: underline;
}

.wallet-section {
  margin: -24px 16px 16px;
  position: relative;
  z-index: 1;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 12px;
  opacity: 0.9;
}

.wallet-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 16px;
  position: relative;
}

.wallet-item {
  flex: 1;
  text-align: center;
}

.wallet-value {
  font-size: 24px;
  font-weight: 700;
  color: #333;
  margin-bottom: 6px;
}

.wallet-label {
  font-size: 13px;
  color: #999;
}

.wallet-divider {
  width: 1px;
  height: 40px;
  background: #e5e5e5;
}

.withdraw-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  height: 32px;
  padding: 0 16px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border: none;
  font-size: 13px;
}

.menu-section {
  background: #fff;
  margin: 0 16px 16px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.menu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  cursor: pointer;
  transition: background 0.2s ease;
  border-bottom: 1px solid #f5f5f5;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-item:active {
  background: #f9f9f9;
}

.menu-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.menu-text {
  font-size: 15px;
  color: #333;
  font-weight: 500;
}

.menu-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.current-value {
  font-size: 14px;
  color: #999;
}

.badge {
  background: #ef4444;
  color: #fff;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 10px;
  min-width: 18px;
  text-align: center;
}

.logout-section {
  padding: 0 16px 16px;
}

.logout-btn {
  height: 48px;
  font-size: 16px;
  font-weight: 600;
  color: #ef4444;
  border: 1px solid #ef4444;
  background: #fff;
}

.logout-btn:active {
  opacity: 0.7;
}

.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 70px;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-around;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);
  padding-bottom: env(safe-area-inset-bottom);
}

.nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  color: #666;
  font-size: 12px;
  cursor: pointer;
  transition: color 0.3s ease;
}

.nav-item.active {
  color: #10b981;
}

.nav-item:active {
  opacity: 0.7;
}

.nav-center {
  position: relative;
  top: -10px;
}

.scan-button {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);
  transition: all 0.3s ease;
}

.scan-button:active {
  transform: scale(0.95);
  box-shadow: 0 2px 8px rgba(245, 158, 11, 0.4);
}

.scan-text {
  margin-top: 4px;
  color: #333;
  font-weight: 500;
}
</style>
