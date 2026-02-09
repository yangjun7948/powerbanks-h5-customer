<template>
  <div class="store-detail-container">
    <!-- 顶部导航栏 -->
    <div class="header">
      <van-icon name="arrow-left" size="20" @click="router.back()" />
      <span class="title">{{ t("storeDetail.title") }}</span>
      <div style="width: 20px"></div>
    </div>

    <!-- 门店信息卡片 -->
    <div class="store-info-card" v-if="storeInfo">
      <div class="store-header">
        <h2 class="store-name">{{ storeInfo.name }}</h2>
        <div class="store-tags">
          <span v-if="storeInfo.canRent" class="tag tag-rent">{{ t("store.available") }}</span>
          <span v-if="storeInfo.canReturn" class="tag tag-return">{{ t("store.canReturn") }}</span>
          <span v-if="storeInfo.almostFull" class="tag tag-warning">{{ t("store.almostFull") }}</span>
        </div>
      </div>

      <div class="store-address-info">
        <van-icon name="location-o" color="#10b981" size="18" />
        <span class="address-text">{{ storeInfo.address }}</span>
      </div>

      <div class="store-hours-info">
        <van-icon name="clock-o" color="#10b981" size="18" />
        <span class="hours-text">
          {{ t("store.businessHours") }}：
          {{ storeInfo.isOpen24h ? t("store.open24h") : storeInfo.businessHours }}
        </span>
      </div>

      <div v-if="storeInfo.distance" class="store-distance-info">
        <van-icon name="location-o" color="#10b981" size="18" />
        <span class="distance-text"> {{ t("store.distance") }}：{{ formatDistance(storeInfo.distance) }} </span>
      </div>
    </div>

    <!-- 地图容器 -->
    <div class="map-container">
      <div id="map" ref="mapRef"></div>
      <div v-if="mapError" class="map-error">
        <van-icon name="warning-o" size="24" />
        <p>{{ mapError }}</p>
        <van-button size="small" type="primary" @click="initMap" class="retry-button">
          {{ t("common.retry") }}
        </van-button>
      </div>
      <div v-if="mapLoading" class="map-loading">
        <van-loading type="spinner" color="#10b981" />
        <p>{{ t("storeDetail.loadingMap") }}</p>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="action-buttons">
      <van-button block round type="primary" class="rent-button" @click="handleRent" :disabled="!storeInfo?.canRent">
        {{ t("storeDetail.rentNow") }}
      </van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { showToast } from "vant";
import { getStoreDetail } from "@/api/store";

const { t } = useI18n();
const router = useRouter();
const route = useRoute();

// 状态
const storeInfo = ref<any>(null);
const mapRef = ref<HTMLElement | null>(null);
const mapLoading = ref(false);
const mapError = ref("");
let map: google.maps.Map | null = null;
let marker: google.maps.Marker | null = null;

// Google Maps API Key - 请替换为您的实际 API Key
// 您可以在 .env 文件中配置：VITE_GOOGLE_MAPS_API_KEY=your_api_key
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "YOUR_GOOGLE_MAPS_API_KEY";

// 格式化距离
const formatDistance = (distance: number) => {
  if (distance >= 1000) {
    return (distance / 1000).toFixed(2) + "km";
  }
  return distance + "m";
};

// 加载 Google Maps API
const loadGoogleMapsAPI = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    // 检查是否已经加载
    if ((window as any).google && (window as any).google.maps) {
      resolve();
      return;
    }

    // 检查是否正在加载
    if (document.querySelector('script[src*="maps.googleapis.com"]')) {
      const checkInterval = setInterval(() => {
        if ((window as any).google && (window as any).google.maps) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);

      setTimeout(() => {
        clearInterval(checkInterval);
        reject(new Error("Google Maps API 加载超时"));
      }, 10000);
      return;
    }

    // 创建脚本标签
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&language=${getCurrentLanguage()}`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      if ((window as any).google && (window as any).google.maps) {
        resolve();
      } else {
        reject(new Error("Google Maps API 加载失败"));
      }
    };

    script.onerror = () => {
      reject(new Error("无法加载 Google Maps API"));
    };

    document.head.appendChild(script);
  });
};

// 获取当前语言代码（用于地图语言）
const getCurrentLanguage = () => {
  const lang = localStorage.getItem("language") || "zh-CN";
  const langMap: Record<string, string> = {
    "zh-CN": "zh-CN",
    "en-US": "en",
    "fr-FR": "fr",
  };
  return langMap[lang] || "en";
};

// 初始化地图
const initMap = async () => {
  if (!mapRef.value || !storeInfo.value) {
    return;
  }

  mapLoading.value = true;
  mapError.value = "";

  try {
    // 加载 Google Maps API
    await loadGoogleMapsAPI();

    // 解析地址获取坐标（如果地址存在但坐标不存在）
    let lat = storeInfo.value.latitude || 22.3193; // 默认香港坐标
    let lng = storeInfo.value.longitude || 114.1694;

    // 如果只有地址没有坐标，尝试地理编码
    if (!storeInfo.value.latitude && !storeInfo.value.longitude && storeInfo.value.address) {
      try {
        const googleMaps = (window as any).google?.maps;
        if (googleMaps) {
          const geocoder = new googleMaps.Geocoder();
          const result = await new Promise<any[]>((resolve, reject) => {
            geocoder.geocode({ address: storeInfo.value.address }, (results: any, status: string) => {
              if (status === "OK" && results && results.length > 0) {
                resolve(results);
              } else {
                reject(new Error("地址解析失败"));
              }
            });
          });

          if (result && result.length > 0) {
            lat = result[0].geometry.location.lat();
            lng = result[0].geometry.location.lng();
          }
        }
      } catch (error) {
        console.warn("地理编码失败，使用默认坐标", error);
      }
    }

    // 创建地图
    const googleMaps = (window as any).google?.maps;
    if (!googleMaps) {
      throw new Error("Google Maps API 未加载");
    }

    map = new googleMaps.Map(mapRef.value, {
      center: { lat, lng },
      zoom: 16,
      mapTypeControl: false,
      fullscreenControl: true,
      streetViewControl: false,
      zoomControl: true,
      styles: [
        {
          featureType: "poi",
          elementType: "labels",
          stylers: [{ visibility: "off" }],
        },
      ],
    });

    // 添加标记
    marker = new googleMaps.Marker({
      position: { lat, lng },
      map: map,
      title: storeInfo.value.name,
      icon: {
        url:
          "data:image/svg+xml;charset=UTF-8," +
          encodeURIComponent(`
          <svg width="40" height="50" viewBox="0 0 40 50" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 0C9.507 0 1 8.507 1 19c0 13.5 19 31 19 31s19-17.5 19-31C39 8.507 30.493 0 20 0z" fill="#10b981"/>
            <circle cx="20" cy="19" r="8" fill="#fff"/>
          </svg>
        `),
        scaledSize: new googleMaps.Size(40, 50),
        anchor: new googleMaps.Point(20, 50),
      },
    });

    // 添加信息窗口
    const infoWindow = new googleMaps.InfoWindow({
      content: `
        <div style="padding: 8px; min-width: 200px;">
          <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">${storeInfo.value.name}</h3>
          <p style="margin: 0; font-size: 14px; color: #666;">${storeInfo.value.address}</p>
        </div>
      `,
    });

    marker.addListener("click", () => {
      infoWindow.open(map, marker);
    });

    // 自动打开信息窗口
    infoWindow.open(map, marker);

    mapLoading.value = false;
  } catch (error: any) {
    console.error("地图初始化失败:", error);
    mapError.value = error.message || t("storeDetail.mapLoadError");
    mapLoading.value = false;
  }
};

// 获取门店详情
const fetchStoreDetail = async () => {
  const storeId = route.params.id as string;
  if (!storeId) {
    showToast(t("storeDetail.storeNotFound"));
    router.back();
    return;
  }

  try {
    // 如果路由中有门店信息（从列表页传递），直接使用
    if (route.query.store) {
      try {
        storeInfo.value = JSON.parse(decodeURIComponent(route.query.store as string));
        // 初始化地图
        await initMap();
        return;
      } catch (e) {
        console.warn("解析门店信息失败，从API获取", e);
      }
    }

    // 从API获取门店详情
    const res = await getStoreDetail(storeId);
    storeInfo.value = res;
    await initMap();
  } catch (error) {
    console.error("获取门店详情失败:", error);
    showToast(t("storeDetail.loadFailed"));
    router.back();
  }
};

// 租借处理
const handleRent = () => {
  if (!storeInfo.value?.canRent) {
    showToast(t("storeDetail.cannotRent"));
    return;
  }
  // 跳转到押金页面或扫码页面
  router.push("/qr-scanner");
};

// 组件挂载
onMounted(() => {
  fetchStoreDetail();
});

// 组件卸载时清理
onUnmounted(() => {
  if (marker) {
    marker.setMap(null);
    marker = null;
  }
  if (map) {
    map = null;
  }
});
</script>

<style scoped>
.store-detail-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 80px;
}

.header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: #fff;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.header .title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.store-info-card {
  background: #fff;
  margin: 12px 16px;
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.store-header {
  margin-bottom: 12px;
}

.store-name {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px 0;
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

.store-address-info,
.store-hours-info,
.store-distance-info {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 12px;
}

.store-address-info:last-child,
.store-hours-info:last-child,
.store-distance-info:last-child {
  margin-bottom: 0;
}

.address-text,
.hours-text,
.distance-text {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
  flex: 1;
}

.map-container {
  position: relative;
  width: 100%;
  height: 400px;
  margin: 12px 16px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  background: #e5e5e5;
}

#map {
  width: 100%;
  height: 100%;
}

.map-loading,
.map-error {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.95);
  z-index: 10;
}

.map-loading p,
.map-error p {
  margin-top: 12px;
  font-size: 14px;
  color: #666;
}

.map-error {
  color: #ef4444;
}

.retry-button {
  margin-top: 16px;
}

.action-buttons {
  padding: 16px;
  background: #fff;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);
  padding-bottom: calc(16px + env(safe-area-inset-bottom));
}

.rent-button {
  height: 48px;
  border-radius: 24px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border: none;
  font-size: 16px;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.rent-button:active {
  transform: translateY(1px);
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
}

.rent-button:disabled {
  background: #ccc;
  box-shadow: none;
}
</style>
