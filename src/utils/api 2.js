// API 请求工具 - 统一管理所有服务器数据请求
// 支持主备服务器自动切换，确保数据获取的可靠性

const API_CONFIG = {
  // 服务器API基础URL
  BASE_URL: 'https://admin.asiay.asia/api/miniapp',
  // 请求超时时间
  TIMEOUT: 15000,
  // 重试次数
  RETRY_COUNT: 3
}

/**
 * 统一的网络请求方法
 * @param {string} endpoint - API端点
 * @param {object} options - 请求选项
 * @returns {Promise} 请求结果
 */
async function request(endpoint, options = {}) {
  const defaultOptions = {
    method: 'GET',
    timeout: API_CONFIG.TIMEOUT,
    header: {
      'Content-Type': 'application/json'
    },
    ...options
  }

  try {
    console.log(`[API] 请求服务器: ${API_CONFIG.BASE_URL}${endpoint}`)
    const response = await uni.request({
      url: `${API_CONFIG.BASE_URL}${endpoint}`,
      ...defaultOptions
    })
    
    if (response.statusCode === 200 && response.data) {
      console.log(`[API] 服务器请求成功: ${endpoint}`)
      return response.data
    }
    throw new Error(`服务器响应异常: ${response.statusCode}`)
  } catch (error) {
    console.error(`[API] 请求失败: ${error.message}`)
    throw new Error(`网络请求失败: ${error.message}`)
  }
}



/**
 * 获取所有商品数据
 * @returns {Promise<Array>} 商品列表
 */
export async function fetchProducts() {
  try {
    const products = await request('/products')
    console.log(`[API] 获取到 ${products.length} 个商品`)
    return products || []
  } catch (error) {
    console.error('[API] 获取商品数据失败:', error)
    uni.showToast({
      title: '商品数据加载失败',
      icon: 'none'
    })
    return []
  }
}

/**
 * 获取单个商品详情
 * @param {string} productId - 商品ID
 * @returns {Promise<Object>} 商品详情
 */
export async function fetchProduct(productId) {
  try {
    const product = await request(`/products/${productId}`)
    console.log(`[API] 获取商品详情: ${productId}`)
    return product
  } catch (error) {
    console.error(`[API] 获取商品详情失败 (${productId}):`, error)
    return null
  }
}

/**
 * 获取所有分类数据
 * @returns {Promise<Array>} 分类列表
 */
export async function fetchCategories() {
  try {
    const categories = await request('/categories')
    console.log(`[API] 获取到 ${categories.length} 个分类`)
    return categories || []
  } catch (error) {
    console.error('[API] 获取分类数据失败:', error)
    uni.showToast({
      title: '分类数据加载失败',
      icon: 'none'
    })
    return []
  }
}

/**
 * 获取公司信息
 * @returns {Promise<Object>} 公司信息
 */
export async function fetchCompanyInfo() {
  try {
    const company = await request('/company')
    console.log('[API] 获取公司信息成功')
    return company
  } catch (error) {
    console.error('[API] 获取公司信息失败:', error)
    uni.showToast({
      title: '公司信息加载失败',
      icon: 'none'
    })
    return null
  }
}

/**
 * 搜索商品
 * @param {string} keyword - 搜索关键词
 * @returns {Promise<Array>} 搜索结果
 */
export async function searchProducts(keyword) {
  if (!keyword || keyword.trim() === '') {
    return []
  }
  
  try {
    const results = await request('/search', {
      method: 'GET',
      data: { q: keyword.trim() }
    })
    console.log(`[API] 搜索 "${keyword}" 获取到 ${results.length} 个结果`)
    return results || []
  } catch (error) {
    console.error('[API] 搜索失败:', error)
    uni.showToast({
      title: '搜索失败，请重试',
      icon: 'none'
    })
    return []
  }
}

/**
 * 数据转换工具 - 将服务器数据格式转换为小程序需要的格式
 */
export const DataTransformer = {
  /**
   * 转换商品数据格式
   * @param {Object} serverProduct - 服务器商品数据
   * @returns {Object} 小程序商品数据格式
   */
  transformProduct(serverProduct) {
    return {
      id: serverProduct.product_id, // 使用 product_id 作为主键
      name: serverProduct.name,
      sub: serverProduct.sub || '',
      description: serverProduct.description || '',
      images: Array.isArray(serverProduct.images) ? serverProduct.images : 
              (serverProduct.images ? JSON.parse(serverProduct.images) : []),
      category: serverProduct.category,
      price: serverProduct.price || 0,
      stock: serverProduct.stock || 0
    }
  },

  /**
   * 转换分类数据格式
   * @param {Array} serverCategories - 服务器分类数据
   * @returns {Array} 小程序分类数据格式
   */
  transformCategories(serverCategories) {
    // 构建分类树结构
    const categoryMap = new Map()
    const rootCategories = []

    // 第一遍：创建所有分类节点
    serverCategories.forEach(cat => {
      const category = {
        id: cat.category_id,
        name: cat.name,
        children: [],
        productIds: cat.product_ids ? JSON.parse(cat.product_ids) : []
      }
      categoryMap.set(cat.category_id, category)
      
      if (!cat.parent_id) {
        rootCategories.push(category)
      }
    })

    // 第二遍：建立父子关系
    serverCategories.forEach(cat => {
      if (cat.parent_id && categoryMap.has(cat.parent_id)) {
        const parent = categoryMap.get(cat.parent_id)
        const child = categoryMap.get(cat.category_id)
        parent.children.push(child)
      }
    })

    return rootCategories
  },

  /**
   * 转换公司信息格式
   * @param {Object} serverCompany - 服务器公司数据
   * @returns {Object} 小程序公司数据格式
   */
  transformCompany(serverCompany) {
    return {
      company: serverCompany.name,
      phone: serverCompany.phone,
      email: serverCompany.email,
      address: serverCompany.address,
      introduction: serverCompany.introduction,
      logo: serverCompany.company_logo,
      wechatQr: serverCompany.wechat_qr
    }
  }
}

// 导出API配置，供其他模块使用
export { API_CONFIG }
