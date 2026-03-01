<template>
  <div class="mine-container">
    <!-- 顶部：用户信息 + 押金卡片 -->
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

      <!-- 押金卡片 -->
      <div class="deposit-card">
        <!-- 左：金额 + 状态 -->
        <div class="deposit-main">
          <div class="deposit-label">{{ t("mine.deposit") }}</div>
          <div class="deposit-amount">
            <span class="deposit-number">{{ depositFormatted }}</span>
            <span class="deposit-currency">FCFA</span>
          </div>
          <div class="deposit-status" :class="depositActive ? 'status--active' : 'status--inactive'">
            <span class="status-dot" />
            {{ depositActive ? t("mine.depositActive") : t("mine.depositNone") }}
          </div>
        </div>

        <!-- 右：操作按钮 -->
        <div class="deposit-actions">
          <button class="deposit-action-btn deposit-action-btn--primary" @click="goToOrders">
            <van-icon name="orders-o" size="18" />
            <span>{{ t("mine.myOrders") }}</span>
          </button>
          <button
            class="deposit-action-btn deposit-action-btn--ghost"
            :disabled="withdrawLoading || !depositActive"
            @click="handleWithdraw"
          >
            <van-loading v-if="withdrawLoading" size="16" color="#10b981" />
            <van-icon v-else name="refund-o" size="18" />
            <span>{{ t("mine.withdraw") }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 菜单 -->
    <div class="menu-section">
      <div class="menu-item" @click="goToLanguage">
        <div class="menu-left">
          <van-icon name="font-o" size="20" color="#8b5cf6" />
          <span class="menu-text">{{ t("mine.language") }}</span>
        </div>
        <div class="menu-right">
          <span class="current-value">{{ currentLanguageName }}</span>
          <van-icon name="arrow" color="#ccc" />
        </div>
      </div>

      <!-- <div class="menu-item" @click="goToAbout">
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
      </div> -->

      <div class="menu-item" @click="showContactSheet = true">
        <div class="menu-left">
          <van-icon name="service-o" size="20" color="#25d366" />
          <span class="menu-text">{{ t("mine.contactSupport") }}</span>
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

    <!-- 语言选择弹窗 -->
    <van-action-sheet v-model:show="showLanguageSheet" :title="t('mine.selectLanguage')" :actions="languageOptions" cancel-text="" @select="onLanguageSelect" />

    <!-- 联系客服弹窗 -->
    <van-popup v-model:show="showContactSheet" position="bottom" round safe-area-inset-bottom>
      <div class="contact-popup">
        <div class="contact-popup-title">{{ t("mine.contactSupport") }}</div>
        <div class="contact-number">
          <van-icon name="phone-o" size="16" color="#999" />
          <span>{{ SUPPORT_PHONE_DISPLAY }}</span>
        </div>
        <div class="contact-actions">
          <div class="contact-btn contact-btn--whatsapp" @click="openWhatsApp">
            <svg class="contact-btn-icon" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="16" r="16" fill="#25D366"/>
              <path d="M23.5 8.5A10.44 10.44 0 0 0 16 5.5a10.5 10.5 0 0 0-9.1 15.72L5.5 26.5l5.44-1.38A10.5 10.5 0 0 0 26.5 16a10.44 10.44 0 0 0-3-7.5zm-7.5 16.14a8.71 8.71 0 0 1-4.44-1.22l-.32-.19-3.23.82.85-3.15-.2-.33A8.75 8.75 0 1 1 16 24.64zm4.8-6.55c-.26-.13-1.55-.76-1.79-.85s-.41-.13-.59.13-.67.85-.82 1-.3.2-.57.07a7.13 7.13 0 0 1-2.1-1.3 7.85 7.85 0 0 1-1.45-1.8c-.15-.26 0-.4.11-.53s.26-.3.4-.46a1.78 1.78 0 0 0 .26-.44.49.49 0 0 0 0-.46c-.07-.13-.59-1.42-.81-1.94s-.43-.44-.59-.45h-.5a1 1 0 0 0-.7.33 2.93 2.93 0 0 0-.92 2.18 5.1 5.1 0 0 0 1.07 2.7 11.66 11.66 0 0 0 4.47 3.94c.63.27 1.12.43 1.5.55a3.6 3.6 0 0 0 1.66.1 2.69 2.69 0 0 0 1.76-1.24 2.17 2.17 0 0 0 .15-1.24c-.06-.1-.24-.17-.5-.3z" fill="#fff"/>
            </svg>
            <span>{{ t("mine.openWhatsApp") }}</span>
          </div>
          <div class="contact-btn contact-btn--call" @click="callPhone">
            <van-icon name="phone-o" size="20" color="#10b981" />
            <span>{{ t("mine.callPhone") }}</span>
          </div>
        </div>
        <div class="contact-cancel" @click="showContactSheet = false">{{ t("common.cancel") }}</div>
      </div>
    </van-popup>

    <!-- 底部导航 -->
    <BottomNav />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { showToast, showDialog } from "vant";
import { useUserStore } from "@/store/modules/user";
import { getUserInfo } from "@/api/user";
import { refundDeposit } from "@/api/deposit";
import { setLanguage } from "@/i18n";
import { BottomNav } from "@/components/common";

const { t, locale } = useI18n();
const router = useRouter();
const userStore = useUserStore();

// 客服 WhatsApp 号码（国际格式，不含 +）
const SUPPORT_PHONE = "2250701478515";
const SUPPORT_PHONE_DISPLAY = "+225 07 01 47 85 15";

// 联系客服弹窗
const showContactSheet = ref(false);

const openWhatsApp = () => {
  showContactSheet.value = false;
  window.open(`https://wa.me/${SUPPORT_PHONE}`, "_blank");
};

const callPhone = () => {
  showContactSheet.value = false;
  window.location.href = `tel:+${SUPPORT_PHONE}`;
};

// 语言选择相关
const showLanguageSheet = ref(false);
const languageOptions = computed(() => {
  const options = [
    { name: "中文", value: "zh-CN" },
    { name: "English", value: "en-US" },
    { name: "Français", value: "fr-FR" },
  ];
  // 高亮当前选中的语言
  return options.map((option) => ({
    ...option,
    className: option.value === locale.value ? "van-action-sheet__item--active" : "",
  }));
});

// 是否登录
const isLoggedIn = computed(() => {
  return !!userStore.token && !!userStore.userInfo?.userId;
});

// 用户名和ID（使用真实数据）
const username = computed(() => {
  const info = userStore.userInfo || {};
  return info.nickname || info.username || info.phone || "";
});

const userId = computed(() => {
  return userStore.userInfo?.userId || "";
});

// 押金数值
const deposit = computed(() => {
  const info = userStore.userInfo || {};
  const raw = info.depositAmount ?? info.deposit ?? 0;
  return typeof raw === "string" ? parseFloat(raw) : Number(raw || 0);
});

// 押金是否有效（> 0）
const depositActive = computed(() => deposit.value > 0);

// 格式化显示（FCFA 一般无小数，整数展示）
const depositFormatted = computed(() =>
  deposit.value.toLocaleString("fr-FR", { maximumFractionDigits: 0 })
);

// 当前语言名称
const currentLanguageName = computed(() => {
  const langMap: Record<string, string> = {
    "zh-CN": "中文",
    "en-US": "English",
    "fr-FR": "Français",
  };
  return langMap[locale.value] || "中文";
});

// 跳转到登录
const goToLogin = () => {
  router.push("/login");
};

// 跳转到订单列表
const goToOrders = () => {
  router.push("/order-list");
};

// 跳转到语言设置
const goToLanguage = () => {
  showLanguageSheet.value = true;
};

// 选择语言
const onLanguageSelect = (action: any) => {
  if (action && action.value && action.value !== locale.value) {
    setLanguage(action.value);
    showToast(t("mine.languageChanged"));
    // 可选：刷新页面以应用新语言
    // window.location.reload();
  }
  showLanguageSheet.value = false;
};

// 跳转到关于我们
const goToAbout = () => {
  showToast(t("mine.featureComingSoon"));
};

// 跳转到帮助中心
const goToHelp = () => {
  showToast(t("mine.featureComingSoon"));
};

// 提现（退押金）
const withdrawLoading = ref(false);

const handleWithdraw = () => {
  if (!isLoggedIn.value) {
    showToast(t("mine.pleaseLoginFirst"));
    return;
  }
  if (deposit.value <= 0) {
    showToast(t("mine.noDepositToWithdraw"));
    return;
  }
  showDialog({
    title: t("mine.withdrawConfirmTitle"),
    message: t("mine.withdrawConfirmMessage"),
    confirmButtonText: t("mine.withdrawConfirmBtn"),
    cancelButtonText: t("common.cancel"),
    confirmButtonColor: "#ef4444",
    showCancelButton: true,
  }).then(async () => {
    withdrawLoading.value = true;
    try {
      await refundDeposit();
      showToast({ message: t("mine.withdrawSuccess"), type: "success" });
      // 刷新用户信息更新押金余额显示
      const res: any = await getUserInfo();
      const data = res?.poweruser || res;
      if (data) userStore.userInfo = data;
    } catch {
      // 错误已由 request 拦截器统一展示，此处无需重复提示
    } finally {
      withdrawLoading.value = false;
    }
  }).catch(() => {
    // 用户点击取消，不做任何处理
  });
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
    userStore.logout();
    showToast(t("mine.logoutSuccess"));
    router.push("/login");
  });
};

// 进入页面时刷新一次用户信息
onMounted(async () => {
  if (!userStore.token) return;
  try {
    const res: any = await getUserInfo();
    const data = res?.poweruser || res;
    if (data) {
      userStore.userInfo = data;
    }
  } catch (error) {
    // 静默失败即可，避免打扰用户
    console.warn("刷新用户信息失败:", error);
  }
});
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
  padding: 24px 16px 36px;
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

/* ── 押金卡片 ── */
.deposit-card {
  margin-top: 20px;
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  display: flex;
  align-items: center;
  gap: 12px;
}

.deposit-main {
  flex: 1;
  min-width: 0;
}

.deposit-label {
  font-size: 12px;
  color: #999;
  margin-bottom: 4px;
  letter-spacing: 0.3px;
}

.deposit-amount {
  display: flex;
  align-items: baseline;
  gap: 4px;
  margin-bottom: 8px;
}

.deposit-number {
  font-size: 30px;
  font-weight: 800;
  color: #1a1a1a;
  line-height: 1;
}

.deposit-currency {
  font-size: 13px;
  font-weight: 600;
  color: #888;
}

.deposit-status {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  font-weight: 500;
  padding: 3px 10px;
  border-radius: 20px;
}

.status--active {
  background: #dcfce7;
  color: #16a34a;
}

.status--inactive {
  background: #f3f4f6;
  color: #9ca3af;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
  flex-shrink: 0;
}

.deposit-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex-shrink: 0;
}

.deposit-action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: opacity 0.2s;
  white-space: nowrap;
}

.deposit-action-btn:active {
  opacity: 0.75;
}

.deposit-action-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.deposit-action-btn--primary {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: #fff;
}

.deposit-action-btn--ghost {
  background: transparent;
  color: #10b981;
  border: 1.5px solid #10b981;
}

.menu-section {
  background: #fff;
  margin: 10px 16px 16px;
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

.contact-popup {
  padding: 20px 16px 12px;
}

.contact-popup-title {
  text-align: center;
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 8px;
}

.contact-number {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 14px;
  color: #999;
  margin-bottom: 20px;
}

.contact-actions {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.contact-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px 8px;
  border-radius: 12px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: opacity 0.2s;
}

.contact-btn:active {
  opacity: 0.7;
}

.contact-btn--whatsapp {
  background: #e8fdf2;
  color: #25d366;
}

.contact-btn--call {
  background: #f0fdf9;
  color: #10b981;
}

.contact-btn-icon {
  width: 32px;
  height: 32px;
  flex-shrink: 0;
}

.contact-cancel {
  text-align: center;
  padding: 14px;
  font-size: 15px;
  color: #999;
  cursor: pointer;
  border-top: 1px solid #f0f0f0;
  margin-top: 4px;
}

</style>
