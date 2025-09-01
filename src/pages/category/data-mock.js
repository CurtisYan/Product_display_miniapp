// 模拟 API 数据，实际项目中应从服务器获取
import { getProducts } from '../../shared/products.js'

// 分类结构定义 - 仅维护产品ID列表，具体产品数据从统一产品库获取
const categoryStructure = [
  {
    id: 'packaging',
    name: '塑料包装',
    children: [
      {
        id: 'Foam_plastic',
        name: '发泡塑料',
        productIds: ['珍珠棉', '海绵']
      },
      {
        id: 'Plastic_bags',
        name: '塑料包装袋',
        productIds: ['出口型自封袋', '自封口 PE 袋', '静电袋', '出口 PE 袋', 'PE 袋', '黑色导电袋', '黑色防静电袋', '网格防静电袋']
      },

    ]
  },
  {
    id: 'company_display',
    name: '公司展示',
    productIds: ['食品级原料', '整洁车间', '大型仓库', '机器设备']
  }
]

// 将分类结构转换为包含完整产品数据的格式
function buildCategoriesWithProducts() {
  return (categoryStructure || []).map(category => {
    // 如果没有 children，但有顶层 productIds，则自动包成一个“全部”子分类
    const normalizedChildren = (category.children && category.children.length > 0)
      ? category.children
      : (category.productIds ? [{
          id: `${category.id}-all`,
          name: '全部',
          productIds: category.productIds
        }] : []);

    return {
      ...category,
      children: (normalizedChildren || []).map(subcategory => ({
        ...subcategory,
        products: getProducts(subcategory.productIds || []) // 从产品库获取完整产品数据
      }))
    }
  })
}

// 模拟异步获取分类数据
export function fetchCategories() {
  return new Promise((resolve) => {
    // 立即返回数据，不添加人为延迟
    resolve(buildCategoriesWithProducts())
  })
}
