// 小程序统一 API 封装（公开接口，无需登录）
// 目标：从服务器获取最新的商品、分类、公司信息，而不再依赖本地静态数据
// 说明：
// - 主地址：使用域名（推荐，需修复 DNS 并在小程序后台配置 request 合法域名）
// - H5 开发环境：追加直连 Node 的后端端口作为兜底，避免 Nginx/证书/Host 头导致的 404

const PRIMARY_BASE = 'https://admin.asiay.asia/api/miniapp'
// 仅 H5 调试使用（直连 Node.js 3003 端口）。小程序真机/预览通常不能使用 IP/自定义端口。
const DEV_DIRECT_BASE = 'http://112.74.51.206:3003/api/miniapp'

function getBaseCandidates() {
  const bases = [PRIMARY_BASE]
  // #ifdef H5
  // 仅在 H5 环境下添加直连后端的 fallback
  bases.push(DEV_DIRECT_BASE)
  // #endif
  // #ifdef MP-WEIXIN
  // 微信小程序环境下不添加 IP fallback，只能使用合法域名
  // 如果主域名失败，直接报错，不尝试不被允许的 IP 访问
  // #endif
  return bases
}

function request({ url, method = 'GET', data = {}, timeout = 10000 }) {
  const API_BASE = 'https://admin.asiay.asia/api/miniapp'
  const fullUrl = `${API_BASE}${url}`
  
  console.log(`[API] 尝试请求: ${fullUrl}`)
  
  return new Promise((resolve, reject) => {
    const startTime = Date.now()
    
    // 使用uni.request，但保持成功的请求头配置
    uni.request({
      url: fullUrl,
      method: method,
      data: data,
      timeout: timeout,
      header: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      success: (res) => {
        const endTime = Date.now()
        const duration = endTime - startTime
        
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log(`[API] 请求成功 (${duration}ms): ${fullUrl}`)
          resolve(res.data)
        } else {
          console.error(`[API] 请求失败 (${duration}ms): ${res.statusCode}`, res.data)
          reject(new Error(`HTTP ${res.statusCode}: ${JSON.stringify(res.data)}`))
        }
      },
      fail: (err) => {
        const endTime = Date.now()
        const duration = endTime - startTime
        
        console.error(`[API] 请求异常 (${duration}ms):`, err)
        
        let errorMessage = err.errMsg || '网络请求失败'
        if (err.errMsg && err.errMsg.includes('request:fail')) {
          errorMessage = '网络连接失败，请检查网络或域名配置'
        }
        
        reject(new Error(`API请求失败: ${errorMessage}`))
      }
    })
  })
}

export function fetchVersion() {
  return request({ url: '/version', method: 'GET' })
}

export function fetchProducts() {
  return request({ url: '/products', method: 'GET' })
}

export function fetchCategories() {
  return request({ url: '/categories', method: 'GET' })
}

export function fetchCompany() {
  return request({ url: '/company', method: 'GET' })
}

export async function searchProducts(keyword) {
  // 服务端暂未提供公开搜索端点，先在前端过滤
  const all = await fetchProducts()
  const kw = (keyword || '').toLowerCase()
  return (all || []).filter(p => {
    const name = (p.name || '').toLowerCase()
    const sub = (p.sub || '').toLowerCase()
    const desc = (p.description || '').toLowerCase()
    return name.includes(kw) || sub.includes(kw) || desc.includes(kw)
  })
}
