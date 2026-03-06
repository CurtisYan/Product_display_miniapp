// 改造：从服务器获取分类与产品数据（小程序公开API）
import { fetchCategories as fetchCategoriesApi, fetchProducts } from '../../utils/api.js'

// 兼容保留：若服务器不可用时的空结构（尽量不使用本地mock）
const categoryStructure = []

// 将分类结构转换为包含完整产品数据的格式
function buildCategoriesWithProductsFromServer(rawCategories = [], allProducts = []) {
  // 将产品表转为以业务ID(product_id或id)为键的字典
  const productById = {}
  ;(allProducts || []).forEach(p => {
    const id = p.product_id ?? p.id
    if (!id) return
    productById[id] = {
      ...p,
      id: p.id ?? p.product_id,
      image: Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : ''
    }
  })

  // 将分类拍平成主分类+子分类结构
  // 服务器 categories 表结构：category_id, name, parent_id, product_ids(JSON)
  const byId = {}
  const roots = []
  ;(rawCategories || []).forEach(c => {
    const node = {
      id: c.category_id,
      name: c.name,
      productIds: Array.isArray(c.product_ids) ? c.product_ids : [],
      children: []
    }
    byId[node.id] = node
  })
  ;(rawCategories || []).forEach(c => {
    const id = c.category_id
    const parentId = c.parent_id
    if (parentId && byId[parentId]) {
      byId[parentId].children.push(byId[id])
    } else {
      roots.push(byId[id])
    }
  })

  // 规范化：无 children 但有 productIds 的主类，自动生成“全部”子类
  const withProducts = (roots || []).map(category => {
    const hasChildren = Array.isArray(category.children) && category.children.length > 0
    const normalizedChildren = hasChildren
      ? category.children
      : (Array.isArray(category.productIds) && category.productIds.length > 0
          ? [{ id: `${category.id}-all`, name: '全部', productIds: category.productIds }]
          : [])

    return {
      id: category.id,
      name: category.name,
      children: normalizedChildren.map(sub => ({
        id: sub.id,
        name: sub.name,
        products: (sub.productIds || []).map(pid => productById[pid]).filter(Boolean)
      }))
    }
  })

  return withProducts
}

// 模拟异步获取分类数据
export async function fetchCategories() {
  try {
    const [rawCategories, allProducts] = await Promise.all([
      fetchCategoriesApi(),
      fetchProducts()
    ])
    return buildCategoriesWithProductsFromServer(rawCategories, allProducts)
  } catch (err) {
    console.error('[Category] 加载服务器分类失败，回退为空结构:', err)
    // 回退：尽量返回空数组，避免前端异常
    return buildCategoriesWithProductsFromServer(categoryStructure, [])
  }
}
