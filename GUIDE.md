# 产品展示小程序 - 内容更新指南 📝

本文档将帮助您了解如何更新和维护产品展示小程序的内容，包括商品信息、图片资源和公司信息等。

## 目录

- [🏢 公司信息配置](#公司信息配置)
- [🛍️ 商品信息管理](#商品信息管理)
- [🖼️ 图片资源管理](#图片资源管理)
- [📱 页面内容定制](#页面内容定制)
- [🔧 常见问题](#常见问题)

---

## 🏢 公司信息配置

### 1. 基本联系信息

公司的基本信息存储在 `src/config.js` 文件中。如果该文件不存在，请复制 `src/config.example.js` 并重命名为 `config.js`。

```javascript
// src/config.js
export const contactInfo = {
  phone: '您的电话号码',      // 例如：'13800138000'
  email: '您的邮箱',         // 例如：'contact@company.com'
  address: '您的公司地址',    // 例如：'深圳市南山区某某大厦1001室'
  company: '您的公司名称'     // 例如：'深圳某某科技有限公司'
};
```

⚠️ **注意**：`config.js` 文件已被加入 `.gitignore`，不会被提交到代码仓库，请妥善保管。

### 2. 公司Logo和二维码

- **公司Logo**：放置在 `src/static/images/company/szmeisu.jpeg`
- **微信二维码**：放置在 `src/static/images/company/WeChat-Business-Card.jpeg`

更换时，请保持相同的文件名，或在 `src/pages/contact/index.vue` 中修改对应的图片路径。

### 3. 工作时间

如需修改工作时间，请编辑 `src/pages/contact/index.vue` 文件中的第83-94行：

```vue
<view class="schedule-item">
  <text class="schedule-day">周一至周五</text>
  <text class="schedule-time">8:30 - 19:30</text>
</view>
<view class="schedule-item">
  <text class="schedule-day">周六</text>
  <text class="schedule-time">9:00 - 17:00</text>
</view>
```

---

## 🛍️ 商品信息管理

### 1. 商品数据存储位置

所有商品信息统一存储在 `src/shared/products.js` 文件中。

### 2. 商品数据结构

每个商品都包含以下字段：

```javascript
'product-id': {
  id: 'product-id',           // 商品唯一标识（必须唯一）
  name: '商品名称',            // 商品名称
  sub: '商品简短描述',          // 副标题或简短描述
  description: '详细描述',      // 商品详细描述
  images: [                   // 商品图片数组（第一张自动作为主图）
    '/static/images/products/product1.png',
    '/static/images/products/product2.png'
  ],
  category: 'bags'             // 商品分类标记（bags/bottles/boxes）
}
```

⚠️ **注意**：
- 不需要单独设置主图，`images` 数组的第一张图片会自动作为商品主图
- `category` 字段用于标记商品属于哪个分类，需与分类配置中的子分类ID对应

### 3. 商品分类配置

商品分类结构在 `src/pages/category/data-mock.js` 中定义：

```javascript
const categoryStructure = [
  {
    id: 'packaging',
    name: '塑料包装',     // 主分类名称
    children: [
      {
        id: 'bags',      // 子分类ID（与商品的category字段对应）
        name: '塑料袋',   // 子分类显示名称
        productIds: ['zip', 'trash', 'food-bag', ...]  // 该分类下的商品ID列表
      },
      {
        id: 'bottles',
        name: '塑料瓶',
        productIds: ['pet-500', 'hdpe-milk', ...]
      },
      // 更多子分类...
    ]
  }
]
```

**修改分类的步骤：**
1. 在 `data-mock.js` 中修改分类名称或添加新分类
2. 在 `products.js` 中为商品设置正确的 `category` 字段
3. 在 `data-mock.js` 的 `productIds` 数组中添加商品ID

---

#### 3.1 如何新增分类（带子分类）

在 `src/pages/category/data-mock.js` 的 `categoryStructure` 中添加一个对象，并在 `children` 里定义子分类，每个子分类用 `productIds` 指向商品库中的商品ID。

示例：

```javascript
// data-mock.js
{
  id: 'films',
  name: '薄膜',
  children: [
    { id: 'pe-film', name: 'PE薄膜', productIds: ['food-bag', 'vacuum'] },
    { id: 'po-film', name: 'PO薄膜', productIds: ['mail', 'tshirt'] }
  ]
}
```

注意：`productIds` 中的每个ID必须存在于 `src/shared/products.js` 中。

#### 3.2 无子分类但直接展示商品（自动生成“全部”）

如果你不想写 `children`，而是希望顶层分类直接展示指定商品，可以在该分类对象上写 `productIds`，系统会自动生成一个名为“全部”的子分类用于展示。

示例：

```javascript
// data-mock.js
{
  id: 'recommend',
  name: '精选推荐',
  productIds: ['zip', 'fresh-box', 'pump'] // 顶层直接挂商品ID
  // 构建后将自动成为：
  // children: [{ id: 'recommend-all', name: '全部', products: [...] }]
}
```

#### 3.3 暂无子分类且不展示商品

如果你暂时没有子分类且也不想展示商品，请写空的 `children` 数组即可，页面不会报错：

```javascript
// data-mock.js
{
  id: 'tools',
  name: '工具',
  children: []
}
```

#### 3.4 如何为分类添加商品

- 在 `src/shared/products.js` 中新增或确认商品：

```javascript
// products.js（片段）
export const PRODUCTS = {
  'my-new-item': {
    id: 'my-new-item',
    name: '我的新品',
    sub: '简短描述',
    description: '详细描述',
    images: ['/static/images/products/my-new-item.png'],
    category: 'bags' // 与子分类ID对应（例如 bags）
  }
}
```

- 在 `data-mock.js` 中将该ID加入对应子分类的 `productIds`，或放在顶层分类的 `productIds`（参考 3.2）：

```javascript
// 带子分类：加入到对应子分类
{ id: 'bags', name: '塑料袋', productIds: ['zip', 'trash', 'my-new-item'] }

// 无子分类：直接写到顶层（将自动生成“全部”）
{ id: 'recommend', name: '精选推荐', productIds: ['zip', 'my-new-item'] }
```

#### 3.5 常见错误与自检

- 报错 TypeError: Cannot read properties of undefined (reading 'map')：
  - 说明某分类未定义 `children`，且也没有 `productIds`。请写 `children: []` 或提供顶层 `productIds`。
- 商品显示为空：
  - 检查 `productIds` 中的ID是否存在于 `products.js`；不存在的ID会被忽略。
- 商品图片不显示：
  - 确认图片路径是否以 `/static/images/products/` 开头，文件是否存在。

## 🖼️ 图片资源管理

### 1. 图片存放位置

```
src/static/
├── logo.png                # 默认Logo
└── images/
    ├── company/            # 公司相关图片
    │   ├── szmeisu.jpeg   # 公司Logo
    │   └── WeChat-Business-Card.jpeg  # 微信二维码
    └── products/          # 商品图片文件夹
        ├── product1.png
        ├── product2.jpg
        └── ...
```

### 2. 添加商品图片

1. 将商品图片放入 `src/static/images/products/` 文件夹
2. 在商品信息中引用图片路径：

```javascript
'product-id': {
  // ... 其他属性
  images: [
    '/static/images/products/product1.png',      // 第一张自动作为主图
    '/static/images/products/product1-detail.png' // 其他图片
  ]
}
```

### 3. 图片优化建议

- **格式**：推荐使用 JPEG（照片）或 PNG（需要透明背景）
- **尺寸**：商品主图建议 800x800 像素
- **大小**：单张图片建议不超过 200KB
- **命名**：使用有意义的英文名称，避免中文和特殊字符

---

## 📱 页面内容定制

### 1. 分类页面

分类信息在 `src/pages/category/index.vue` 中管理。如需修改分类名称或图标，查找相应的分类定义。

### 2. 首页轮播图

如需添加轮播图功能，可在 `src/pages/index/index.vue` 中添加 swiper 组件。

### 3. 展示页面

展示页面的商品会自动从商品库中随机获取。如需指定展示特定商品，可修改 `src/shared/products.js` 中的 `getShowcaseProducts` 函数。

---

## 🔧 常见问题

### Q1: 如何更换小程序名称？

编辑 `src/manifest.json` 文件中的 `name` 字段：
```json
{
  "name": "您的小程序名称",
  // ...
}
```

### Q2: 如何修改小程序的主题颜色？

编辑 `src/uni.scss` 文件中的颜色变量，或在各个页面的 `<style>` 部分修改CSS变量。

### Q3: 如何备份配置信息？

定期备份以下文件：
- `src/config.js` - 公司联系信息
- `src/shared/products.js` - 所有商品数据
- `src/static/images/` - 所有图片资源

---

## 📋 更新清单

更新小程序内容时，请按照以下清单确认：

- [ ] 更新公司信息 (`src/config.js`)
- [ ] 更新商品数据 (`src/shared/products.js`)
- [ ] 添加/替换商品图片 (`src/static/images/products/`)
- [ ] 更换公司Logo和二维码 (`src/static/images/company/`)
- [ ] 测试搜索功能是否正常
- [ ] 测试收藏功能是否正常
- [ ] 在微信开发者工具中预览所有页面
- [ ] 构建生产版本 (`npm run build:mp-weixin`)
- [ ] 上传到微信公众平台

---

## 🆘 需要帮助？

如果您在更新内容时遇到问题，请：

1. 问 AI
2. 问 AI
3. 问 AI
4. 联系技术支持人员

---

**最后更新时间**：2025年8月

祝您使用愉快！ 🎉 
如有疑问请联系：realthat@foxmail.com
