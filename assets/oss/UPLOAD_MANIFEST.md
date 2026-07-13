# 阿里云 OSS 上传清单

更新时间：2026-07-14

OSS 根地址：

`https://curtisyan.oss-cn-shenzhen.aliyuncs.com/meisubaocai-mini-app/`

本地 `assets/oss` 下的目录名称与 OSS 对象路径保持一致。上传时保留中文目录、文件名、大小写和扩展名，不要扁平化或自动重命名。

## 生产环境目录

### products/

- `products/产品/防静电袋/`：6 张
- `products/产品/网格防静电袋/`：3 张
- `products/产品/PE袋/`：6 张
- `products/产品/气泡袋/`：2 张
- `products/产品/海绵/`：3 张
- `products/产品/珍珠棉/`：7 张
- `products/工厂/生产设备/`：4 张
- `products/工厂/工厂环境/`：1 张
- `products/工厂/仓库/`：1 张
- `products/工厂/原材料/`：1 张
- `products/质量/防静电测试/`：6 张

完整产品文件与展示项对应关系见：`products-upload-manifest.json`。

### company/

小程序实际使用：

- `company/微信二维码.jpeg`
- `company/SFYlogo.jpeg`

以下为设计源文件或备用文件，不进入小程序网络请求：

- `company/SFYlogo-black-chroma.png`
- `company/SFYlogo-black-circle.png`
- `company/SFYlogo-black-circle.svg`

### contact-playground/

小程序实际使用：

- `contact-playground/contact-playground-bg.png`
- `contact-playground/01-meisu-red-v2.png`
- `contact-playground/02-botanical-white.png`
- `contact-playground/03-sfy-grid.png`
- `contact-playground/04-sfy-pattern-purple.png`
- `contact-playground/05-sfy-seal-black.png`
- `contact-playground/06-amber-abstract.png`

`contact-playground/source/` 是带纯色背景的生成中间文件，小程序不读取；`contact-playground/原图.png` 仅作为设计参考。

## URL 规则

每一级路径分别进行 URL 编码，目录斜杠保持不变。例如：

`products/质量/防静电测试/防静电测试3.jpg`

对应：

`https://curtisyan.oss-cn-shenzhen.aliyuncs.com/meisubaocai-mini-app/products/%E8%B4%A8%E9%87%8F/%E9%98%B2%E9%9D%99%E7%94%B5%E6%B5%8B%E8%AF%95/%E9%98%B2%E9%9D%99%E7%94%B5%E6%B5%8B%E8%AF%953.jpg`

## 上传后检查

1. 随机抽查产品、公司资料、联系页素材三个目录，确认返回 HTTP 200。
2. 微信开发者工具中关闭“不校验合法域名”后再进行一次真机预览。
3. OSS 域名必须加入小程序的 `downloadFile` 和 `request` 合法域名。
