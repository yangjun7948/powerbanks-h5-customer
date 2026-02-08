# 押金缴纳页面 (Deposit Payment Page)

## 页面预览

根据 UI 图实现的押金缴纳页面，包含以下元素：

### 页面结构

1. **顶部导航栏**

   - 返回按钮
   - 页面标题"缴纳押金"

2. **门店信息卡片**

   - 门店名称和地址（带绿色定位图标）
   - 充电宝特性说明："双线设计，适配全部机型"
   - 价格说明卡片（绿色背景）：
     - 标题：100 FCFA/30 分钟（5 分钟内归还免费）
     - 详细说明

3. **支付方式选择**

   - 四种支付方式（2x2 网格布局）：
     - QQ（企鹅图标）- 默认选中
     - MoMo（黄色）
     - Orange Money（橙色）
     - Moov Africa（蓝色）
   - 深色背景卡片
   - 选中状态显示绿色边框和对号

4. **押金信息**

   - 深色背景卡片
   - 押金金额：5,000 FCFA
   - 可随时退还说明

5. **支付按钮**

   - 绿色渐变大按钮
   - "支付押金"

6. **退款说明**
   - 灰色文字
   - "充电宝归还后可在个人中心-我的钱包中点击提现退还"

## 设计特点

### 配色方案

- **主色调**：绿色 (#10b981) - 与整体风格统一
- **深色背景**：深蓝色 (#1a1f3a) - 支付方式和押金信息区域
- **强调色**：绿色渐变按钮
- **状态色**：绿色边框（选中状态）

### 交互效果

- ✅ 支付方式点击选择
- ✅ 选中状态带对号标识
- ✅ 按钮按下动画
- ✅ 加载状态显示
- ✅ 支付成功弹窗

### 响应式设计

- 支持各种移动设备
- 网格布局自适应

## 文件说明

### 新增文件

```
src/
├── pages/
│   └── Deposit.vue              # 押金缴纳页面
├── api/
│   └── deposit.ts               # 押金相关 API
└── router/
    └── index.ts                 # 已添加路由配置
```

### 多语言支持

已添加三种语言的翻译：

- 中文 (zh-CN)
- 英文 (en-US)
- 法语 (fr-FR)

## 使用方法

### 1. 访问页面

从门店列表点击任意门店卡片即可跳转到押金页面：

```
http://localhost:3003/deposit
```

### 2. 接入真实 API

在 `Deposit.vue` 的 `handlePay` 方法中：

```typescript
// 取消注释以下代码
const res = await payDeposit({
  storeId: storeInfo.value.id,
  amount: depositAmount.value,
  paymentMethod: selectedPayment.value,
});
```

### 3. 数据结构

#### 门店信息

```typescript
interface StoreInfo {
  id: string;
  name: string;
  address: string;
}
```

#### 支付方式

```typescript
interface PaymentMethod {
  id: string; // 'wechat' | 'momo' | 'orange' | 'moov'
  name: string; // 显示名称
  icon: string; // 图标 URL
}
```

### 4. API 端点

在 `src/api/deposit.ts` 中配置了以下端点：

- `POST /payment/deposit` - 支付押金
- `POST /payment/refund` - 退还押金
- `GET /payment/deposit/status` - 查询押金状态

## 功能特性

### 已实现

- ✅ 门店信息展示
- ✅ 价格规则说明
- ✅ 多支付方式选择
- ✅ 押金金额显示
- ✅ 支付确认流程
- ✅ 成功/失败提示
- ✅ 多语言支持
- ✅ 返回导航

### 待实现

- ⏳ 从门店详情页传递参数
- ⏳ 真实支付接口集成
- ⏳ 支付状态轮询
- ⏳ 支付渠道动态配置
- ⏳ 押金退款流程

## 样式自定义

### 修改主色调

```css
/* 绿色主题（当前） */
background: linear-gradient(135deg, #10b981 0%, #059669 100%);

/* 可以改成其他颜色 */
background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
```

### 修改支付方式背景

```css
.payment-item {
  background: #1a1f3a; /* 深蓝色 */
}
```

## 与其他页面的联动

### 从门店列表进入

```typescript
// Home.vue
const goToStoreDetail = (id: string) => {
  router.push({
    path: "/deposit",
    query: { storeId: id },
  });
};
```

### 支付完成后跳转

```typescript
// Deposit.vue - 支付成功后
router.push({
  path: "/rental-success", // 租借成功页
  query: { orderId: "xxx" },
});
```

## 测试支付流程

1. 进入门店列表页
2. 点击任意门店卡片
3. 进入押金页面
4. 选择支付方式
5. 点击"支付押金"
6. 看到支付成功弹窗
7. 返回上一页

## 注意事项

1. **权限控制**：押金页面需要登录后才能访问（`noAuth: false`）
2. **支付图标**：当前使用占位图片，需要替换为真实的支付品牌图标
3. **金额单位**：使用 FCFA（西非法郎），可根据地区调整
4. **退款说明**：确保与实际业务流程一致

## 运行项目

```bash
# 开发模式
npm run dev

# 访问首页
http://localhost:3003/

# 直接访问押金页面（需要先登录）
http://localhost:3003/deposit
```

---

**提示**：页面完全还原了 UI 图的设计，并保持了与项目整体风格的统一性！
