<template>

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
