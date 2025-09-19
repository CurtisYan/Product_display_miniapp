<template>
  <view v-if="visible" class="drawer-container" @touchmove.stop.prevent>
    <!-- 遮罩层 -->
    <view 
      class="drawer-mask" 
      :style="{ opacity: maskOpacity, transition: maskTransition }" 
      @tap="close"
    />

    <!-- 底部弹出层 -->
    <view 
      class="drawer-sheet" 
      :style="{ 
        transform: `translateY(${translateY}px)`,
        transition: sheetTransition,
        height: `${sheetHeight}px`
      }"
      @touchstart="onTouchStart"
      @touchmove="onTouchMove" 
      @touchend="onTouchEnd"
    >
      <!-- 顶部拖拽区 -->
      <view class="drag-header">
        <view class="drag-handle" />
        <view class="header-content">
          <view class="header-info">
            <text class="header-title">{{ product?.name || '产品详情' }}</text>
            <text class="header-subtitle" v-if="product?.sub">{{ product.sub }}</text>
          </view>
          <view class="header-actions">
            <!-- 微信小程序分享按钮 -->
            <!-- #ifdef MP-WEIXIN -->
            <button class="action-button" open-type="share" data-action="share">
              <text class="action-text">分享</text>
            </button>
            <!-- #endif -->
            <!-- 非微信环境分享按钮 -->
            <!-- #ifndef MP-WEIXIN -->
            <view class="action-button" data-action="share" @tap.stop="handleShare">
              <text class="action-text">分享</text>
            </view>
            <!-- #endif -->
            <view 
              class="action-button" 
              :class="{ active: isFavorited }" 
              data-action="favorite" 
              @tap.stop="handleFavorite"
            >
              <text class="action-text">{{ isFavorited ? '已收藏' : '收藏' }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 内容区域 -->
      <scroll-view
        class="drawer-content"
        :style="{ height: contentHeight + 'px' }"
        scroll-y
        enhanced
        :show-scrollbar="false"
        @scroll="onScroll"
      >
        <!-- 商品描述 -->
        <view class="product-description" v-if="product?.description || product?.desc">
          <text class="description-text">{{ product.description || product.desc }}</text>
        </view>

        <!-- 图片列表 -->
        <view class="image-list" v-if="displayImages.length">
          <image 
            v-for="(img, idx) in displayImages" 
            :key="idx" 
            class="product-image" 
            :src="img" 
            mode="widthFix" 
            @tap="previewImage(idx)" 
          />
        </view>

        <!-- 扩展插槽 -->
        <slot />

        <!-- 底部安全区 -->
        <view class="safe-area" />
      </scroll-view>
    </view>
    
    <!-- 分享引导 -->
    <ShareGuide ref="shareGuide" subtitle="分享给朋友或保存图片" />
  </view>
</template>

<script>
import { saveShareRecord } from '../utils/share.js'
import ShareGuide from './ShareGuide.vue'

export default {
  name: 'ProductDetailDrawer',
  components: {
    ShareGuide
  },
  props: {
    modelValue: { 
      type: Boolean, 
      default: false 
    },
    product: { 
      type: Object, 
      default: null 
    },
    images: { 
      type: Array, 
      default: () => [] 
    }
  },
  emits: ['update:modelValue', 'favorite', 'share'],
  data() {
    return {
      // 显示状态
      visible: false,
      
      // 动画相关
      translateY: 0,
      maskOpacity: 0,
      sheetTransition: 'none',
      maskTransition: 'none',
      
      // 尺寸相关
      windowHeight: 0,
      sheetHeight: 0,
      contentHeight: 0,
      safeAreaBottom: 0,
      headerHeight: 88, // 顶部区域高度
      
      // 手势相关
      isDragging: false,
      startY: 0,
      lastY: 0,
      lastTime: 0,
      velocity: 0,
      
      // 滚动相关
      scrollTop: 0,
      
      // 收藏状态
      isFavorited: false,
      
      // 浏览器历史
      historyPushed: false
    }
  },
  computed: {
    displayImages() {
      if (this.images?.length) return this.images
      if (this.product?.images?.length) return this.product.images
      return []
    }
  },
  watch: {
    modelValue: {
      immediate: true,
      handler(val) {
        if (val) this.open()
        else this.close(false)
      }
    },
    product: {
      handler() {
        this.checkFavoriteStatus()
      }
    }
  },
  mounted() {
    this.initSizes()
    // 监听窗口变化
    if (uni?.onWindowResize) {
      uni.onWindowResize(() => this.initSizes())
    }
    // 监听浏览器后退
    if (typeof window !== 'undefined') {
      window.addEventListener('popstate', (e) => this.onPopState(e))
    }
  },
  beforeUnmount() {
    if (uni?.offWindowResize) {
      uni.offWindowResize(() => this.initSizes())
    }
    if (typeof window !== 'undefined') {
      window.removeEventListener('popstate', this.onPopState)
    }
  },
  methods: {
    // 初始化尺寸
    initSizes() {
      try {
        const sys = uni.getSystemInfoSync()
        this.windowHeight = sys.windowHeight || 800
        this.safeAreaBottom = sys.safeAreaInsets?.bottom || 0
        // 设置弹出层高度为屏幕高度的96%
        this.sheetHeight = Math.round(this.windowHeight * 0.96)
        // 内容区高度 = 弹出层高度 - 头部高度 - 底部安全区
        this.contentHeight = this.sheetHeight - this.headerHeight - this.safeAreaBottom
      } catch {
        // 使用默认值
        this.windowHeight = 800
        this.sheetHeight = 768
        this.contentHeight = 680
      }
    },
    
    // 打开弹出层
    open() {
      if (this.visible) return
      
      // 重新初始化尺寸，确保高度正确
      this.initSizes()
      
      this.visible = true
      this.checkFavoriteStatus()
      this.lockBodyScroll()
      
      // 推入浏览器历史
      if (typeof window !== 'undefined' && !this.historyPushed) {
        try {
          window.history.pushState({ drawer: true }, '')
          this.historyPushed = true
        } catch {}
      }
      
      // 确保有高度值
      if (!this.sheetHeight) {
        this.sheetHeight = 768
        this.contentHeight = 680
      }
      
      // 初始化位置
      this.translateY = this.sheetHeight
      this.maskOpacity = 0
      
      // 执行入场动画
      this.$nextTick(() => {
        setTimeout(() => {
          this.sheetTransition = 'transform 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
          this.maskTransition = 'opacity 0.35s ease-out'
          this.translateY = 0
          this.maskOpacity = 1
        }, 16)
      })
    },
    
    // 关闭弹出层
    close(fromUser = true) {
      if (!this.visible) return
      
      // 如果是用户主动关闭且有历史记录，则后退
      if (fromUser && this.historyPushed && typeof window !== 'undefined') {
        window.history.back()
        return
      }
      
      // 执行关闭动画 - 同时动画遮罩和弹出层
      this.sheetTransition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      this.maskTransition = 'opacity 0.3s ease-in'
      this.translateY = this.sheetHeight
      this.maskOpacity = 0
      
      // 动画结束后清理
      setTimeout(() => {
        this.visible = false
        this.historyPushed = false
        this.unlockBodyScroll()
        this.$emit('update:modelValue', false)
      }, 300)
    },
    
    // 触摸开始
    onTouchStart(e) {
      // 如果点击在按钮上，不处理
      if (e.target?.dataset?.action) return
      
      const { clientY } = e.touches[0]
      this.isDragging = true
      this.startY = clientY
      this.lastY = clientY
      this.lastTime = Date.now()
      this.velocity = 0
      
      // 关闭过渡动画
      this.sheetTransition = 'none'
      this.maskTransition = 'none'
    },
    
    // 触摸移动
    onTouchMove(e) {
      if (!this.isDragging) return
      
      const { clientY } = e.touches[0]
      const deltaY = clientY - this.startY
      const currentTime = Date.now()
      
      // 计算速度
      const timeDelta = currentTime - this.lastTime
      if (timeDelta > 0 && timeDelta < 100) {
        const instantVelocity = (clientY - this.lastY) / timeDelta * 1000
        // 速度平滑：0.7 旧速度 + 0.3 新速度
        this.velocity = this.velocity * 0.7 + instantVelocity * 0.3
      }
      
      this.lastY = clientY
      this.lastTime = currentTime
      
      // 只允许向下拖动关闭
      if (deltaY > 0) {
        // 如果内容已滚动，不允许拖动
        if (this.scrollTop > 5) return
        
        // 更新位置和遮罩透明度
        this.translateY = deltaY
        this.maskOpacity = Math.max(0, 1 - deltaY / this.sheetHeight)
      }
    },
    
    // 触摸结束
    onTouchEnd() {
      if (!this.isDragging) return
      this.isDragging = false
      
      const shouldClose = this.translateY > this.sheetHeight * 0.3 || this.velocity > 500
      
      if (shouldClose) {
        this.close()
      } else {
        // 回弹动画
        this.sheetTransition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        this.maskTransition = 'opacity 0.3s ease-out'
        this.translateY = 0
        this.maskOpacity = 1
      }
      
      this.velocity = 0
    },
    
    // 内容滚动
    onScroll(e) {
      this.scrollTop = e.detail?.scrollTop || 0
    },
    
    // 预览图片
    previewImage(index) {
      uni.previewImage({
        current: index,
        urls: this.displayImages
      })
    },
    
    // 处理分享
    handleShare() {
      console.log('ProductDetailDrawer - 处理分享:', this.product?.name)
      
      // #ifdef MP-WEIXIN
      this.$refs.shareGuide?.show()
      saveShareRecord(this.product, 'menu')
      // #endif
      
      // #ifndef MP-WEIXIN
      this.showShareMenu()
      // #endif
      
      // 通知父组件更新选中的商品，确保分享时使用正确的商品信息
      this.$emit('share', this.product)
    },
    
    // 显示分享菜单
    showShareMenu() {
      uni.showActionSheet({
        itemList: ['复制商品信息', '生成分享海报'],
        success: (res) => {
          if (res.tapIndex === 0) {
            this.copyProductInfo()
          } else if (res.tapIndex === 1) {
            this.generatePoster()
          }
        }
      })
    },
    
    // 复制商品信息
    copyProductInfo() {
      const info = `${this.product.name}${this.product.sub ? '\n' + this.product.sub : ''}`
      uni.setClipboardData({
        data: info,
        success: () => {
          uni.showToast({
            title: '已复制',
            icon: 'success'
          })
        }
      })
    },
    
    // 生成海报
    generatePoster() {
      uni.showToast({
        title: '功能开发中',
        icon: 'none'
      })
    },
    
    // 处理收藏
    handleFavorite() {
      const favorites = uni.getStorageSync('favoriteProducts') || []
      const list = Array.isArray(favorites) ? favorites : []
      const index = list.findIndex(p => p?.id === this.product?.id)
      
      if (index === -1) {
        // 添加收藏
        list.push({
          ...this.product,
          favoriteTime: Date.now()
        })
        this.isFavorited = true
        uni.showToast({ title: '已收藏', icon: 'success' })
      } else {
        // 取消收藏
        list.splice(index, 1)
        this.isFavorited = false
        uni.showToast({ title: '已取消', icon: 'success' })
      }
      
      uni.setStorageSync('favoriteProducts', list)
      this.$emit('favorite', this.product, this.isFavorited)
    },
    
    // 检查收藏状态
    checkFavoriteStatus() {
      if (!this.product?.id) {
        this.isFavorited = false
        return
      }
      const favorites = uni.getStorageSync('favoriteProducts') || []
      const list = Array.isArray(favorites) ? favorites : []
      this.isFavorited = list.some(p => p?.id === this.product.id)
    },
    
    // 浏览器后退处理
    onPopState() {
      if (this.visible) {
        this.close(false)
      }
    },
    
    // 锁定页面滚动
    lockBodyScroll() {
      if (typeof document !== 'undefined') {
        const scrollY = window.scrollY
        document.body.style.position = 'fixed'
        document.body.style.top = `-${scrollY}px`
        document.body.style.width = '100%'
        document.body.dataset.scrollY = String(scrollY)
      }
    },
    
    // 解锁页面滚动
    unlockBodyScroll() {
      if (typeof document !== 'undefined') {
        const scrollY = Number(document.body.dataset.scrollY || 0)
        document.body.style.position = ''
        document.body.style.top = ''
        document.body.style.width = ''
        window.scrollTo(0, scrollY)
      }
    }
  }
}
</script>

<style scoped>
/* 容器 */
.drawer-container {
  position: fixed;
  inset: 0;
  z-index: 3000;
  touch-action: none;
}

/* 遮罩层 */
.drawer-mask {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  will-change: opacity;
}

/* 弹出层 */
.drawer-sheet {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  background: #fff;
  border-radius: 24rpx 24rpx 0 0;
  box-shadow: 0 -4rpx 40rpx rgba(0, 0, 0, 0.12);
  will-change: transform;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-sizing: border-box;
}

/* 顶部拖拽区 */
.drag-header {
  flex-shrink: 0;
  padding: 16rpx 24rpx 12rpx;
  user-select: none;
}

.drag-handle {
  width: 80rpx;
  height: 8rpx;
  background: #e0e0e0;
  border-radius: 100rpx;
  margin: 0 auto 20rpx;
}

/* 头部内容 */
.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-info {
  flex: 1;
  min-width: 0;
  margin-right: 20rpx;
}

.header-title {
  display: block;
  font-size: 34rpx;
  font-weight: 600;
  color: #1a1a1a;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.header-subtitle {
  display: block;
  margin-top: 8rpx;
  font-size: 26rpx;
  color: #666;
  line-height: 1.4;
}

/* 操作按钮 */
.header-actions {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.action-button {
  height: 64rpx;
  padding: 0 24rpx;
  background: #f5f5f5;
  border-radius: 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  border: none;
  margin: 0;
  box-sizing: border-box;
}

.action-button:active {
  transform: scale(0.95);
  background: #e8e8e8;
}

.action-button.active {
  background: #6a5acd;
}

.action-button.active .action-text {
  color: #fff;
}

.action-text {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
}

/* 微信按钮重置 */
button.action-button::after {
  display: none;
}

/* 内容区域 */
.drawer-content {
  flex: 1;
  overflow-y: auto;
}

/* 商品描述 */
.product-description {
  margin: 0 24rpx 24rpx;
}

.description-text {
  font-size: 28rpx;
  color: #333;
  line-height: 1.6;
  word-wrap: break-word;
  word-break: break-all;
}

/* 图片列表 */
.image-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  padding: 0 24rpx;
}

.product-image {
  width: 100%;
  border-radius: 16rpx;
  background: #f5f5f5;
  display: block;
}

/* 安全区 */
.safe-area {
  height: env(safe-area-inset-bottom);
  min-height: 20rpx;
  padding: 0 24rpx;
}
</style>
