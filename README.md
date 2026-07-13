# 美塑产品展示小程序

深圳市美塑包装材料有限公司的产品展示小程序。项目只负责浏览、分类、分享和联系，不包含价格、购物车或下单流程。

## 技术栈

- Taro 4 + React + TypeScript
- 微信小程序 Skyline 渲染器
- Glass-easel 组件框架
- SCSS
- 阿里云 OSS 图片资源

## 页面

- `pages/gallery/index`：产品展厅、搜索、视觉化产品卡片、产品详情
- `pages/category/index`：分类浏览，防静电袋、网格袋、黑色袋优先，珍珠棉末位
- `pages/contact/index`：公司资料、电话、微信二维码、产品范围和官网

## 开发

```bash
npm install
npm run dev:weapp
```

在微信开发者工具中导入项目根目录，开发工具读取 `project.config.json` 并使用 `dist` 作为小程序目录。

## 构建

```bash
npm run build:weapp
```

## 发布前配置

1. 将 `project.config.json` 中的 `appid` 替换为真实小程序 AppID。
2. 在微信公众平台配置 `curtisyan.oss-cn-shenzhen.aliyuncs.com` 为 downloadFile 合法域名。
3. 在真机上验证 Skyline、分享、拨号和二维码长按识别。

## 图片

产品图片继续使用：

`https://curtisyan.oss-cn-shenzhen.aliyuncs.com/meisubaocai-mini-app/`

本地 OSS 源资产不会编译进小程序代码包，按用途存放：

- `assets/oss/products`：24 张产品和公司展示图
- `assets/oss/company`：公司 Logo、微信二维码
- `assets/oss/UPLOAD_MANIFEST.md`：上传清单与命名规范

产品图采用可读文件名，单图直接使用产品名，多图使用连续编号，例如：

- `静电袋.jpg`
- `海绵1.jpg`、`海绵2.jpg`、`海绵3.jpg`
- `珍珠棉1.png` 至 `珍珠棉7.jpg`

公司 Logo 和微信二维码不参与产品图批量重命名。
# 商品管理

商品、图片、排序、首页主推和首页文案统一保存在 `src/data/catalog.json`。

运行：

```bash
npm run admin
```

然后访问 `http://127.0.0.1:4177`。管理页支持拖动排序、自动序号、新增/删除商品、编辑图片地址和设置首页主推。点击“保存配置”后会自动更新 JSON 并构建小程序。
