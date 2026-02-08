<template>
  <div class="order-list-container">
    <!-- 顶部导航栏 -->
    <div class="header">
      <van-icon name="arrow-left" size="20" @click="router.back()" />
      <span class="title">{{ t("orderList.title") }}</span>
      <div style="width: 20px"></div>
    </div>

    <!-- 标签页 -->
    <van-tabs
      v-model:active="activeTab"
      sticky
      offset-top="56px"
      color="#10b981"
      title-active-color="#10b981"
    >
      <van-tab :title="t('orderList.renting')" name="renting">
        <div class="tab-content">
          <van-empty
            v-if="rentingOrders.length === 0"
            :description="t('orderList.noRentingOrders')"
          />
          <div v-else class="order-list">
            <div
              v-for="order in rentingOrders"
              :key="order.id"
              class="order-item"
              @click="viewOrder(order.id, 'renting')"
            >
              <!-- 订单头部 -->
              <div class="order-header">
                <div class="order-status renting">
                  <van-icon name="clock-o" />
                  {{ t("orderList.rentingStatus") }}
                </div>
                <div class="order-date">{{ order.rentalTime }}</div>
              </div>

              <!-- 订单内容 -->
              <div class="order-content">
                <div class="order-info">
                  <div class="info-item">
                    <span class="label"
                      >{{ t("orderList.rentalLocation") }}:</span
                    >
                    <span class="value">{{ order.location }}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">{{ t("orderList.usageTime") }}:</span>
                    <span class="value highlight">{{ order.duration }}</span>
                  </div>
                  <div class="info-item">
                    <span class="label"
                      >{{ t("orderList.estimatedAmount") }}:</span
                    >
                    <span class="value amount">¥{{ order.amount }}</span>
                  </div>
                </div>
              </div>

              <!-- 订单底部 -->
              <div class="order-footer">
                <van-button plain size="small" @click.stop="contactService">
                  {{ t("orderList.contactService") }}
                </van-button>
                <van-button
                  type="warning"
                  size="small"
                  @click.stop="viewReturnStores"
                >
                  {{ t("orderList.viewReturnStores") }}
                </van-button>
              </div>
            </div>
          </div>
        </div>
      </van-tab>

      <van-tab :title="t('orderList.completed')" name="completed">
        <div class="tab-content">
          <van-empty
            v-if="completedOrders.length === 0"
            :description="t('orderList.noCompletedOrders')"
          />
          <div v-else class="order-list">
            <div
              v-for="order in completedOrders"
              :key="order.id"
              class="order-item"
              @click="viewOrder(order.id, 'completed')"
            >
              <!-- 订单头部 -->
              <div class="order-header">
                <div class="order-status completed">
                  <van-icon name="checked" />
                  {{ t("orderList.completedStatus") }}
                </div>
                <div class="order-date">{{ order.returnTime }}</div>
              </div>

              <!-- 订单内容 -->
              <div class="order-content">
                <div class="order-info">
                  <div class="info-item">
                    <span class="label"
                      >{{ t("orderList.rentalLocation") }}:</span
                    >
                    <span class="value">{{ order.location }}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">{{ t("orderList.duration") }}:</span>
                    <span class="value">{{ order.duration }}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">{{ t("orderList.totalAmount") }}:</span>
                    <span class="value amount">¥{{ order.amount }}</span>
                  </div>
                </div>
              </div>

              <!-- 订单底部 -->
              <div class="order-footer">
                <van-button plain size="small" @click.stop="contactService">
                  {{ t("orderList.contactService") }}
                </van-button>
              </div>
            </div>
          </div>
        </div>
      </van-tab>
    </van-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { showToast } from "vant";

const { t } = useI18n();
const router = useRouter();

// 当前标签页
const activeTab = ref("renting");

// 进行中的订单
const rentingOrders = ref([
  {
    id: "2014997816753143864",
    rentalTime: "2026-01-24 17:45",
    location: "CHOISAN丘山咖啡（设计公社店）",
    duration: "1小时30分钟",
    amount: "0.00",
  },
]);

// 已完成的订单
const completedOrders = ref([
  {
    id: "202601258892332",
    rentalTime: "2026-01-25 14:00",
    returnTime: "2026-01-25 15:30",
    location: "CHOISAN丘山咖啡（设计公社店）",
    duration: "1小时30分钟",
    amount: "3.00",
  },
  {
    id: "202601258892331",
    rentalTime: "2026-01-24 10:00",
    returnTime: "2026-01-24 10:20",
    location: "星巴克（中心店）",
    duration: "20分钟",
    amount: "0.00",
  },
]);

// 查看订单详情
const viewOrder = (orderId: string, type: string) => {
  if (type === "renting") {
    router.push(`/renting-order?id=${orderId}`);
  } else {
    router.push(`/order-complete?id=${orderId}`);
  }
};

// 查看可归还门店
const viewReturnStores = () => {
  router.push("/");
};

// 联系客服
const contactService = () => {
  showToast(t("orderList.contactServiceToast"));
};
</script>

<style scoped>
.order-list-container {
  min-height: 100vh;
  background: #f5f5f5;
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
  z-index: 100;
}

.title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.tab-content {
  min-height: calc(100vh - 100px);
}

.order-list {
  padding: 16px;
}

.order-item {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  cursor: pointer;
  transition: transform 0.2s ease;
}

.order-item:active {
  transform: scale(0.98);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f5f5f5;
}

.order-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 15px;
  font-weight: 600;
}

.order-status.renting {
  color: #f59e0b;
}

.order-status.completed {
  color: #10b981;
}

.order-date {
  font-size: 13px;
  color: #999;
}

.order-content {
  margin-bottom: 16px;
}

.order-info {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
}

.label {
  color: #666;
}

.value {
  color: #333;
  font-weight: 500;
  text-align: right;
  flex: 1;
  margin-left: 16px;
}

.value.highlight {
  color: #f59e0b;
}

.value.amount {
  color: #333;
  font-weight: 600;
  font-size: 16px;
}

.order-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid #f5f5f5;
}

:deep(.van-tabs__nav) {
  background: #fff;
}

:deep(.van-tab) {
  font-size: 16px;
  font-weight: 500;
}

:deep(.van-empty) {
  padding: 80px 0;
}
</style>
