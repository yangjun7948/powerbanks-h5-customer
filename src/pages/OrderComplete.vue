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
      <!-- 成功图标和提示 -->
      <div class="success-section">
        <div class="success-icon">
          <van-icon name="checked" color="#fff" size="48" />
        </div>
        <div class="success-text">{{ t("orderComplete.successMessage") }}</div>
      </div>

      <!-- 订单金额 -->
      <div class="amount-section">
        <div class="amount">¥{{ orderAmount }}</div>
        <div class="amount-label">{{ t("orderComplete.totalAmount") }}</div>
      </div>

      <!-- 订单详情 -->
      <div class="order-details">
        <div class="detail-item">
          <span class="detail-label">{{ t("orderComplete.duration") }}</span>
          <span class="detail-value">{{ orderDuration }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">{{ t("orderComplete.borrowTime") }}</span>
          <span class="detail-value">{{ borrowTime }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">{{ t("orderComplete.returnTime") }}</span>
          <span class="detail-value">{{ returnTime }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">{{ t("orderComplete.orderNumber") }}</span>
          <span class="detail-value">{{ orderNumber }}</span>
        </div>
      </div>

      <!-- 资金结算说明 -->
      <div class="settlement-section">
        <div class="section-title">
          {{ t("orderComplete.settlementTitle") }}
        </div>
        <div class="settlement-item">
          <span class="settlement-label">{{
            t("orderComplete.depositPaid")
          }}</span>
          <span class="settlement-value">¥{{ depositAmount }}</span>
        </div>
        <div class="settlement-item">
          <span class="settlement-label">{{
            t("orderComplete.rentalFee")
          }}</span>
          <span class="settlement-value negative">-¥{{ orderAmount }}</span>
        </div>
        <div class="settlement-item total">
          <span class="settlement-label">{{
            t("orderComplete.refundAmount")
          }}</span>
          <span class="settlement-value highlight">¥{{ refundAmount }}</span>
        </div>
      </div>

      <!-- 退款提示 -->
      <div class="refund-notice">
        <van-icon name="clock-o" color="#f59e0b" size="18" />
        <span>{{ t("orderComplete.refundNotice") }}</span>
      </div>

      <!-- 回到首页按钮 -->
      <van-button
        type="primary"
        block
        round
        class="home-button"
        @click="goHome"
      >
        {{ t("orderComplete.backToHome") }}
      </van-button>

      <!-- 客服链接 -->
      <div class="customer-service">
        {{ t("orderComplete.haveQuestion") }}
        <span class="contact-link" @click="contactService">
          {{ t("orderComplete.contactService") }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { showToast } from "vant";

const { t } = useI18n();
const router = useRouter();

// 订单信息（实际使用时应该从路由参数或API获取）
const orderAmount = ref("3.00");
const orderDuration = ref("1小时30分钟");
const borrowTime = ref("01-25 14:00");
const returnTime = ref("01-25 15:30");
const orderNumber = ref("202601258892332");
const depositAmount = ref("99.00");
const refundAmount = ref("96.00");

// 回到首页
const goHome = () => {
  router.push("/");
};

// 联系客服
const contactService = () => {
  showToast(t("orderComplete.contactServiceToast"));
  // 实际应该打开客服对话或跳转到客服页面
};
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
  padding-bottom: 32px;
}

.success-section {
  text-align: center;
  padding: 40px 20px 32px;
}

.success-icon {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  box-shadow: 0 4px 16px rgba(16, 185, 129, 0.3);
}

.success-text {
  font-size: 22px;
  font-weight: 600;
  color: #333;
}

.amount-section {
  text-align: center;
  margin-bottom: 24px;
}

.amount {
  font-size: 42px;
  font-weight: 700;
  color: #333;
  margin-bottom: 8px;
}

.amount-label {
  font-size: 14px;
  color: #999;
}

.order-details {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f5f5f5;
}

.detail-item:last-child {
  border-bottom: none;
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

.settlement-section {
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

.settlement-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
}

.settlement-label {
  font-size: 15px;
  color: #666;
}

.settlement-value {
  font-size: 15px;
  color: #333;
  font-weight: 500;
}

.settlement-value.negative {
  color: #ef4444;
}

.settlement-item.total {
  padding-top: 16px;
  margin-top: 12px;
  border-top: 1px solid #f5f5f5;
}

.settlement-item.total .settlement-label {
  font-weight: 600;
  color: #333;
}

.settlement-value.highlight {
  font-size: 18px;
  font-weight: 700;
  color: #10b981;
}

.refund-notice {
  background: #fff7ed;
  border-radius: 8px;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 24px;
}

.refund-notice span {
  flex: 1;
  font-size: 13px;
  color: #f59e0b;
  line-height: 1.5;
}

.home-button {
  height: 50px;
  font-size: 17px;
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
  font-size: 14px;
  color: #999;
  padding: 8px 0;
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
