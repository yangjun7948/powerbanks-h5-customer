<template>
  <van-popup v-model:show="visible" position="bottom" round safe-area-inset-bottom>
    <div class="contact-popup">
      <div class="contact-popup-title">{{ t("mine.contactSupport") }}</div>
      <div class="contact-number">
        <van-icon name="phone-o" size="16" color="#999" />
        <span>{{ SUPPORT_PHONE_DISPLAY }}</span>
      </div>
      <div class="contact-actions">
        <div class="contact-btn contact-btn--whatsapp" @click="openWhatsApp">
          <svg class="contact-btn-icon" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="16" cy="16" r="16" fill="#25D366" />
            <path d="M23.5 8.5A10.44 10.44 0 0 0 16 5.5a10.5 10.5 0 0 0-9.1 15.72L5.5 26.5l5.44-1.38A10.5 10.5 0 0 0 26.5 16a10.44 10.44 0 0 0-3-7.5zm-7.5 16.14a8.71 8.71 0 0 1-4.44-1.22l-.32-.19-3.23.82.85-3.15-.2-.33A8.75 8.75 0 1 1 16 24.64zm4.8-6.55c-.26-.13-1.55-.76-1.79-.85s-.41-.13-.59.13-.67.85-.82 1-.3.2-.57.07a7.13 7.13 0 0 1-2.1-1.3 7.85 7.85 0 0 1-1.45-1.8c-.15-.26 0-.4.11-.53s.26-.3.4-.46a1.78 1.78 0 0 0 .26-.44.49.49 0 0 0 0-.46c-.07-.13-.59-1.42-.81-1.94s-.43-.44-.59-.45h-.5a1 1 0 0 0-.7.33 2.93 2.93 0 0 0-.92 2.18 5.1 5.1 0 0 0 1.07 2.7 11.66 11.66 0 0 0 4.47 3.94c.63.27 1.12.43 1.5.55a3.6 3.6 0 0 0 1.66.1 2.69 2.69 0 0 0 1.76-1.24 2.17 2.17 0 0 0 .15-1.24c-.06-.1-.24-.17-.5-.3z" fill="#fff" />
          </svg>
          <span>{{ t("mine.openWhatsApp") }}</span>
        </div>
        <div class="contact-btn contact-btn--call" @click="callPhone">
          <van-icon name="phone-o" size="20" color="#10b981" />
          <span>{{ t("mine.callPhone") }}</span>
        </div>
      </div>
      <div class="contact-cancel" @click="visible = false">{{ t("common.cancel") }}</div>
    </div>
  </van-popup>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const props = defineProps<{ show: boolean }>();
const emit = defineEmits<{ "update:show": [value: boolean] }>();

const visible = computed({
  get: () => props.show,
  set: (val) => emit("update:show", val),
});

const SUPPORT_PHONE = "2250701478515";
const SUPPORT_PHONE_DISPLAY = "+225 07 01 47 85 15";

const openWhatsApp = () => {
  visible.value = false;
  window.open(`https://wa.me/${SUPPORT_PHONE}`, "_blank");
};

const callPhone = () => {
  visible.value = false;
  window.location.href = `tel:+${SUPPORT_PHONE}`;
};
</script>

<style scoped>
.contact-popup {
  padding: 20px 16px 12px;
}

.contact-popup-title {
  text-align: center;
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 8px;
}

.contact-number {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 14px;
  color: #999;
  margin-bottom: 20px;
}

.contact-actions {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.contact-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px 8px;
  border-radius: 12px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: opacity 0.2s;
}

.contact-btn:active {
  opacity: 0.7;
}

.contact-btn--whatsapp {
  background: #e8fdf2;
  color: #25d366;
}

.contact-btn--call {
  background: #f0fdf9;
  color: #10b981;
}

.contact-btn-icon {
  width: 32px;
  height: 32px;
  flex-shrink: 0;
}

.contact-cancel {
  text-align: center;
  padding: 14px;
  font-size: 15px;
  color: #999;
  cursor: pointer;
  border-top: 1px solid #f0f0f0;
  margin-top: 4px;
}
</style>
