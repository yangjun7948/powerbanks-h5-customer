# 支付图标使用说明

## 当前配置

押金页面现在使用本地图标，通过 ES6 模块导入方式引入。

### 文件位置

```
src/assets/pay/
└── wave.webp          # Wave 支付图标
```

### 代码实现

```typescript
import waveIcon from "@/assets/pay/wave.webp";

const paymentMethods = ref([
  {
    id: "wave",
    name: "Wave",
    icon: waveIcon,
  },
  // ... 其他支付方式
]);
```

## 添加新的支付图标

### 步骤 1：添加图标文件

将新的支付图标放到 `src/assets/pay/` 目录下：

```
src/assets/pay/
├── wave.webp
├── momo.webp       # 新增
├── orange.webp     # 新增
└── moov.webp       # 新增
```

### 步骤 2：导入图标

在 `Deposit.vue` 的 `<script>` 部分导入：

```typescript
import waveIcon from "@/assets/pay/wave.webp";
import momoIcon from "@/assets/pay/momo.webp";
import orangeIcon from "@/assets/pay/orange.webp";
import moovIcon from "@/assets/pay/moov.webp";
```

### 步骤 3：使用图标

```typescript
const paymentMethods = ref([
  {
    id: "wave",
    name: "Wave",
    icon: waveIcon,
  },
  {
    id: "momo",
    name: "MoMo",
    icon: momoIcon,
  },
  {
    id: "orange",
    name: "Orange Money",
    icon: orangeIcon,
  },
  {
    id: "moov",
    name: "Moov Africa",
    icon: moovIcon,
  },
]);
```

## 图标规格建议

### 推荐尺寸

- **最小尺寸**: 120px × 50px
- **推荐尺寸**: 240px × 100px (2x)
- **格式**: WebP, PNG, SVG

### 设计建议

1. **背景**: 透明背景或纯色背景
2. **Logo**: 居中显示，留白适当
3. **颜色**: 使用品牌标准色
4. **格式**: 优先使用 WebP (体积小，质量好)

## 完整示例

```vue
<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { showToast, showDialog } from "vant";

// 导入所有支付图标
import waveIcon from "@/assets/pay/wave.webp";
import momoIcon from "@/assets/pay/momo.webp";
import orangeIcon from "@/assets/pay/orange.webp";
import moovIcon from "@/assets/pay/moov.webp";

const { t } = useI18n();
const router = useRouter();

// 支付方式配置
const paymentMethods = ref([
  {
    id: "wave",
    name: "Wave",
    icon: waveIcon,
  },
  {
    id: "momo",
    name: "MoMo",
    icon: momoIcon,
  },
  {
    id: "orange",
    name: "Orange Money",
    icon: orangeIcon,
  },
  {
    id: "moov",
    name: "Moov Africa",
    icon: moovIcon,
  },
]);
</script>
```

## 优势

使用本地图标的优势：

1. ✅ **加载速度快** - 无需网络请求
2. ✅ **离线可用** - 不依赖外部服务
3. ✅ **类型安全** - TypeScript 支持
4. ✅ **构建优化** - Vite 自动优化图片
5. ✅ **版本控制** - 图标文件纳入 Git 管理

## 注意事项

1. **文件大小**: 建议单个图标文件不超过 50KB
2. **命名规范**: 使用小写字母和连字符，如 `wave.webp`, `orange-money.webp`
3. **图片优化**: 上传前使用工具压缩图片（如 TinyPNG, Squoosh）
4. **浏览器兼容**: WebP 在现代浏览器都支持，可以提供 PNG 降级

## 在线图片转换工具

- **TinyPNG**: https://tinypng.com/ (PNG/JPG 压缩)
- **Squoosh**: https://squoosh.app/ (图片格式转换和压缩)
- **CloudConvert**: https://cloudconvert.com/ (格式转换)

---

现在您可以随时添加新的支付图标，只需要三步：上传图片 → 导入 → 使用！
