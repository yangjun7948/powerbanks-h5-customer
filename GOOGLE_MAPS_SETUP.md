# Google Maps 集成说明

## 配置 Google Maps API Key

门店详情页面已集成 Google Maps，需要配置 API Key 才能正常使用。

### 1. 获取 Google Maps API Key

1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 创建新项目或选择现有项目
3. 启用以下 API：
   - Maps JavaScript API
   - Geocoding API（用于地址解析）
4. 创建 API Key：
   - 转到"凭据"页面
   - 点击"创建凭据" > "API 密钥"
   - 复制生成的 API Key

### 2. 配置 API Key

#### 方式一：使用环境变量（推荐）

在项目根目录创建 `.env` 文件（如果不存在）：

```env
VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
```

#### 方式二：直接修改代码

在 `src/pages/StoreDetail.vue` 文件中，找到以下代码并替换：

```typescript
const GOOGLE_MAPS_API_KEY =
  import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "YOUR_GOOGLE_MAPS_API_KEY";
```

将 `"YOUR_GOOGLE_MAPS_API_KEY"` 替换为您的实际 API Key。

### 3. 设置 API Key 限制（可选但推荐）

为了安全，建议在 Google Cloud Console 中设置 API Key 限制：

1. 转到"凭据"页面
2. 点击您的 API Key
3. 在"应用程序限制"中选择"HTTP 引荐来源网址（网站）"
4. 添加您的网站域名（例如：`https://yourdomain.com/*`）
5. 在"API 限制"中选择"限制密钥"
6. 仅选择需要的 API（Maps JavaScript API 和 Geocoding API）

### 4. 测试

配置完成后，启动开发服务器：

```bash
npm run dev
```

点击门店列表中的任意门店，应该能看到：
- 门店详情信息
- Google Maps 地图显示门店位置
- 地图标记和信息窗口

### 注意事项

1. **免费配额**：Google Maps API 有免费配额限制，超出后会产生费用。请查看 [Google Maps 定价](https://developers.google.com/maps/billing-and-pricing/pricing)
2. **HTTPS**：生产环境建议使用 HTTPS，某些浏览器功能需要安全连接
3. **API Key 安全**：不要将 API Key 提交到公共代码仓库，使用环境变量管理

### 故障排除

如果地图无法加载：

1. 检查浏览器控制台是否有错误信息
2. 确认 API Key 是否正确配置
3. 确认已启用必要的 API（Maps JavaScript API、Geocoding API）
4. 检查 API Key 的限制设置是否允许当前域名
5. 查看 Google Cloud Console 中的 API 使用情况

