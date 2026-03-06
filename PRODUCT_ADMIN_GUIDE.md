# 商品管理后台使用说明 (v3.0)

**版本说明**: 此版本对后台进行了全面重构，引入了统一的多项目管理入口、完整的数据库结构、全功能API和现代化的前端管理界面，支持商品、分类、公司信息管理和图片上传功能。

## 🏗️ 系统架构

- **主后台入口**: `admin.asiay.asia/` - 统一管理所有项目
- **项目管理页面**: `admin.asiay.asia/product-display-miniapp/` - 具体项目管理
- **技术栈**: Node.js + Express + SQLite + HTML/CSS/JS
- **部署方式**: PM2 + Nginx + SSL

## 📁 文件结构

```
/var/www/product-admin/
├── server.js                    # 主服务器文件（包含所有API）
├── package.json                 # 依赖配置
├── products.db                  # SQLite数据库
├── public/                      # 静态文件目录
│   ├── index.html              # 主后台入口页面
│   ├── product-admin.html      # 产品管理页面
│   └── images/                 # 图片资源
│       ├── company/            # 公司图片
│       └── uploads/            # 用户上传图片
└── migrate-*.js                # 数据迁移脚本
```

## 🚀 部署指南

### 环境要求

- Node.js 14+
- PM2 (进程管理)
- Nginx (反向代理)
- SQLite3

### 安装依赖

```bash
cd /var/www/product-admin
npm install express sqlite3 cors multer
```

### 启动服务

```bash
# 使用PM2启动
pm2 start server.js --name "product-admin"

# 或直接启动
node server.js
```

### Nginx配置

```nginx
server {
    listen 80;
    listen 443 ssl;
    server_name admin.yourdomain.com;
    
    # SSL配置
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    # 主后台页面
    location = / {
        root /var/www/product-admin/public;
        try_files /index.html =404;
    }
    
    # 项目管理页面
    location ~ ^/product-display-miniapp/(products|categories|company)$ {
        proxy_pass http://localhost:3003( 不一定是 3003);
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    # API代理
    location /api/ {
        proxy_pass http://localhost:3003( 不一定是 3003);
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    # 静态资源
    location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg)$ {
        root /var/www/product-admin/public;
        expires 1h;
    }
}
```

## 🗄️ 数据库结构

### 商品表 (products)
| 字段 | 类型 | 说明 |
|---|---|---|
| id | INTEGER | 主键，自增ID |
| product_id | TEXT | 商品唯一标识 (如 'A1', 'C2') |
| name | TEXT | 商品名称 |
| sub | TEXT | 副标题 |
| description | TEXT | 详细描述 |
| images | TEXT | 图片URL数组 (JSON格式) |
| category | TEXT | 分类标识 |
| created_at | DATETIME | 创建时间 |

### 分类表 (categories)
| 字段 | 类型 | 说明 |
|---|---|---|
| id | INTEGER | 主键，自增ID |
| category_id | TEXT | 分类唯一标识 (如 'packaging') |
| name | TEXT | 分类名称 |
| parent_id | TEXT | 父分类ID，顶级为NULL |
| product_ids | TEXT | 关联商品ID数组 (JSON格式) |
| created_at | DATETIME | 创建时间 |

### 公司信息表 (company_info)
| 字段 | 类型 | 说明 |
|---|---|---|
| id | INTEGER | 主键，固定为1 |
| name | TEXT | 公司名称 |
| phone | TEXT | 联系电话 |
| email | TEXT | 邮箱地址 |
| address | TEXT | 公司地址 |
| introduction | TEXT | 公司介绍 |
| company_logo | TEXT | 公司Logo URL |
| wechat_qr | TEXT | 微信二维码 URL |
| updated_at | DATETIME | 更新时间 |

## 🔌 API接口 (v3.0)

### 统计信息API
- `GET /api/stats` - 获取系统统计信息（商品数、分类数、公司信息数）

### 商品管理API
- `GET /api/product-display-miniapp/products` - 获取所有商品
- `POST /api/product-display-miniapp/products` - 创建新商品
- `PUT /api/product-display-miniapp/products/:id` - 更新商品信息
- `DELETE /api/product-display-miniapp/products/:id` - 删除商品
- `GET /api/product-display-miniapp/products/search/:keyword` - 搜索商品

### 分类管理API
- `GET /api/product-display-miniapp/categories` - 获取所有分类（支持层级结构）
- `POST /api/product-display-miniapp/categories` - 创建新分类
- `PUT /api/product-display-miniapp/categories/:id` - 更新分类信息
- `DELETE /api/product-display-miniapp/categories/:id` - 删除分类
- `POST /api/product-display-miniapp/import-default-categories` - 导入默认分类

### 公司信息API
- `GET /api/product-display-miniapp/company` - 获取公司信息
- `PUT /api/product-display-miniapp/company` - 更新公司信息

### 图片管理API
- `POST /api/product-display-miniapp/upload-image` - 上传图片文件
- `DELETE /api/product-display-miniapp/delete-image/:filename` - 删除上传的图片

## 🛠️ 功能特性

### 主后台入口
- **项目统计**: 实时显示商品数量、分类数量、公司信息等统计数据
- **项目导航**: 快速进入各个管理模块
- **响应式设计**: 支持桌面和移动设备访问

### 商品管理
- **列表展示**: 卡片式布局，清晰展示商品信息
- **CRUD操作**: 完整的增删改查功能
- **实时搜索**: 支持按商品名称、描述搜索
- **分类管理**: 下拉选择器支持分类选择
- **图片管理**: 支持多图片URL输入

### 分类管理
- **层级展示**: 清晰显示父子分类关系
- **缩进显示**: 使用缩进和连接线显示层级
- **统计信息**: 显示每个分类的子分类数量
- **默认数据**: 支持一键导入默认分类结构

### 公司信息管理
- **基本信息**: 公司名称、电话、邮箱、地址
- **详细介绍**: 支持多行文本输入
- **图片管理**: 公司Logo和微信二维码管理
- **实时预览**: 输入URL后立即显示图片预览

### 图片上传功能
- **本地上传**: 支持直接上传图片文件到服务器
- **文件限制**: 只允许上传图片文件，最大5MB
- **自动命名**: 生成唯一文件名避免冲突
- **URL返回**: 上传成功后返回完整的HTTPS URL
- **预览功能**: 支持图片预览和点击放大

## 🔧 维护命令

### PM2进程管理
```bash
# 查看服务状态
pm2 status
pm2 describe product-admin

# 重启服务
pm2 restart product-admin

# 停止服务
pm2 stop product-admin

# 查看日志
pm2 logs product-admin --lines 50

# 监控服务
pm2 monit
```

### 数据库维护
```bash
# 备份数据库
cp /var/www/product-admin/products.db /var/www/product-admin/backup/products-$(date +%Y%m%d).db

# 查看数据库信息
sqlite3 /var/www/product-admin/products.db ".tables"
sqlite3 /var/www/product-admin/products.db "SELECT COUNT(*) FROM products;"

# 数据库优化
sqlite3 /var/www/product-admin/products.db "VACUUM;"
```

### 系统监控
```bash
# 检查端口占用
netstat -tlnp | grep :3003

# 检查磁盘空间
df -h /var/www/product-admin

# 检查上传目录
ls -la /var/www/product-admin/public/images/uploads/
```

## 🔒 安全建议

### 访问控制
- **HTTP Basic Auth**: 在Nginx层添加基础认证
- **IP白名单**: 限制特定IP访问管理后台
- **HTTPS强制**: 确保所有通信加密传输
- **定期更换密码**: 建议每3个月更换一次

### 数据保护
- **定期备份**: 每日自动备份数据库
- **访问日志**: 记录所有管理后台访问
- **文件权限**: 确保数据库文件权限正确设置
- **上传限制**: 限制上传文件类型和大小

## 📝 重要说明

### 数据迁移
- 数据迁移脚本只需运行一次
- 重复运行不会造成数据重复
- 建议在迁移前备份原始数据

### 图片管理
- 支持本地上传和外部URL两种方式
- 上传的图片存储在 `/public/images/uploads/` 目录
- 建议定期清理无用的上传图片

### 性能优化
- SQLite适合中小型应用，大量数据建议迁移到MySQL
- 图片建议使用CDN加速访问
- 定期执行数据库VACUUM操作

## 🚀 扩展功能

### 已实现功能
- ✅ 统一多项目管理入口
- ✅ 完整的商品CRUD操作
- ✅ 层级分类管理
- ✅ 公司信息管理
- ✅ 图片上传和预览
- ✅ 实时统计数据
- ✅ 响应式设计

### 可扩展功能
- 🔄 用户认证和权限管理
- 🔄 数据导入导出功能
- 🔄 操作日志记录
- 🔄 多语言支持
- 🔄 批量操作功能
- 🔄 API文档自动生成

## 📞 技术支持

如遇到问题，请检查：
1. PM2服务状态是否正常
2. Nginx配置是否正确
3. 数据库文件权限是否正确
4. 端口3003是否被占用
5. SSL证书是否有效

---

**文档版本**: v3.0  
**最后更新**: 2025-09-20  
**适用版本**: Node.js 14+, PM2 5+, Nginx 1.18+
