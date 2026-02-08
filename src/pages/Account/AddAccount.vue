<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <van-nav-bar
      title="添加账号"
      left-arrow
      @click-left="router.back()"
      fixed
      safe-area-inset-top
      class="bg-white"
    />
    <div class="p-4 mt-8 flex-1">
      <van-form @submit="onSubmit" :validate-first="true">
        <van-field
          v-model="form.nickName"
          label="昵称"
          placeholder="请输入账号昵称"
          :rules="[
            { required: true, message: '请输入账号昵称' },
            { min: 2, max: 12, message: '昵称2-12个字符' },
          ]"
        />
        <van-field
          v-model="form.mediaPlatform"
          is-link
          readonly
          label="所属平台"
          placeholder="请选择所属平台"
          :rules="[{ required: true, message: '请选择所属平台' }]"
          @click="showPlatformPicker = true"
        />
        <van-popup v-model:show="showPlatformPicker" position="bottom">
          <van-picker
            :columns="sys_media_platform"
            @confirm="onPlatformConfirm"
            @cancel="showPlatformPicker = false"
          />
        </van-popup>
        <div class="mt-8">
          <van-button round block type="primary" native-type="submit"
            >保存</van-button
          >
        </div>
      </van-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { showToast } from "vant";
import { useDict } from "@/utils/dict";
import { addCustomer, getCustomer, updateCustomer } from "@/api/customer";
const router = useRouter();
const route = useRoute();
const form = ref({
  id: 0,
  customerNo: "",
  nickName: "",
  customerName: "",
  mediaPlatform: "",
});

const showPlatformPicker = ref(false);
const { sys_media_platform } = useDict("sys_media_platform");
function goBack() {
  router.back();
}

function onPlatformConfirm({ selectedOptions }) {
  form.value.mediaPlatform = selectedOptions[0].text;
  showPlatformPicker.value = false;
}

function onSubmit() {
  form.value.customerName = form.value.nickName;
  if (form.value.id > 0) {
    updateCustomer(form.value).then((res) => {
      showToast("保存成功");
      router.back();
    });
  } else {
    addCustomer(form.value).then((res) => {
      showToast("保存成功");
      router.back();
    });
  }
}

onMounted(() => {
  const customerId = route.params.customerId;
  if (customerId && customerId != "0") {
    getCustomer(customerId).then((res) => {
      form.value = res.data;
    });
  }
});
</script>

<style scoped>
.pt-16 {
  padding-top: 64px;
}
</style>
