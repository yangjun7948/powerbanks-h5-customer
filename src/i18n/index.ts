import dayjs from "dayjs";
import "dayjs/locale/zh-cn";
import "dayjs/locale/en";
import "dayjs/locale/fr";
import { createI18n } from "vue-i18n";
import { Locale } from "vant";

/**
 * 获取浏览器语言并映射到支持的语言
 */
function getBrowserLanguage(): string {
  const browserLang = navigator.language || (navigator as any).userLanguage;

  // 映射浏览器语言到我们支持的语言
  if (browserLang.startsWith("zh")) {
    return "zh-CN";
  } else if (browserLang.startsWith("fr")) {
    return "fr-FR";
  } else if (browserLang.startsWith("en")) {
    return "en-US";
  }

  // 默认返回中文
  return "zh-CN";
}

export function getLocalLanguage() {
  // 优先使用用户手动设置的语言，否则使用浏览器语言
  const savedLang = localStorage.getItem("IMI18n");
  if (savedLang) {
    return savedLang;
  }

  // 获取浏览器语言并保存
  const browserLang = getBrowserLanguage();
  localStorage.setItem("IMI18n", browserLang);
  return browserLang;
}

export function loadLanguages() {
  const context = import.meta.glob("./languages/*.ts", { eager: true });

  const languages: any = {};

  let langs = Object.keys(context);
  for (let key of langs) {
    if (key === "./index.ts") return;
    let lang = (context[key] as any).lang;
    let name = key.replace(/(\.\/languages\/|\.ts)/g, "");
    languages[name] = lang;
  }

  return languages;
}

export function i18nt(key: string) {
  // @ts-ignore
  return i18n.global.t(key);
}

export const i18n = createI18n({
  legacy: false,
  locale: getLocalLanguage(),
  fallbackLocale: "zh-CN",
  messages: loadLanguages(),
});

export function t(key: string, params = {}) {
  return i18n.global.t(key, params);
}

/**
 * 将 i18n locale 转换为 dayjs locale
 */
function getDayjsLocale(locale: string): string {
  const localeMap: Record<string, string> = {
    "zh-CN": "zh-cn",
    "en-US": "en",
    "fr-FR": "fr",
  };
  return localeMap[locale] || "zh-cn";
}

// 初始化 dayjs 语言
const initLocale = getLocalLanguage();
dayjs.locale(getDayjsLocale(initLocale));

export function setLanguage(locale: string) {
  localStorage.setItem("IMI18n", locale);
  i18n.global.locale.value = locale;
  // dayjs 的 locale 格式需要转换
  dayjs.locale(getDayjsLocale(locale));
}
