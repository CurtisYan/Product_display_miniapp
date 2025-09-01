/**
 * 分享相关工具函数
 */

/**
 * 配置页面分享
 * @param {Object} options - 分享配置
 * @param {Object} options.product - 商品信息
 * @param {String} options.title - 分享标题
 * @param {String} options.path - 分享路径
 * @param {String} options.imageUrl - 分享图片
 */
export function setupPageShare(options = {}) {
  // 设置分享回调
  const shareOptions = {
    title: options.title || '发现了一个不错的产品',
    path: options.path || '/pages/index/index',
    imageUrl: options.imageUrl || ''
  }
  
  // 如果有商品信息，构建带参数的分享路径
  if (options.product) {
    const params = {
      productId: options.product.id,
      productName: encodeURIComponent(options.product.name || ''),
      from: 'share'
    }
    
    // 构建查询字符串
    const queryString = Object.keys(params)
      .map(key => `${key}=${params[key]}`)
      .join('&')
    
    shareOptions.title = `【${options.product.name}】${options.product.sub || ''}`
    shareOptions.path = `/pages/showcase/index?${queryString}`
    shareOptions.imageUrl = options.product.image || options.product.images?.[0] || ''
  }
  
  return shareOptions
}

/**
 * 显示分享菜单
 * @param {Object} product - 商品信息
 */
export function showShareMenu(product) {
  // #ifdef MP-WEIXIN
  uni.showShareMenu({
    withShareTicket: true,
    menus: ['shareAppMessage', 'shareTimeline'],
    success() {
      console.log('显示分享菜单成功')
    },
    fail(err) {
      console.error('显示分享菜单失败:', err)
    }
  })
  // #endif
  
  // #ifndef MP-WEIXIN
  // 非微信环境，使用系统分享或复制链接
  showAlternativeShare(product)
  // #endif
}

/**
 * 非微信环境的替代分享方案
 * @param {Object} product - 商品信息
 */
function showAlternativeShare(product) {
  const shareUrl = buildShareUrl(product)
  
  uni.showActionSheet({
    itemList: ['复制链接', '生成分享卡片'],
    success(res) {
      if (res.tapIndex === 0) {
        // 复制链接
        uni.setClipboardData({
          data: shareUrl,
          success() {
            uni.showToast({
              title: '链接已复制',
              icon: 'success'
            })
          }
        })
      } else if (res.tapIndex === 1) {
        // 生成分享卡片（可以跳转到专门的分享卡片页面）
        uni.navigateTo({
          url: `/pages/share-card/index?productId=${product.id}`
        })
      }
    }
  })
}

/**
 * 构建分享链接
 * @param {Object} product - 商品信息
 * @returns {String} 分享链接
 */
function buildShareUrl(product) {
  // 这里可以是你的 H5 页面地址或者小程序码链接
  const baseUrl = 'https://your-domain.com/product'
  const params = {
    id: product.id,
    name: encodeURIComponent(product.name)
  }
  
  const queryString = Object.keys(params)
    .map(key => `${key}=${params[key]}`)
    .join('&')
  
  return `${baseUrl}?${queryString}`
}

/**
 * 处理分享成功回调
 * @param {Object} res - 分享结果
 */
export function handleShareSuccess(res) {
  console.log('分享成功', res)
  
  // 记录分享次数
  const shareCount = uni.getStorageSync('shareCount') || 0
  uni.setStorageSync('shareCount', shareCount + 1)
  
  // 显示成功提示
  uni.showToast({
    title: '分享成功',
    icon: 'success'
  })
}

/**
 * 生成分享海报
 * @param {Object} product - 商品信息
 * @returns {Promise} 海报图片路径
 */
export async function generateSharePoster(product) {
  return new Promise((resolve, reject) => {
    // 这里可以使用 canvas 生成海报
    // 简化示例，实际需要使用 canvas 绘制
    
    const ctx = uni.createCanvasContext('shareCanvas')
    
    // 绘制背景
    ctx.setFillStyle('#ffffff')
    ctx.fillRect(0, 0, 375, 600)
    
    // 绘制商品图片
    if (product.image) {
      ctx.drawImage(product.image, 20, 20, 335, 335)
    }
    
    // 绘制商品名称
    ctx.setFillStyle('#333333')
    ctx.setFontSize(18)
    ctx.fillText(product.name, 20, 380)
    
    // 绘制商品描述
    if (product.sub) {
      ctx.setFillStyle('#666666')
      ctx.setFontSize(14)
      ctx.fillText(product.sub, 20, 410)
    }
    
    // 绘制小程序码（需要后端生成）
    // ctx.drawImage(qrCodePath, 275, 480, 80, 80)
    
    ctx.draw(false, () => {
      uni.canvasToTempFilePath({
        canvasId: 'shareCanvas',
        success(res) {
          resolve(res.tempFilePath)
        },
        fail(err) {
          reject(err)
        }
      })
    })
  })
}

/**
 * 保存分享记录
 * @param {Object} product - 商品信息
 * @param {String} shareType - 分享类型
 */
export function saveShareRecord(product, shareType = 'link') {
  const records = uni.getStorageSync('shareRecords') || []
  records.push({
    productId: product.id,
    productName: product.name,
    shareType,
    timestamp: Date.now()
  })
  
  // 只保留最近100条记录
  if (records.length > 100) {
    records.splice(0, records.length - 100)
  }
  
  uni.setStorageSync('shareRecords', records)
}
