<template>
  <div class="order-list-container">
    <!-- 顶部导航栏 -->
    <div class="header">
      <van-icon name="arrow-left" size="20" @click="router.back()" />
      <span class="title">{{ t("orderList.title") }}</span>
      <div style="width: 20px"></div>
    </div>

    <!-- 标签页 -->
    <van-tabs v-model:active="activeTab" sticky offset-top="56px" color="#10b981" title-active-color="#10b981">
      <van-tab :title="t('orderList.renting')" name="renting">
        <div class="tab-content">
          <van-list v-model:loading="rentingLoading" :finished="rentingFinished" :finished-text="t('common.noMore')" @load="onRentingLoad">
            <van-empty v-if="!rentingLoading && rentingOrders.length === 0" :description="t('orderList.noRentingOrders')" />
            <div v-else class="order-list">
              <div v-for="order in rentingOrders" :key="order.id" class="order-item" @click="viewOrder(order.id, 'renting')">
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
                      <span class="label">{{ t("orderList.rentalLocation") }}:</span>
                      <span class="value">{{ order.location }}</span>
                    </div>
                    <div class="info-item">
                      <span class="label">{{ t("orderList.usageTime") }}:</span>
                      <span class="value highlight">{{ order.duration }}</span>
                    </div>
                    <div class="info-item">
                      <span class="label">{{ t("orderList.estimatedAmount") }}:</span>
                      <span class="value amount">¥{{ order.amount }}</span>
                    </div>
                  </div>
                </div>

                <!-- 订单底部 -->
                <div class="order-footer">
                  <van-button plain size="small" @click.stop="contactService">
                    {{ t("orderList.contactService") }}
                  </van-button>
                  <van-button type="warning" size="small" @click.stop="viewReturnStores">
                    {{ t("orderList.viewReturnStores") }}
                  </van-button>
                </div>
              </div>
            </div>
          </van-list>
        </div>
      </van-tab>

      <van-tab :title="t('orderList.completed')" name="completed">
        <div class="tab-content">
          <van-list v-model:loading="completedLoading" :finished="completedFinished" :finished-text="t('common.noMore')" @load="onCompletedLoad">
            <van-empty v-if="!completedLoading && completedOrders.length === 0" :description="t('orderList.noCompletedOrders')" />
            <div v-else class="order-list">
              <div v-for="order in completedOrders" :key="order.id" class="order-item" @click="viewOrder(order.id, 'completed')">
                <!-- 订单头部 -->
                <div class="order-header">
                  <div class="order-status completed">
                    <van-icon name="checked" />
                    {{ t("orderList.completedStatus") }}
                    <span v-if="order.paymentStatus === 0" class="payment-status unpaid">
                      ({{ t("orderList.unpaid") }})
                    </span>
                    <span v-else class="payment-status paid">
                      ({{ t("orderList.paid") }})
                    </span>
                  </div>
                  <div class="order-date">{{ order.returnTime }}</div>
                </div>

                <!-- 订单内容 -->
                <div class="order-content">
                  <div class="order-info">
                    <div class="info-item">
                      <span class="label">{{ t("orderList.rentalLocation") }}:</span>
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
                  <van-button 
                    v-if="order.paymentStatus === 0" 
                    type="primary" 
                    size="small" 
                    @click.stop="handlePay(order)"
                    :loading="order.paying"
                  >
                    {{ t("orderList.payNow") }}
                  </van-button>
                </div>
              </div>
            </div>
          </van-list>
        </div>
      </van-tab>
    </van-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { showToast, showDialog } from "vant";
import { getOrderList, payOrder } from "@/api/order";
import { useUserStore } from "@/store/modules/user";

const userStore = useUserStore();
const { t } = useI18n();
const router = useRouter();

// 当前标签页
const activeTab = ref("renting");

// 进行中的订单
const rentingOrders = ref<any[]>([]);

// 已完成的订单
const completedOrders = ref<any[]>([]);

// 加载状态
const rentingLoading = ref(false);
const completedLoading = ref(false);

// 分页状态
const rentingPage = ref(1);
const completedPage = ref(1);
const pageSize = 10;
const rentingFinished = ref(false);
const completedFinished = ref(false);

// 格式化日期时间
const formatDateTime = (dateTime: string | Date) => {
  if (!dateTime) return "-";
  const date = typeof dateTime === "string" ? new Date(dateTime) : dateTime;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

// 格式化时长
const formatDuration = (startTime: string | Date, endTime?: string | Date) => {
  if (!startTime) return "-";
  const start = typeof startTime === "string" ? new Date(startTime) : startTime;
  const end = endTime ? (typeof endTime === "string" ? new Date(endTime) : endTime) : new Date();
  const diff = end.getTime() - start.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) {
    return `${hours}小时${minutes}分钟`;
  }
  return `${minutes}分钟`;
};

// 格式化金额
const formatAmount = (amount: number | string) => {
  if (amount === null || amount === undefined) return "0.00";
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return num.toFixed(2);
};

// 获取订单列表（分页）
const fetchOrders = async (status: string, page: number) => {
  if (!userStore.userInfo?.userId) {
    showToast(t("orderList.loginRequired"));
    return;
  }

  const isLoading = status === "renting" ? rentingLoading : completedLoading;
  const isFinished = status === "renting" ? rentingFinished : completedFinished;
  const orderList = status === "renting" ? rentingOrders : completedOrders;

  // 如果已经加载完成，不再请求
  if (isFinished.value) {
    return;
  }

  isLoading.value = true;

  try {
    const res: any = await getOrderList({
      status: status === "renting" ? "1" : "2",
      page: page,
      pageSize: pageSize,
    });

    // 处理返回数据
    const data = res?.data || res;
    const orders = data?.rows || data?.list || data || [];

    // 格式化订单数据
    const formattedOrders = orders.map((order: any) => ({
      id: order.orderId || order.id || "",
      rentalTime: formatDateTime(order.startTime),
      returnTime: order.endTime ? formatDateTime(order.endTime) : "",
      location: order.borrowStoreAddress || "-",
      duration: formatDuration(order.startTime || order.createTime, order.returnTime),
      amount: formatAmount(order.amount || order.totalAmount || 0),
      storeId: order.borrowStoreId || "",
      paymentStatus: order.paymentStatus ?? 1, // 0: 待支付, 1: 已支付
      paymentStatusText: order.paymentStatusText || "",
      paying: false, // 支付中状态
    }));

    // 追加到列表
    orderList.value.push(...formattedOrders);

    // 判断是否加载完成
    if (orders.length < pageSize) {
      isFinished.value = true;
    }
  } catch (error: any) {
    console.error("获取订单列表失败:", error);
    showToast(error?.message || t("orderList.loadFailed"));
    isFinished.value = true; // 出错时也标记为完成，避免无限重试
  } finally {
    isLoading.value = false;
  }
};

// 租借中订单加载
const onRentingLoad = () => {
  fetchOrders("renting", rentingPage.value).then(() => {
    rentingPage.value++;
  });
};

// 已完成订单加载
const onCompletedLoad = () => {
  fetchOrders("completed", completedPage.value).then(() => {
    completedPage.value++;
  });
};

// 监听标签页切换
watch(activeTab, (newTab) => {
  // 切换标签页时，如果数据为空且未完成加载，则触发加载
  if (newTab === "renting" && rentingOrders.value.length === 0 && !rentingFinished.value) {
    rentingPage.value = 1;
    rentingFinished.value = false;
    onRentingLoad();
  } else if (newTab === "completed" && completedOrders.value.length === 0 && !completedFinished.value) {
    completedPage.value = 1;
    completedFinished.value = false;
    onCompletedLoad();
  }
});

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

// 支付订单
const handlePay = async (order: any) => {
  if (order.paying) {
    return; // 防止重复点击
  }

  // 确认支付对话框
  try {  
    // 用户确认支付
    order.paying = true;
    
    try {
      // 调用支付接口（这里使用默认支付方式，实际应该让用户选择）
      const res: any = await payOrder(order.id, "wechat"); // 默认使用微信支付，实际应该让用户选择
      
      const paymentData = res?.data || res;
      const paymentUrl = paymentData?.paymentUrl;
      
      if (paymentUrl) {
        // 跳转到支付页面
        window.location.href = paymentUrl;
      } else {
        // 如果没有 paymentUrl，可能是直接支付成功
        showToast(t("orderList.paySuccess"));
        // 刷新订单列表
        refreshOrder(order);
      }
    } catch (error: any) {
      console.error("支付失败:", error);
      showToast(error?.message || t("orderList.payFailed"));
      order.paying = false;
    }
  } catch {
    // 用户取消支付
    // 不需要做任何处理
  }
};

// 刷新订单（支付成功后）
const refreshOrder = (order: any) => {
  // 更新订单的支付状态
  order.paymentStatus = 1;
  order.paymentStatusText = t("orderList.paid");
  order.paying = false;
  
  // 或者重新加载订单列表
  // completedPage.value = 1;
  // completedFinished.value = false;
  // completedOrders.value = [];
  // onCompletedLoad();
};

// 页面加载时获取订单列表
onMounted(() => {
  // 初始化时加载当前标签页的数据
  if (activeTab.value === "renting") {
    rentingPage.value = 1;
    rentingFinished.value = false;
    rentingOrders.value = [];
    onRentingLoad();
  } else {
    completedPage.value = 1;
    completedFinished.value = false;
    completedOrders.value = [];
    onCompletedLoad();
  }
});
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

.payment-status {
  font-size: 12px;
  font-weight: 400;
  margin-left: 4px;
}

.payment-status.unpaid {
  color: #ef4444;
}

.payment-status.paid {
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
