<template>
  <div class="home-container">
    <!-- 顶部 Logo -->
    <div class="header">
      <img src="@/assets/images/slogan.png" alt="Allo Charge" class="logo" />
    </div>

    <!-- Tab 切换 -->
    <van-tabs v-model:active="activeTab" @change="onTabChange" class="store-tabs">
      <van-tab :title="t('store.allStores')" name="all"></van-tab>
      <van-tab :title="t('store.rentable')" name="rentable"></van-tab>
      <van-tab :title="t('store.returnable')" name="returnable"></van-tab>
    </van-tabs>

    <!-- 门店列表 -->
    <div class="store-list">
      <van-list v-model:loading="loading" :finished="finished" :finished-text="t('common.noMore')" @load="onLoad">
        <div v-for="store in storeList" :key="store.id" class="store-item" @click="goToStoreDetail(store.id)">
          <div class="store-image">
            <img :src="store.image" :alt="store.name" />
          </div>
          <div class="store-info">
            <h3 class="store-name">{{ store.name }}</h3>
            <p class="store-address">{{ store.address }}</p>
            <div class="store-hours">
              <span>{{ t("store.businessHours") }}：</span>
              <span>{{ store.isOpen24h ? t("store.open24h") : store.businessHours }}</span>
            </div>
            <div class="store-tags">
              <span v-if="store.canRent" class="tag tag-rent">{{ t("store.available") }}</span>
              <span v-if="store.canReturn" class="tag tag-return">{{ t("store.canReturn") }}</span>
              <span v-if="store.almostFull" class="tag tag-warning">{{ t("store.almostFull") }}</span>
            </div>
          </div>
          <div class="store-distance">
            <div class="distance-text">
              {{ formatDistance(store.distance) }}
            </div>
            <van-icon name="arrow" class="arrow-icon" />
          </div>
        </div>
      </van-list>
    </div>

    <!-- 底部导航 -->
    <div class="bottom-nav">
      <div class="nav-item" :class="{ active: currentRoute === 'orders' }" @click="goToOrders">
        <van-icon name="orders-o" size="24" />
        <span>{{ t("store.orders") }}</span>
      </div>
      <div class="nav-item nav-center" @click="handleScanToRent">
        <div class="scan-button">
          <van-icon name="scan" size="28" color="#fff" />
        </div>
        <span class="scan-text">{{ t("store.scanToRent") }}</span>
      </div>
      <div class="nav-item" :class="{ active: currentRoute === 'mine' }" @click="goToMine">
        <van-icon name="user-o" size="24" />
        <span>{{ t("store.mine") }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { showToast } from "vant";
import { getStoreList } from "@/api/store";

const { t } = useI18n();
const router = useRouter();

// 状态
const activeTab = ref("returnable"); // 默认选中"可归还"
const currentRoute = ref("home"); // 当前路由标识
const storeList = ref<any[]>([]);
const loading = ref(false);
const finished = ref(false);
const page = ref(1);
const pageSize = 10;

// 模拟数据（实际应该从API获取）
const mockStores = [
  {
    id: "1",
    name: "安發中西药行(玉莲台铺)",
    address: "香港特别行政区香港特别行政区沙田区沙田沥源广场1楼102号铺",
    image: "https://via.placeholder.com/120x80",
    businessHours: "09:00-22:00",
    isOpen24h: true,
    canRent: true,
    canReturn: true,
    almostFull: false,
    distance: 25730, // 单位：米
  },
  {
    id: "2",
    name: "黄大仙新光中心251號",
    address: "香港特别行政区黄大仙区龙翔道120号",
    image: "https://via.placeholder.com/120x80",
    businessHours: "09:00-22:00",
    isOpen24h: true,
    canRent: true,
    canReturn: true,
    almostFull: false,
    distance: 4820,
  },
  {
    id: "3",
    name: "黄大仙新光中心251號",
    address: "香港特别行政区黄大仙区龙翔道120号",
    image: "https://via.placeholder.com/120x80",
    businessHours: "09:00-22:00",
    isOpen24h: true,
    canRent: true,
    canReturn: true,
    almostFull: false,
    distance: 4820,
  },
  {
    id: "4",
    name: "利豐小廚",
    address: "香港特别行政区黄大仙区",
    image: "https://via.placeholder.com/120x80",
    businessHours: "09:00-22:00",
    isOpen24h: true,
    canRent: true,
    canReturn: false,
    almostFull: true,
    distance: 4910,
  },
];

// 格式化距离
const formatDistance = (distance: number) => {
  if (distance >= 1000) {
    return (distance / 1000).toFixed(2) + "km";
  }
  return distance + "m";
};

// Tab 切换
const onTabChange = (name: string | number) => {
  storeList.value = [];
  page.value = 1;
  finished.value = false;
  onLoad();
};

// 加载数据
const onLoad = async () => {
  // if (loading.value) return;

  // loading.value = true;

  try {
    // 模拟API调用
    await new Promise((resolve) => setTimeout(resolve, 500));

    // 实际应该调用API
    // const res = await getStoreList({
    //   status: activeTab.value,
    //   page: page.value,
    //   pageSize
    // });

    // 使用模拟数据
    const newStores = mockStores.map((store) => ({
      ...store,
      id: `${store.id}_${page.value}`,
    }));

    storeList.value.push(...newStores);
    page.value++;

    // 模拟数据加载完成
    if (page.value > 2) {
      finished.value = true;
    }
  } catch (error) {
    showToast("加载失败");
  } finally {
    loading.value = false;
  }
};

// 跳转到门店详情
const goToStoreDetail = (id: string) => {
  // 找到对应的门店信息
  const store = storeList.value.find((s) => s.id === id);
  if (store) {
    // 跳转到门店详情页，传递门店信息
    router.push({
      path: `/store-detail/${id}`,
      query: {
        store: encodeURIComponent(JSON.stringify(store)),
      },
    });
  } else {
    // 如果没有找到，直接跳转（会从API获取）
    router.push(`/store-detail/${id}`);
  }
};

// 扫码租借
const handleScanToRent = () => {
  // 跳转到扫码页面
  router.push("/qr-scanner");
};

// 跳转到订单列表
const goToOrders = () => {
  router.push("/order-list");
};

// 跳转到个人中心
const goToMine = () => {
  router.push("/mine");
};

// 初始化
onMounted(() => {
  // 可以在这里获取用户位置等
});
</script>

<style scoped>
.home-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 80px;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.header {
  background: #fff;
  padding: 12px 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.logo {
  height: 36px;
  width: auto;
}

.store-tabs {
  background: #fff;
  position: sticky;
  top: 0;
  z-index: 10;
}

.store-tabs :deep(.van-tabs__nav) {
  background: #fff;
}

.store-tabs :deep(.van-tab) {
  color: #999;
  font-size: 15px;
}

.store-tabs :deep(.van-tab--active) {
  color: #333;
  font-weight: 600;
}

.store-tabs :deep(.van-tabs__line) {
  background: #10b981;
  width: 24px;
  height: 3px;
  border-radius: 2px;
}

.store-list {
  padding: 12px 16px;
}

.store-item {
  background: #fff;
  border-radius: 12px;
  padding: 12px;
  margin-bottom: 12px;
  display: flex;
  gap: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
  cursor: pointer;
}

.store-item:active {
  transform: scale(0.98);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

.store-image {
  width: 100px;
  height: 75px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
}

.store-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.store-info {
  flex: 1;
  min-width: 0;
}

.store-name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 6px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.store-address {
  font-size: 12px;
  color: #666;
  margin: 0 0 6px 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.store-hours {
  font-size: 12px;
  color: #666;
  margin-bottom: 6px;
}

.store-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.tag {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 500;
}

.tag-rent {
  background: #fff7ed;
  color: #f59e0b;
}

.tag-return {
  background: #fff7ed;
  color: #f59e0b;
}

.tag-warning {
  background: #fee2e2;
  color: #ef4444;
}

.store-distance {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: space-between;
  flex-shrink: 0;
}

.distance-text {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.arrow-icon {
  color: #ccc;
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
