<template>
  <div class="deposit-container">
    <!-- 顶部导航栏 -->
    <div class="header">
      <van-icon name="arrow-left" size="20" @click="router.back()" />
      <span class="title">{{ t("deposit.title") }}</span>
      <div style="width: 20px"></div>
    </div>

    <!-- 内容区域 -->
    <div class="content">
      <!-- 门店信息 -->
      <div class="info-card">
        <div class="info-item">
          <van-icon name="location-o" color="#10b981" size="20" />
          <div class="info-text">
            <div class="info-label">{{ t("deposit.storeName") }}</div>
            <div class="info-value">{{ storeInfo.name }}</div>
          </div>
        </div>

        <!-- 充电宝信息 -->
        <div class="info-item">
          <van-icon name="exchange" color="#10b981" size="20" />
          <div class="info-text">
            <div class="info-value">{{ t("deposit.deviceType") }}</div>
          </div>
        </div>

        <!-- 价格信息 -->
        <div class="info-item price-info">
          <van-icon name="gold-coin-o" color="#10b981" size="20" />
          <div class="info-text">
            <div class="price-title">{{ t("deposit.priceTitle") }}</div>
            <div class="price-desc">{{ t("deposit.priceDesc") }}</div>
          </div>
        </div>
      </div>

      <!-- 支付方式选择 -->
      <div class="payment-section">
        <div class="section-title">{{ t("deposit.selectPayment") }}</div>
        <div class="payment-methods">
          <div
            v-for="method in paymentMethods"
            :key="method.id"
            class="payment-item"
            :class="{ active: selectedPayment === method.id }"
            @click="selectPayment(method.id)"
          >
            <img :src="method.icon" :alt="method.name" class="payment-icon" />
            <van-icon
              v-if="selectedPayment === method.id"
              name="success"
              color="#10b981"
              class="check-icon"
            />
          </div>
        </div>

        <!-- 支付信息输入区域 -->
        <div
          v-if="selectedPayment && needsPhoneInput"
          class="payment-input-section"
        >
          <div class="input-label">{{ t("deposit.phoneNumber") }}</div>
          <van-field
            v-model="paymentPhone"
            type="tel"
            :placeholder="t('deposit.enterPhoneNumber')"
            class="phone-input"
            :border="false"
            maxlength="10"
          />
        </div>

        <!-- Orange 支付信息 -->
        <div v-if="selectedPayment === 'orange'" class="orange-payment-info">
          <div class="input-label">{{ t("deposit.paymentPhone") }}</div>
          <van-field
            v-model="orangePhone"
            type="tel"
            :placeholder="t('deposit.enterPhoneNumber')"
            class="phone-input"
            :border="false"
            maxlength="10"
          />

          <div class="input-label" style="margin-top: 16px">
            {{ t("deposit.authCode") }}
          </div>
          <van-field
            v-model="orangeAuthCode"
            type="text"
            :placeholder="t('deposit.enterAuthCode')"
            class="phone-input"
            :border="false"
            maxlength="4"
          />

          <div class="orange-tip">
            {{ t("deposit.orangeTip") }}
          </div>
        </div>
      </div>

      <!-- 押金说明 -->
      <div class="deposit-info">
        <div class="deposit-amount">
          {{
            t("deposit.depositRequired", {
              amount: depositAmount.toLocaleString(),
            })
          }}
        </div>
        <div class="deposit-refund">{{ t("deposit.refundable") }}</div>
      </div>

      <!-- 支付按钮 -->
      <van-button
        type="primary"
        block
        round
        class="pay-button"
        :loading="paying"
        @click="handlePay"
      >
        {{ t("deposit.payButton") }}
      </van-button>

      <!-- 退款说明 -->
      <div class="refund-notice">{{ t("deposit.refundNotice") }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { showToast, showDialog } from "vant";
import waveIcon from "@/assets/pay/wave.webp";
import momoIcon from "@/assets/pay/momo.webp";
import orangeIcon from "@/assets/pay/orange.png";
import moovIcon from "@/assets/pay/moov.png";

const { t } = useI18n();
const router = useRouter();

// 门店信息
const storeInfo = ref({
  id: "1",
  name: "门店地址门店地址门店地址",
  address: "香港特别行政区黄大仙区龙翔道120号",
});

// 押金金额
const depositAmount = ref(5000);

// 支付方式
const paymentMethods = ref([
  {
    id: "wave",
    name: "Wave",
    icon: waveIcon,
  },
  {
    id: "momo",
    name: "MoMo",
    icon: momoIcon,
  },
  {
    id: "orange",
    name: "Orange Money",
    icon: orangeIcon,
  },
  {
    id: "moov",
    name: "Moov Africa",
    icon: moovIcon,
  },
]);

// 选中的支付方式
const selectedPayment = ref("wave");
const paying = ref(false);
const paymentPhone = ref("");
const orangePhone = ref("");
const orangeAuthCode = ref("");

// 判断是否需要输入手机号
const needsPhoneInput = computed(() => {
  return selectedPayment.value === "momo" || selectedPayment.value === "moov";
});

// 选择支付方式
const selectPayment = (id: string) => {
  selectedPayment.value = id;
  // 切换支付方式时清空手机号
  paymentPhone.value = "";
  orangePhone.value = "";
  orangeAuthCode.value = "";
};

// 处理支付
const handlePay = async () => {
  if (!selectedPayment.value) {
    showToast(t("deposit.selectPaymentFirst"));
    return;
  }

  // 验证手机号（MoMo/Moov）
  if (needsPhoneInput.value && !paymentPhone.value) {
    showToast(t("deposit.phoneRequired"));
    return;
  }

  if (needsPhoneInput.value && paymentPhone.value.length < 10) {
    showToast(t("deposit.phoneInvalid"));
    return;
  }

  // 验证Orange支付信息
  if (selectedPayment.value === "orange") {
    if (!orangePhone.value) {
      showToast(t("deposit.phoneRequired"));
      return;
    }
    if (orangePhone.value.length < 10) {
      showToast(t("deposit.phoneInvalid"));
      return;
    }
    if (!orangeAuthCode.value) {
      showToast(t("deposit.authCodeRequired"));
      return;
    }
    if (orangeAuthCode.value.length < 4) {
      showToast(t("deposit.authCodeInvalid"));
      return;
    }
  }

  paying.value = true;

  try {
    // 模拟支付过程
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // 实际应该调用支付API
    // const res = await payDeposit({
    //   storeId: storeInfo.value.id,
    //   amount: depositAmount.value,
    //   paymentMethod: selectedPayment.value,
    //   phone: paymentPhone.value || orangePhone.value,
    //   authCode: orangeAuthCode.value
    // });

    showDialog({
      title: t("common.success"),
      message: t("deposit.paySuccess"),
      confirmButtonColor: "#10b981",
    }).then(() => {
      // 跳转到充电宝弹出页面
      router.push("/popping");
    });
  } catch (error) {
    showToast(t("deposit.payFailed"));
  } finally {
    paying.value = false;
  }
};
</script>

<style scoped>
.deposit-container {
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

.info-card {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.info-item {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-text {
  flex: 1;
}

.info-label {
  font-size: 14px;
  color: #666;
  margin-bottom: 4px;
}

.info-value {
  font-size: 15px;
  color: #333;
  font-weight: 500;
}

.price-info {
  background: #f0fdf4;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 0;
}

.price-title {
  font-size: 16px;
  color: #333;
  font-weight: 600;
  margin-bottom: 6px;
}

.price-desc {
  font-size: 13px;
  color: #666;
  line-height: 1.5;
}

.payment-section {
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

.payment-methods {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 4px;
}

.payment-item {
  position: relative;
  background: #1a1f3a;
  border-radius: 12px;
  padding: 16px 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  min-width: 70px;
  flex: 1;
  min-height: 60px;
}

.payment-item.active {
  border-color: #10b981;
  background: #1a2540;
}

.payment-item:active {
  transform: scale(0.98);
}

.payment-icon {
  width: 100%;
  height: auto;
  max-width: 60px;
  max-height: 35px;
  object-fit: contain;
}

.check-icon {
  position: absolute;
  top: 8px;
  right: 8px;
  background: #fff;
  border-radius: 50%;
  padding: 2px;
}

.deposit-info {
  background: #1a1f3a;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  margin-bottom: 16px;
}

.deposit-amount {
  font-size: 18px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 8px;
}

.deposit-refund {
  font-size: 14px;
  color: #999;
}

.pay-button {
  height: 50px;
  font-size: 17px;
  font-weight: 600;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border: none;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
  margin-bottom: 16px;
}

.pay-button:active {
  transform: translateY(1px);
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
}

.refund-notice {
  text-align: center;
  font-size: 13px;
  color: #999;
  line-height: 1.6;
  padding: 0 20px;
}

.payment-input-section {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
}

.input-label {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
  font-weight: 500;
}

.phone-input {
  background: #f5f5f5;
  border-radius: 8px;
  padding: 4px 12px;
}

.phone-input :deep(.van-field__control) {
  font-size: 15px;
}

.orange-payment-info {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
}

.orange-tip {
  background: #fff7ed;
  padding: 12px;
  border-radius: 8px;
  font-size: 13px;
  color: #f59e0b;
  line-height: 1.5;
  margin-top: 12px;
}
</style>
