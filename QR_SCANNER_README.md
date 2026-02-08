# H5 扫码功能使用说明

## 功能概述

已成功实现 H5 扫码租借功能，使用 `vue3-qr-reader` 库实现摄像头扫码。

## 新增文件

### 1. QRScanner.vue (`src/pages/QRScanner.vue`)

扫码页面，包含以下功能：

- 📷 调用手机摄像头
- 🎯 实时扫描二维码
- 🔄 前后摄像头切换
- ⌨️ 手动输入设备编号
- ⚠️ 完善的错误处理

## 核心功能

### 1. 摄像头调用

```javascript
import { QrcodeStream } from "vue3-qr-reader";

// 摄像头约束配置
const constraints = ref({
  facingMode: "environment", // environment=后置, user=前置
  width: { ideal: 1920 },
  height: { ideal: 1080 },
});
```

### 2. 扫码检测

```javascript
// 检测到二维码时触发
const onDetect = (detectedCodes: any[]) => {
  if (detectedCodes && detectedCodes.length > 0) {
    const qrCode = detectedCodes[0].rawValue;
    handleScanResult(qrCode);
  }
};
```

### 3. 错误处理

自动识别并处理以下错误：

- `NotAllowedError`: 用户拒绝摄像头权限
- `NotFoundError`: 未找到摄像头设备
- `NotReadableError`: 摄像头被其他应用占用
- 其他错误: 通用错误提示

## 使用流程

### 用户操作流程

1. 点击首页底部"扫码租借"按钮
2. 浏览器请求摄像头权限（首次使用）
3. 允许权限后，摄像头自动启动
4. 将二维码放入扫描框内
5. 自动识别并跳转到押金页面

### 页面跳转

```
首页 (/)
  → 点击"扫码租借"
  → 扫码页面 (/qr-scanner)
  → 扫码成功
  → 押金页面 (/deposit?qrCode=xxx)
```

## UI 设计

### 扫描界面元素

- **顶部导航栏**: 黑色半透明背景，包含关闭按钮和标题
- **扫描框**: 280x280px 白色边框，四角绿色标识
- **扫描线**: 绿色渐变线条，上下循环移动
- **遮罩层**: 扫描框外部半透明黑色遮罩
- **底部工具栏**: 切换摄像头、手动输入按钮

### 视觉效果

```css
/* 扫描动画 */
@keyframes scan {
  0% { top: 0; }
  50% { top: calc(100% - 3px); }
  100% { top: 0; }
}

/* 绿色主题 */
- 扫描框四角: #10b981
- 扫描线: #10b981 渐变
- 按钮颜色: #10b981
```

## 摄像头权限处理

### HTTPS 要求

⚠️ **重要**: 摄像头 API 只能在以下环境使用：

- `https://` 协议的网站
- `localhost` 本地开发环境
- `127.0.0.1` 本地开发环境

### 权限请求流程

1. 首次访问扫码页面时，浏览器自动弹出权限请求
2. 用户点击"允许"后，摄像头启动
3. 如果拒绝，显示错误提示并返回

### 权限错误提示

| 错误类型         | 中文提示             | 英文提示                 |
| ---------------- | -------------------- | ------------------------ |
| NotAllowedError  | 未获得摄像头权限     | Camera permission denied |
| NotFoundError    | 未检测到摄像头设备   | No camera device found   |
| NotReadableError | 摄像头被其他应用占用 | Camera is being used     |

## 高级功能

### 1. 切换摄像头

```javascript
const switchCamera = () => {
  // 在前后摄像头之间切换
  currentCamera.value =
    currentCamera.value === "environment" ? "user" : "environment";
};
```

### 2. 手动输入

当扫码失败或二维码不清晰时，用户可以：

- 点击"手动输入"按钮
- 输入设备编号
- 手动提交（待完善）

### 3. 多摄像头检测

```javascript
// 自动检测设备是否有多个摄像头
const devices = await navigator.mediaDevices.enumerateDevices();
const videoDevices = devices.filter((device) => device.kind === "videoinput");
hasMultipleCameras.value = videoDevices.length > 1;
```

## 浏览器兼容性

### 支持的浏览器

- ✅ Chrome 53+
- ✅ Firefox 36+
- ✅ Safari 11+
- ✅ Edge 79+
- ✅ iOS Safari 11+
- ✅ Android Chrome 53+

### 不支持的浏览器

- ❌ IE 11 及更早版本
- ❌ 旧版 Android 浏览器

## 测试建议

### 本地测试

```bash
# 启动开发服务器
npm run dev

# 访问 http://localhost:xxxx
# 摄像头 API 在 localhost 上可以正常工作
```

### 手机测试

1. **方法一**: 使用内网穿透工具（如 ngrok）生成 HTTPS 地址
2. **方法二**: 部署到测试服务器（必须是 HTTPS）
3. **方法三**: 使用微信开发者工具（自带 HTTPS）

### 测试二维码

可以使用以下网站生成测试二维码：

- https://www.qrcode-monkey.com/
- https://cli.im/
- 或使用设备编号直接生成

## 后续优化建议

### 1. 性能优化

- [ ] 添加二维码识别缓存，避免重复识别
- [ ] 优化摄像头分辨率，提升识别速度
- [ ] 添加震动反馈（扫码成功时）

### 2. 功能增强

- [ ] 实现手动输入设备编号功能
- [ ] 添加扫描历史记录
- [ ] 支持相册选择二维码图片
- [ ] 添加手电筒开关（暗光环境）

### 3. 用户体验

- [ ] 添加首次使用引导
- [ ] 优化错误提示文案
- [ ] 添加扫码成功音效
- [ ] 支持连续扫码

### 4. 安全性

- [ ] 验证二维码格式
- [ ] 添加二维码来源校验
- [ ] 防止恶意二维码攻击

## 国际化支持

已添加三语言支持：

- 🇨🇳 中文 (zh-CN)
- 🇬🇧 英文 (en-US)
- 🇫🇷 法文 (fr-FR)

所有提示信息、按钮文字、错误信息均支持多语言切换。

## 故障排查

### 问题 1: 摄像头无法启动

**可能原因**:

- 未使用 HTTPS 协议
- 用户拒绝了权限
- 摄像头被其他应用占用

**解决方案**:

1. 确保使用 HTTPS 或 localhost
2. 引导用户在浏览器设置中允许摄像头权限
3. 关闭其他使用摄像头的应用

### 问题 2: 无法识别二维码

**可能原因**:

- 光线不足
- 二维码模糊或损坏
- 二维码太小或太大

**解决方案**:

1. 调整光线环境
2. 清理摄像头镜头
3. 调整手机与二维码的距离
4. 使用手动输入功能

### 问题 3: 在某些手机上无法工作

**可能原因**:

- 浏览器版本过低
- 系统限制摄像头权限

**解决方案**:

1. 更新浏览器到最新版本
2. 在系统设置中允许浏览器访问摄像头
3. 尝试使用其他浏览器（Chrome、Safari）

## 相关文件

```
src/
├── pages/
│   ├── QRScanner.vue        # 扫码页面（新增）
│   └── Home.vue             # 首页（已修改）
├── router/
│   └── index.ts             # 路由配置（已修改）
└── i18n/
    └── languages/
        ├── zh-CN.ts         # 中文翻译（已修改）
        ├── en-US.ts         # 英文翻译（已修改）
        └── fr-FR.ts         # 法文翻译（已修改）
```

## 总结

✅ 已完成功能：

- 完整的扫码页面
- 摄像头调用与控制
- 二维码实时识别
- 前后摄像头切换
- 完善的错误处理
- 三语言支持
- 响应式设计

🎯 核心特点：

- 使用现有的 `vue3-qr-reader` 库，无需额外安装
- 精美的 UI 设计，与整体风格一致
- 完善的错误提示和权限处理
- 支持多种使用场景

📱 用户友好：

- 操作简单，一键启动
- 自动识别，无需手动拍照
- 清晰的视觉引导
- 友好的错误提示
