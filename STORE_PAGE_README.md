# 门店列表页面 (Store List Page)

## 功能特性

### 1. 页面布局

- **顶部 Logo 区域**：显示 Allo Charge 品牌标识
- **Tab 切换**：
  - 全部门店
  - 可租借（有充电宝可以租借的门店）
  - 可归还（可以归还充电宝的门店）
- **门店列表**：
  - 门店缩略图
  - 门店名称
  - 详细地址
  - 营业时间
  - 状态标签（可租借/可归还/即将遣满）
  - 距离显示
- **底部导航**：
  - 订单
  - 扫码租借（中间的黄色大按钮）
  - 我的

### 2. 交互功能

- ✅ 下拉刷新
- ✅ 上拉加载更多
- ✅ 点击门店卡片查看详情
- ✅ Tab 切换筛选门店
- ✅ 扫码租借功能（待实现）
- ✅ 多语言支持（中文/英语/法语）

### 3. 设计特点

- 🎨 清新的配色方案（绿色为主色调）
- 🎨 圆角卡片设计
- 🎨 黄色醒目的扫码按钮
- 🎨 响应式交互动画
- 🎨 适配移动端安全区域

## 文件说明

### 新增文件

```
src/
├── pages/
│   └── Home.vue                 # 门店列表主页面
├── api/
│   └── store.ts                 # 门店相关 API
└── i18n/
    └── languages/
        ├── zh-CN.ts             # 中文翻译（已更新）
        ├── en-US.ts             # 英文翻译（已更新）
        └── fr-FR.ts             # 法语翻译（已更新）
```

## 使用说明

### 1. 接入真实 API

目前使用模拟数据，需要在 `Home.vue` 的 `onLoad` 方法中替换为真实 API：

```typescript
// 取消注释以下代码
const res = await getStoreList({
  status: activeTab.value,
  page: page.value,
  pageSize,
});

// 并删除模拟数据部分
```

### 2. 门店数据结构

```typescript
interface Store {
  id: string;
  name: string; // 门店名称
  address: string; // 详细地址
  image: string; // 门店图片 URL
  businessHours: string; // 营业时间 "09:00-22:00"
  isOpen24h: boolean; // 是否24小时营业
  canRent: boolean; // 是否可租借
  canReturn: boolean; // 是否可归还
  almostFull: boolean; // 是否即将遣满
  distance: number; // 距离（米）
}
```

### 3. API 端点配置

在 `src/api/store.ts` 中配置了以下端点：

- `GET /store/list` - 获取门店列表
- `GET /store/:id` - 获取门店详情

### 4. 添加门店详情页

您可以创建 `src/pages/StoreDetail.vue` 用于显示门店详情。

### 5. 实现扫码功能

在 `handleScanToRent` 方法中集成扫码功能：

```typescript
const handleScanToRent = async () => {
  // 调用扫码插件或原生能力
  // 例如使用 vant 的扫码组件或浏览器 API
};
```

## 样式调整

### 主色调

- 主色：`#10b981` (绿色 - 充电主题)
- 辅色：`#fbbf24` (黄色 - 扫码按钮)
- 标签：`#f59e0b` (橙色 - 可租借/可归还标签)

### 自定义样式

可以在 `<style scoped>` 中修改：

- `.scan-button` - 扫码按钮样式
- `.store-item` - 门店卡片样式
- `.tag-*` - 标签样式

## 待实现功能

1. ⏳ 获取用户地理位置
2. ⏳ 根据位置排序门店
3. ⏳ 地图视图切换
4. ⏳ 门店收藏功能
5. ⏳ 门店搜索功能
6. ⏳ 扫码租借集成

## 运行项目

```bash
# 开发模式
npm run dev

# 构建生产版本
npm run build
```

## 预览

访问 `http://localhost:3003/` 即可看到门店列表页面。

---

**注意**：此页面已完全国际化，支持根据浏览器语言自动切换。
