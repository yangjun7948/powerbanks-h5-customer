<template>
  <div class="min-h-screen flex flex-col">
    <!-- 主要内容区域 -->
    <div class="flex-1">
      <router-view></router-view>
    </div>
    <!-- 底部导航栏 -->
    <van-tabbar v-model="active" route>
      <van-tabbar-item to="/match" icon="chart-trending-o">
        比赛
      </van-tabbar-item>
      <van-tabbar-item to="/video" icon="video-o"> 视频 </van-tabbar-item>
      <van-tabbar-item to="/profile" icon="user-o"> 我的 </van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useUserStore } from "@/store/modules/user";
const userStore = useUserStore();
const active = ref(0);

onMounted(() => {});
</script>

<style scoped>
:deep(.van-tabbar--fixed) {
  position: fixed !important;
}
</style>
