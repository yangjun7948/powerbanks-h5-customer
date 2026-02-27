<template>
  <div class="min-h-screen flex flex-col login-container">
    <!-- 顶部导航栏 -->
    <div class="flex justify-between items-center px-4 py-4">
      <van-icon name="arrow-left" size="20" color="white" @click="router.back()" />
      <div class="flex items-center gap-2">
        <!-- 语言切换 -->
        <select v-model="currentLanguage" @change="changeLanguage" class="bg-transparent text-sm border border-white/30 rounded px-2 py-1">
          <option value="zh-CN">中文</option>
          <option value="en-US">English</option>
          <option value="fr-FR">Français</option>
        </select>
        <!-- <span class="">{{ t("common.help") }}</span> -->
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="flex-1 px-8 flex flex-col justify-center">
      <!-- Logo区域 -->
      <div class="flex flex-col items-center mb-8">
        <img src="@/assets/images/slogan.png" alt="Power Bank" class="logo-image mb-6" />
        <h1 class="logo-text text-3xl font-bold">{{ t("login.title") }}</h1>
        <p class="slogan text-sm mt-3">{{ t("login.slogan") }}</p>
      </div>

      <!-- 登录表单 -->
      <div class="space-y-6">
        <van-form @submit="onSubmit">
          <div class="space-y-2">
            <div class="text-gray-800 font-semibold text-base">
              {{ t("login.phoneLabel") }}
            </div>
            <div class="phone-field-wrapper custom-field">
              <div class="country-selector" @click.stop="showCountryPicker = true">
                <img :src="selectedCountry.flag" :alt="selectedCountry.name" class="country-flag" />
                <span class="country-dial">{{ selectedCountry.dialCode }}</span>
                <van-icon name="arrow-down" size="10" color="#999" />
              </div>
              <van-field v-model="phone" type="tel" :placeholder="t('login.phonePlaceholder')" name="validatePhone" :rules="[{ validator: validatePhone }]" class="phone-inner-field" :border="false" />
            </div>
          </div>

          <div class="space-y-2 mt-6">
            <div class="text-gray-800 font-semibold text-base">
              {{ t("login.codeLabel") }}
            </div>
            <van-field v-model="code" center clearable :placeholder="t('login.codePlaceholder')" :rules="[{ required: true, message: t('login.codeRequired') }]" class="custom-field" :border="false">
              <template #button>
                <div
                  class="code-button text-sm font-medium"
                  :class="{'opacity-50': countdown > 0,
                    'cursor-pointer': countdown === 0,
                    'cursor-not-allowed': countdown > 0,
                  }"
                  @click.prevent="countdown === 0 && sendCode()"
                >
                  {{ countdown > 0 ? countdown + t("login.retryAfter") : t("login.getCode") }}
                </div>
              </template>
            </van-field>
          </div>

          <div class="text-sm text-gray-500 mt-3">
            {{ t("login.autoRegisterTip") }}
          </div>

          <div class="mt-8">
            <van-button block round type="primary" native-type="submit" :loading="loading" class="login-button">
              {{ t("login.loginButton") }}
            </van-button>
          </div>
        </van-form>
      </div>
    </div>

    <!-- 国家区号选择 -->
    <van-popup v-model:show="showCountryPicker" position="bottom" round safe-area-inset-bottom>
      <div class="country-popup">
        <div class="country-popup-title">{{ t("login.selectCountry") }}</div>
        <div v-for="c in countries" :key="c.dialCode" class="country-item" :class="{ 'country-item--active': c.dialCode === selectedCountry.dialCode }" @click="onCountrySelect(c)">
          <img :src="c.flag" :alt="c.name" class="country-item-flag" />
          <span class="country-item-name">{{ c.name }}</span>
          <span class="country-item-dial">{{ c.dialCode }}</span>
          <van-icon v-if="c.dialCode === selectedCountry.dialCode" name="success" color="#10b981" size="16" />
        </div>
      </div>
    </van-popup>

    <!-- 底部协议区域 -->
    <div class="px-8 pb-8 mt-auto">
      <p class="text-center text-xs text-gray-500">
        {{ t("login.agreementPrefix") }}
        <span class="text-primary underline cursor-pointer" @click="router.push('/terms')">{{ t("login.userAgreement") }}</span>
        {{ t("login.and") }}
        <span class="text-primary underline cursor-pointer" @click="router.push('/terms')">{{ t("login.privacyPolicy") }}</span>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue"; // computed used by fullPhone
import { showToast } from "vant";
import { useRouter, useRoute } from "vue-router";
import { phoneCode } from "@/api/common";
import { useUserStore } from "@/store/modules/user";
import { ss } from "@/utils/storage/local";
import { useI18n } from "vue-i18n";
import { setLanguage, getLocalLanguage } from "@/i18n";

const { t } = useI18n();
const router = useRouter();
const route = useRoute();
const phone = ref("");
const code = ref("");

// 国家区号列表（后续可扩展）
const countries = [{ name: "Côte d'Ivoire", dialCode: "+225", flag: new URL("@/assets/country/ci.png", import.meta.url).href }];

const selectedCountry = ref(countries[0]);
const showCountryPicker = ref(false);

const onCountrySelect = (c: typeof countries[0]) => {
  selectedCountry.value = c;
  showCountryPicker.value = false;
};

// 完整手机号 = 区号 + 号码
const fullPhone = computed(() => selectedCountry.value.dialCode + phone.value);
const countdown = ref(0);
const loading = ref(false);
const userStore = useUserStore();
const currentLanguage = ref(getLocalLanguage());

// 切换语言
const changeLanguage = () => {
  setLanguage(currentLanguage.value);
};

const validatePhone = (value: string) => {
  if (!value) {
    return t("login.phoneRequired");
  }
};

// 发送验证码
const sendCode = async () => {
  if (!phone.value) {
    showToast(t("login.phoneRequired"));
    return;
  }

  if (countdown.value > 0) {
    return;
  }

  try {
    countdown.value = 60;
    await phoneCode(fullPhone.value);
    const timer = setInterval(() => {
      countdown.value--;
      if (countdown.value <= 0) {
        clearInterval(timer);
      }
    }, 1000);
    showToast(t("login.codeSent"));
  } catch (error) {
    showToast(t("login.sendCodeFailed"));
    countdown.value = 0; // 发送失败时重置倒计时
  }
};

// 提交表单
const onSubmit = async (values: any) => {
  console.log("表单提交", values);

  if (!phone.value || !code.value) {
    showToast(t("login.fillComplete"));
    return;
  }

  loading.value = true;
  try {
    await userStore.phoneLogin(fullPhone.value, code.value);
    // 登录成功后，优先跳转到 redirect 指定的地址，没有则回到首页
    const redirect = (route.query.redirect as string) || "/";
    router.replace(redirect);
  } catch (error) {
    console.error("登录失败:", error);
    showToast(t("login.loginFailed"));
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.login-container {
  background: linear-gradient(180deg, #f0f9ff 0%, #ffffff 100%);
  color: #333;
  min-height: 100vh;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.logo-image {
  width: 160px;
  height: auto;
  object-fit: contain;
  animation: fadeInDown 0.8s ease-out;
}

.logo-text {
  font-family: "PingFang SC", "Microsoft YaHei", sans-serif;
  font-size: 1.75rem;
  font-weight: 700;
  letter-spacing: 2px;
  color: #1a1a1a;
  animation: fadeInUp 0.8s ease-out;
}

.slogan {
  font-family: "PingFang SC", "Microsoft YaHei", sans-serif;
  letter-spacing: 1px;
  color: #666;
  animation: fadeInUp 0.8s ease-out 0.2s both;
}

.custom-field {
  background-color: #fff;
  border: 1px solid #e5e5e5;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.custom-field:focus-within {
  border-color: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

.phone-field-wrapper {
  display: flex;
  align-items: center;
  /* custom-field 提供 padding: 4px 16px，这里只覆盖 left，保留其余三个方向 */
  padding-left: 12px !important;
}

.phone-inner-field {
  flex: 1;
  background: transparent !important;
}

/* 覆盖 vant field 内部背景 */
.phone-inner-field :deep(.van-field__control) {
  background: transparent;
}

.country-selector {
  display: flex;
  align-items: center;
  gap: 4px;
  padding-right: 10px;
  border-right: 1px solid #e5e5e5;
  margin-right: 2px;
  cursor: pointer;
  user-select: none;
  white-space: nowrap;
  flex-shrink: 0;
}

.country-flag {
  width: 24px;
  height: 16px;
  object-fit: cover;
  border-radius: 2px;
  flex-shrink: 0;
}

.country-popup {
  padding: 0 0 16px;
}

.country-popup-title {
  text-align: center;
  font-size: 15px;
  font-weight: 600;
  color: #333;
  padding: 16px 0 8px;
  border-bottom: 1px solid #f0f0f0;
}

.country-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 20px;
  cursor: pointer;
  transition: background 0.15s;
}

.country-item:active,
.country-item--active {
  background-color: #f6fdf9;
}

.country-item-flag {
  width: 28px;
  height: 20px;
  object-fit: cover;
  border-radius: 3px;
  flex-shrink: 0;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.08);
}

.country-item-name {
  flex: 1;
  font-size: 15px;
  color: #333;
}

.country-item-dial {
  font-size: 14px;
  color: #999;
  margin-right: 4px;
}

.country-dial {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.code-button {
  color: #10b981;
  font-weight: 500;
  padding: 0 12px;
  white-space: nowrap;
}

.login-button {
  height: 48px;
  border-radius: 24px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border: none;
  font-size: 16px;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
  transition: all 0.3s ease;
}

.login-button:active {
  transform: translateY(1px);
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
}

.text-primary {
  color: #10b981;
  font-weight: 500;
}

select {
  outline: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

select:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

select option {
  background-color: #fff;
  color: #333;
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
