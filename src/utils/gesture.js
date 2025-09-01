/**
 * 手势处理工具类
 * 提供防抖、节流、速度平滑等功能
 */

export class GestureHandler {
  constructor(options = {}) {
    // 配置项
    this.options = {
      velocityWindow: 100, // 速度计算时间窗口(ms)
      velocitySmoothFactor: 0.7, // 速度平滑因子
      activationThreshold: 10, // 激活拖拽的最小移动距离
      ...options
    }
    
    // 速度历史记录
    this.velocityHistory = []
    this.maxHistorySize = 5
  }
  
  /**
   * 计算平滑速度
   * @param {number} currentY - 当前Y坐标
   * @param {number} lastY - 上一个Y坐标
   * @param {number} currentTime - 当前时间戳
   * @param {number} lastTime - 上一个时间戳
   * @param {number} previousVelocity - 之前的速度值
   * @returns {number} 平滑后的速度
   */
  calculateSmoothVelocity(currentY, lastY, currentTime, lastTime, previousVelocity = 0) {
    const dt = currentTime - lastTime
    
    // 时间间隔太长或太短，忽略
    if (dt <= 0 || dt > this.options.velocityWindow) {
      return previousVelocity
    }
    
    // 计算瞬时速度
    const instantVelocity = (currentY - lastY) / dt * 1000
    
    // 加入历史记录
    this.velocityHistory.push({
      velocity: instantVelocity,
      time: currentTime,
      weight: 1 / (dt + 10) // 时间越短，权重越高
    })
    
    // 限制历史记录大小
    if (this.velocityHistory.length > this.maxHistorySize) {
      this.velocityHistory.shift()
    }
    
    // 计算加权平均速度
    const now = currentTime
    let totalWeight = 0
    let weightedSum = 0
    
    this.velocityHistory.forEach(record => {
      // 根据时间衰减权重
      const age = now - record.time
      const timeDecay = Math.exp(-age / 100) // 指数衰减
      const weight = record.weight * timeDecay
      
      weightedSum += record.velocity * weight
      totalWeight += weight
    })
    
    if (totalWeight > 0) {
      const avgVelocity = weightedSum / totalWeight
      // 使用指数移动平均进一步平滑
      return previousVelocity * this.options.velocitySmoothFactor + 
             avgVelocity * (1 - this.options.velocitySmoothFactor)
    }
    
    return previousVelocity
  }
  
  /**
   * 重置速度历史
   */
  resetVelocity() {
    this.velocityHistory = []
  }
  
  /**
   * 计算阻尼系数
   * @param {number} currentValue - 当前值
   * @param {number} minValue - 最小值
   * @param {number} maxValue - 最大值
   * @param {number} minDamping - 最小阻尼
   * @param {number} maxDamping - 最大阻尼
   * @returns {number} 阻尼系数
   */
  calculateDamping(currentValue, minValue, maxValue, minDamping = 0.3, maxDamping = 0.8) {
    const progress = (currentValue - minValue) / (maxValue - minValue)
    const clampedProgress = Math.max(0, Math.min(1, progress))
    
    // 使用缓动函数使阻尼变化更自然
    const easeProgress = this.easeInOutCubic(clampedProgress)
    return minDamping + (maxDamping - minDamping) * easeProgress
  }
  
  /**
   * 橡皮筋效果计算
   * @param {number} distance - 超出距离
   * @param {number} dimension - 维度大小
   * @returns {number} 实际移动距离
   */
  rubberBandEffect(distance, dimension) {
    const constant = 0.55
    const result = (distance * dimension * constant) / (dimension + constant * Math.abs(distance))
    return Math.round(result)
  }
  
  /**
   * 缓动函数 - ease-in-out-cubic
   * @param {number} t - 进度(0-1)
   * @returns {number} 缓动后的进度
   */
  easeInOutCubic(t) {
    return t < 0.5 
      ? 4 * t * t * t 
      : 1 - Math.pow(-2 * t + 2, 3) / 2
  }
  
  /**
   * 缓动函数 - ease-out-expo
   * @param {number} t - 进度(0-1)
   * @returns {number} 缓动后的进度
   */
  easeOutExpo(t) {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t)
  }
}

/**
 * 防抖函数
 * @param {Function} func - 要防抖的函数
 * @param {number} wait - 等待时间
 * @param {boolean} immediate - 是否立即执行
 * @returns {Function} 防抖后的函数
 */
export function debounce(func, wait, immediate = false) {
  let timeout
  return function(...args) {
    const later = () => {
      timeout = null
      if (!immediate) func.apply(this, args)
    }
    const callNow = immediate && !timeout
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
    if (callNow) func.apply(this, args)
  }
}

/**
 * 节流函数
 * @param {Function} func - 要节流的函数
 * @param {number} limit - 时间限制
 * @returns {Function} 节流后的函数
 */
export function throttle(func, limit) {
  let inThrottle
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

/**
 * 动画帧节流
 * @param {Function} func - 要节流的函数
 * @returns {Function} 节流后的函数
 */
export function rafThrottle(func) {
  let ticking = false
  return function(...args) {
    if (!ticking) {
      requestAnimationFrame(() => {
        func.apply(this, args)
        ticking = false
      })
      ticking = true
    }
  }
}
