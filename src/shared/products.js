// 统一产品库 - 集中管理所有产品数据
// 分类页和展示页均从此库引用，确保数据一致性
import { IMAGE_URLS } from '../static/images/products/imageUrls.js'

// 包装材料产品数据库
export const PRODUCTS = {
  '食品级原料': {
    id: 'C1',
    name: '食品级原料',
    sub: '',
    description: '',
    images: [IMAGE_URLS.FOOD_GRADE_MATERIAL],
    category: 'company_display'
  },
  '整洁车间': {
    id: 'C2',
    name: '整洁车间',
    sub: '',
    description: '',
    images: [IMAGE_URLS.CLEAN_WORKSHOP],
    category: 'company_display'
  },
  '大型仓库': {
    id: 'C3',
    name: '大型仓库',
    sub: '',
    description: '',
    images: [IMAGE_URLS.LARGE_WAREHOUSE],
    category: 'company_display'
  },
  '机器设备': {
    id: 'C4',
    name: '机器设备',
    sub: '',
    description: '',
    images: [
      IMAGE_URLS.MACHINE_EQUIPMENT_1,
      IMAGE_URLS.MACHINE_EQUIPMENT_2,
      IMAGE_URLS.MACHINE_EQUIPMENT_3
    ],
    category: 'company_display'
  },
  '珍珠棉': {
    id: 'A1',
    name: '珍珠棉',
    sub: '',
    description: '',
    images: [
      IMAGE_URLS.PEARL_COTTON_1,
      IMAGE_URLS.PEARL_COTTON_2,
      IMAGE_URLS.PEARL_COTTON_3,
      IMAGE_URLS.PEARL_COTTON_4,
      IMAGE_URLS.PEARL_COTTON_5,
      IMAGE_URLS.PEARL_COTTON_6,
      IMAGE_URLS.PEARL_COTTON_7
    ],
    category: 'Foam plastic'
  },
  '海绵': {
    id: 'A2',
    name: '海绵',
    sub: '',
    description: '',
    images: [
      IMAGE_URLS.SPONGE_1,
      IMAGE_URLS.SPONGE_2,
      IMAGE_URLS.SPONGE_3
    ],
    category: 'Foam plastic'
  },
  '出口型自封袋': {
    id: 'B1',
    name: '出口型自封袋',
    sub: '',
    description: '',
    images: [IMAGE_URLS.EXPORT_ZIPPER_BAG],
    category: 'Foam_plastic'
  },
  '自封口 PE 袋': {
    id: 'B2',
    name: '自封口 PE 袋',
    sub: '',
    description: '',
    images: [IMAGE_URLS.PE_ZIPPER_BAG],
    category: 'Foam_plastic'
  },
  '静电袋': {
    id: 'B3',
    name: '静电袋',
    sub: '',
    description: '',
    images: [IMAGE_URLS.STATIC_BAG],
    category: 'Foam_plastic'
  },
  '出口 PE 袋': {
    id: 'B4',
    name: '出口 PE 袋',
    sub: '',
    description: '',
    images: [IMAGE_URLS.EXPORT_PE_BAG],
    category: 'Foam_plastic'
  },
  'PE 袋': {
    id: 'B5',
    name: 'PE 袋',
    sub: '',
    description: '',
    images: [IMAGE_URLS.PE_BAG],
    category: 'Foam_plastic'
  },
  '黑色导电袋': {
    id: 'B6',
    name: '黑色导电袋',
    sub: '',
    description: '',
    images: [IMAGE_URLS.BLACK_CONDUCTIVE_BAG],
    category: 'Foam_plastic'
  },
  '黑色防静电袋': {
    id: 'B7',
    name: '黑色防静电袋',
    sub: '',
    description: '',
    images: [IMAGE_URLS.BLACK_ANTISTATIC_BAG],
    category: 'Foam_plastic'
  },
  '网格防静电袋': {
    id: 'B8',
    name: '网格防静电袋',
    sub: '',
    description: '',
    images: [IMAGE_URLS.GRID_ANTISTATIC_BAG],
    category: 'Foam_plastic'
  }
}

// 获取产品的辅助函数
export function getProduct(id) {
  const product = PRODUCTS[id]
  if (product) {
    // 添加 image 属性，指向 images 数组的第一张图片
    return {
      ...product,
      image: product.images && product.images.length > 0 ? product.images[0] : '/static/logo.png'
    }
  }
  return null
}

// 批量获取产品
export function getProducts(ids) {
  return ids.map(id => getProduct(id)).filter(Boolean)
}

// 获取展示页产品列表 - 随机显示商品库中的所有商品
export function getShowcaseProducts() {
  const allProducts = Object.values(PRODUCTS).map(product => ({
    ...product,
    image: product.images && product.images.length > 0 ? product.images[0] : '/static/logo.png'
  }))
  // 使用Fisher-Yates洗牌算法进行随机排序，确保更好的随机性
  const shuffled = [...allProducts]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled // 返回所有产品，随机排序
}

// 获取指定展示页产品列表（可用于特定展示需求）
export function getSpecificShowcaseProducts(productIds) {
  return getProducts(productIds)
}

// 根据分类获取产品
export function getProductsByCategory(category) {
  return Object.values(PRODUCTS)
    .filter(p => p.category === category)
    .map(product => ({
      ...product,
      image: product.images && product.images.length > 0 ? product.images[0] : '/static/logo.png'
    }))
}

// 搜索产品
export function searchProducts(keyword) {
  const lowerKeyword = keyword.toLowerCase()
  return Object.values(PRODUCTS)
    .filter(p => 
      p.name.toLowerCase().includes(lowerKeyword) ||
      p.sub.toLowerCase().includes(lowerKeyword) ||
      p.description.toLowerCase().includes(lowerKeyword)
    )
    .map(product => ({
      ...product,
      image: product.images && product.images.length > 0 ? product.images[0] : '/static/logo.png'
    }))
}
