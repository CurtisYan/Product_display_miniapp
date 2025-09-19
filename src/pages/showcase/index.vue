<template>
  <view class="showcase-page">
    <!-- Linear 风格头部 -->
    <view class="linear-header" :class="{ 'header-hidden': !headerVisible }">
      <view class="header-background">
        <view class="header-gradient"></view>
        <view class="header-decoration">
          <view class="decoration-circle circle-1"></view>
          <view class="decoration-circle circle-2"></view>
          <view class="decoration-circle circle-3"></view>
        </view>
      </view>
      <view class="header-content">
        <view class="header-left">
          <view class="title-container">
            <text class="page-title">主流产品展示</text>
          </view>
          <view class="favorite-btn" @tap="showFavoriteDrawer">
            <view class="favorite-icon-wrapper">
              <text class="star-icon">⭐</text>
              <view class="favorite-badge" v-if="favoriteProducts.length > 0">
                <text class="badge-text">{{ favoriteProducts.length }}</text>
              </view>
            </view>
          </view>
        </view>
        <view class="header-search">
          <view class="linear-search-box">
            <view class="search-input-wrapper">
              <input
                class="search-input"
                type="text"
                placeholder="搜索你想要的产品..."
                placeholder-style="color: rgba(255, 255, 255, 0.7); font-weight: 400;"
                v-model="searchKeyword"
                @input="onSearchInput"
                @confirm="onSearchConfirm"
              />
              <view class="search-icon" @tap="onSearchConfirm">
                <icon type="search" size="16" color="#8B5CF6" />
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- Linear 风格产品展示区域 -->
    <view class="linear-content-wrap">
      <view class="linear-grid" v-if="displayProducts.length">
        <view class="linear-card" v-for="p in displayProducts" :key="p.id" @tap="openDetail(p)">
          <view class="linear-img-wrapper">
            <LazyImage 
              :src="p.image" 
              mode="aspectFill"
              width="100%"
              height="100%"
              border-radius="12rpx 12rpx 0 0"
              :show-spinner="false"
            />
          </view>
          <view class="linear-info">
            <text class="linear-title">{{ p.name }}</text>
            <text class="linear-sub" v-if="p.sub">{{ p.sub }}</text>
          </view>
        </view>
      </view>
      <view v-else class="empty-products">
        <text class="empty-text">{{ isSearchMode ? '未找到相关产品' : '暂无产品' }}</text>
      </view>
    </view>

    <!-- 详情抽屉 -->
    <ProductDetailDrawer 
      v-model="showProductDetail"
      :product="selectedProduct"
      :images="detailImages"
      @share="onProductShare"
      @favorite="onProductFavorite"
    />

    <!-- Linear 风格收藏夹抽屉 -->
    <view v-if="showFavorites" 
          class="linear-favorite-mask" 
          @tap="hideFavoriteDrawer"
          @touchstart="onFavoriteStart"
          @touchmove="onFavoriteMove" 
          @touchend="onFavoriteEnd" />
    <view class="linear-favorite-drawer" 
          :class="{ 'linear-favorite-drawer--show': showFavorites }"
          @touchstart="onFavoriteStart"
          @touchmove="onFavoriteMove" 
          @touchend="onFavoriteEnd">
      <view class="linear-favorite-header">
        <text class="linear-favorite-title">我的收藏</text>
        <view class="linear-close-btn" @tap="hideFavoriteDrawer">
          <text class="linear-close-icon">×</text>
        </view>
      </view>
      <scroll-view class="linear-favorite-content" scroll-y>
        <view v-if="favoriteProducts.length === 0" class="linear-empty-favorites">
          <text class="linear-empty-text">还没有收藏任何产品</text>
        </view>
        <view v-else class="linear-favorite-list">
          <view 
            v-for="product in favoriteProducts" 
            :key="product.id" 
            class="linear-favorite-item"
            @tap="openDetail(product)"
          >
            <image class="linear-favorite-image" :src="product.image" mode="aspectFill" />
            <view class="linear-favorite-info">
              <text class="linear-favorite-name">{{ product.name }}</text>
              <text class="linear-favorite-desc" v-if="product.sub">{{ product.sub }}</text>
            </view>
            <view class="linear-remove-favorite" @tap.stop="removeFavorite(product.id)">
              <text class="linear-remove-icon">🗑️</text>
            </view>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 自定义底部导航栏 -->
    <CustomTabBar />
  </view>
</template>

<script>
import CustomTabBar from '../../components/CustomTabBar.vue'
import ProductDetailDrawer from '../../components/ProductDetailDrawer.vue'
import LazyImage from '../../components/LazyImage.vue'
import { getShowcaseProducts } from '../../shared/products.js'
import { setupPageShare } from '../../utils/share.js'

export default {
  name: 'ShowcasePage',
  components: {
    CustomTabBar,
    ProductDetailDrawer,
    LazyImage
  },
  data() {
    return {
      products: getShowcaseProducts(), // 从统一产品库获取展示页产品
      showProductDetail: false,
      selectedProduct: null,
      searchKeyword: '',
      isSearchMode: false,
      searchCache: new Map(), // 搜索结果缓存
      searchDebounceTimer: null, // 搜索防抖定时器
      showFavorites: false,
      favoriteProducts: [], // 收藏的产品列表
      // 头部滚动控制
      headerVisible: true,
      lastScrollTop: 0,
      scrollDirection: 'up',
      scrollVelocity: 0,
      // 收藏夹手势相关
      favoriteDragging: false,
      favoriteStartX: 0,
      favoriteStartY: 0,
      dragStartTime: 0,
      // 页面参数
      pageOptions: {},
      // 防止双击
      isOpeningDetail: false,
      openDetailTimer: null,
      hasHandledShareParams: false  // 添加标记位，防止重复处理分享参数
    }
  },
  computed: {
    detailImages() {
      const p = this.selectedProduct
      return p && p.images ? p.images : []
    },
    displayProducts() {
      if (this.isSearchMode && this.searchKeyword.trim()) {
        // 先检查缓存
        const cacheKey = this.searchKeyword.toLowerCase()
        if (this.searchCache.has(cacheKey)) {
          return this.searchCache.get(cacheKey)
        }
        
        // 执行搜索
        const searchTerm = this.searchKeyword.toLowerCase()
        const results = this.products.filter(p => {
          const nameMatch = p.name.toLowerCase().includes(searchTerm)
          const descMatch = p.sub && p.sub.toLowerCase().includes(searchTerm)
          return nameMatch || descMatch
        }).sort((a, b) => {
          // 名称匹配优先级更高
          const aNameMatch = a.name.toLowerCase().includes(searchTerm)
          const bNameMatch = b.name.toLowerCase().includes(searchTerm)
          if (aNameMatch && !bNameMatch) return -1
          if (!aNameMatch && bNameMatch) return 1
          return 0
        })
        
        // 缓存结果（限制缓存大小）
        if (this.searchCache.size > 50) {
          const firstKey = this.searchCache.keys().next().value
          this.searchCache.delete(firstKey)
        }
        this.searchCache.set(cacheKey, results)
        
        return results
      }
      return this.products
    }
  },
  created() {
    this.loadFavorites()
  },
  onShow() {
    console.log('onShow 触发 - 已处理分享参数标记:', this.hasHandledShareParams)
    // 页面显示时通知导航栏更新状态
    uni.$emit('updateTabBar')
    
    // 只在首次显示且未处理过分享参数时处理分享参数
    if (!this.hasHandledShareParams) {
      console.log('onShow - 开始处理分享参数')
      // 延迟一点确保页面完全加载
      setTimeout(() => {
        this.handleShareParams()
      }, 100)
    } else {
      console.log('onShow - 分享参数已处理过，跳过')
    }
  },
  onLoad(options) {
    // 保存页面参数，供后续使用
    this.pageOptions = options || {}
    console.log('onLoad 参数:', this.pageOptions)
  },
  // 微信小程序分享配置
  onShareAppMessage(res) {
    console.log('分享触发:', res)
    
    // 如果当前有打开的商品详情弹窗，分享该商品
    if (this.showProductDetail && this.selectedProduct) {
      console.log('分享商品:', this.selectedProduct.name)
      return setupPageShare({ product: this.selectedProduct })
    }
    
    // 如果有选中的商品但弹窗未打开，也分享该商品
    if (this.selectedProduct) {
      console.log('分享选中商品:', this.selectedProduct.name)
      return setupPageShare({ product: this.selectedProduct })
    }
    
    // 否则分享页面
    console.log('分享页面')
    return {
      title: '发现了一些不错的产品',
      path: '/pages/showcase/index',
      imageUrl: ''
    }
  },
  // 分享到朋友圈
  onShareTimeline() {
    if (this.selectedProduct) {
      return {
        title: `【${this.selectedProduct.name}】${this.selectedProduct.sub || ''}`,
        query: `productId=${this.selectedProduct.id}`,
        imageUrl: this.selectedProduct.image || ''
      }
    }
    return {
      title: '发现了一些不错的产品'
    }
  },
  onPageScroll(e) {
    this.handleScroll(e.scrollTop)
  },
  methods: {
    openDetail(p) {
      // 防止双击：如果已经在打开中或已经打开，直接返回
      if (this.isOpeningDetail || this.showProductDetail) return
      
      this.isOpeningDetail = true
      this.selectedProduct = p
      
      // 延迟一下再设置 showProductDetail，避免双击时的快速切换
      setTimeout(() => {
        this.showProductDetail = true
        // 500ms 后才允许再次操作
        setTimeout(() => {
          this.isOpeningDetail = false
        }, 500)
      }, 50)
    },
    onSearchInput() {
      const hasKeyword = this.searchKeyword.trim().length > 0
      
      if (!hasKeyword) {
        this.isSearchMode = false
        // 清除防抖定时器
        if (this.searchDebounceTimer) {
          clearTimeout(this.searchDebounceTimer)
          this.searchDebounceTimer = null
        }
        return
      }
      
      // 防抖处理 - 300ms后执行搜索
      if (this.searchDebounceTimer) {
        clearTimeout(this.searchDebounceTimer)
      }
      
      this.searchDebounceTimer = setTimeout(() => {
        this.isSearchMode = true
      }, 300)
    },
    onSearchConfirm() {
      // 清除防抖定时器
      if (this.searchDebounceTimer) {
        clearTimeout(this.searchDebounceTimer)
        this.searchDebounceTimer = null
      }
      // 立即执行搜索
      this.isSearchMode = this.searchKeyword.trim().length > 0
    },
    showFavoriteDrawer() {
      this.showFavorites = true
    },
    hideFavoriteDrawer() {
      this.showFavorites = false
    },
    onProductShare(product) {
      // 分享逻辑已由ProductDetailDrawer组件内部处理
      // 这里可以添加额外的统计或者其他业务逻辑
      console.log('分享产品:', product?.name)
      
      // 更新当前选中的商品，供页面分享使用
      this.selectedProduct = product
    },
    
    // 处理分享进入的参数
    handleShareParams() {
      // #ifdef MP-WEIXIN
      const pages = getCurrentPages()
      const currentPage = pages[pages.length - 1]
      const options = currentPage.options || {}
      
      console.log('处理分享参数 - 页面参数:', options)
      console.log('处理分享参数 - 当前商品数量:', this.products.length)
      console.log('处理分享参数 - 已处理标记:', this.hasHandledShareParams)
      
      // 如果有商品ID参数，直接打开对应商品
      if (options.productId && !this.hasHandledShareParams) {
        console.log('检测到商品ID参数:', options.productId)
        
        // 如果商品数据还没加载完成，等待加载
        if (this.products.length === 0) {
          console.log('商品数据未加载，等待加载完成...')
          // 延迟重试
          setTimeout(() => {
            this.handleShareParams()
          }, 500)
          return
        }
        
        // 先查找商品
        const product = this.products.find(p => p.id == options.productId)
        if (product) {
          console.log('找到分享的商品:', product.name)
          // 标记已处理分享参数（在打开前就标记，避免重复处理）
          this.hasHandledShareParams = true
          
          // 使用 nextTick 确保页面渲染完成后再打开
          this.$nextTick(() => {
            // 再延迟一点确保动画流畅
            setTimeout(() => {
              this.openDetail(product)
            }, 300)
          })
        } else {
          console.log('未找到商品ID:', options.productId, '可用商品:', this.products.map(p => ({id: p.id, name: p.name})))
          // 即使没找到商品也要标记已处理，避免无限重试
          this.hasHandledShareParams = true
        }
      }
      
      // 记录分享来源
      if (options.from === 'share' && !this.hasHandledShareParams) {
        console.log('从分享进入，商品名：', decodeURIComponent(options.productName || ''))
        // 可以进行统计或其他操作
        this.hasHandledShareParams = true
      }
      // #endif
    },
    onProductFavorite(product, isFavorite) {
      // 由ProductDetailDrawer组件内部处理，这里只需要重新加载收藏列表
      this.loadFavorites()
    },
    removeFavorite(productId) {
      const index = this.favoriteProducts.findIndex(p => p.id === productId)
      if (index !== -1) {
        this.favoriteProducts.splice(index, 1)
        this.saveFavorites()
        uni.showToast({ title: '已移除收藏', icon: 'success' })
      }
    },
    loadFavorites() {
      try {
        const favorites = uni.getStorageSync('favoriteProducts')
        if (favorites) {
          // 兼容不同的存储格式
          if (typeof favorites === 'string') {
            try {
              this.favoriteProducts = JSON.parse(favorites)
            } catch (e) {
              this.favoriteProducts = []
            }
          } else if (Array.isArray(favorites)) {
            this.favoriteProducts = favorites
          } else {
            this.favoriteProducts = []
          }
        }
      } catch (e) {
        console.error('加载收藏列表失败:', e)
      }
    },
    saveFavorites() {
      // 使用异步存储，避免阻塞主线程
      uni.setStorage({
        key: 'favoriteProducts',
        data: this.favoriteProducts, // 直接存储数组，不需要JSON.stringify
        fail: (e) => {
          console.error('保存收藏列表失败:', e)
        }
      })
    },
    // 处理滚动事件，完全模拟 YouTube/Instagram 的头部隐藏/显示逻辑
    handleScroll(scrollTop) {
      const scrollDiff = scrollTop - this.lastScrollTop
      const velocity = Math.abs(scrollDiff)
      
      // 更新滚动方向
      this.scrollDirection = scrollDiff > 0 ? 'down' : 'up'
      this.scrollVelocity = velocity
      
      // YouTube/Instagram 精确逻辑：
      // 1. 在顶部附近(60px内)总是显示头部
      if (scrollTop < 60) {
        this.headerVisible = true
      }
      // 2. 向下滚动：快速滚动时更敏感(5px)，慢速滚动需要15px
      else if (this.scrollDirection === 'down') {
        const threshold = velocity > 20 ? 5 : 15
        if (scrollDiff > threshold) {
          this.headerVisible = false
        }
      }
      // 3. 向上滚动：任何向上滚动都立即显示(2px阈值)
      else if (this.scrollDirection === 'up' && scrollDiff < -2) {
        this.headerVisible = true
      }
      
      this.lastScrollTop = scrollTop
    },
    // 收藏夹右滑关闭手势 - iOS标准手势
    onFavoriteStart(e) {
      const startX = e.touches[0].clientX
      const startY = e.touches[0].clientY
      
      // iOS标准：从左边缘20px内开始才触发
      if (startX < 20 || this.showFavorites) {
        this.favoriteDragging = true
        this.favoriteStartX = startX
        this.favoriteStartY = startY
        this.dragStartTime = Date.now()
      }
    },
    onFavoriteMove(e) {
      if (!this.favoriteDragging) return
      
      const currentX = e.touches[0].clientX
      const currentY = e.touches[0].clientY
      const deltaX = currentX - this.favoriteStartX
      const deltaY = Math.abs(currentY - this.favoriteStartY)
      
      // 判断是否为水平滑动（水平距离大于垂直距离）
      if (deltaX > deltaY) {
        // iOS标准手势判断：
        // 1. 滑动距离超过40px
        // 2. 滑动速度足够（通过时间判断）
        const timeDiff = Date.now() - this.dragStartTime
        const velocity = deltaX / timeDiff
        
        if (deltaX > 40 || velocity > 0.5) {
          // 直接关闭，不显示中间状态
          this.hideFavoriteDrawer()
          this.favoriteDragging = false
        }
      }
    },
    onFavoriteEnd(e) {
      this.favoriteDragging = false
    }
  }
}
</script>

<style scoped>
/* Linear 设计系统 CSS 变量 */
:root {
  --linear-primary: #8B5CF6;
  --linear-primary-dark: #7C3AED;
  --linear-primary-light: #A78BFA;
  --linear-secondary: #06B6D4;
  --linear-accent: #F59E0B;
  
  --linear-text-primary: #0F172A;
  --linear-text-secondary: #64748B;
  --linear-text-tertiary: #94A3B8;
  --linear-text-inverse: #FFFFFF;
  
  --linear-bg-primary: #FFFFFF;
  --linear-bg-secondary: #F8FAFC;
  --linear-bg-tertiary: #F1F5F9;
  
  --linear-border: #E2E8F0;
  --linear-border-light: #F1F5F9;
  
  --linear-shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --linear-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --linear-shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  
  --linear-radius: 16rpx;
  --linear-radius-lg: 24rpx;
  --linear-radius-xl: 32rpx;
}

.showcase-page {
  background: var(--linear-bg-secondary);
  min-height: 100vh;
  padding-bottom: 140rpx;
}

/* Linear 风格头部 */
.linear-header {
  position: sticky;
  top: 0;
  z-index: 100;
  padding: 20rpx 32rpx 24rpx;
  padding-top: calc(env(safe-area-inset-top) + 20rpx);
  overflow: hidden;
  transform: translateY(0);
  transition: transform 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.linear-header.header-hidden {
  transform: translateY(-100%);
}

.header-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
}

.header-gradient {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, var(--linear-primary) 0%, var(--linear-primary-dark) 50%, #8B5CF6 100%);
  opacity: 0.95;
}

.header-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
}

.decoration-circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  animation: float 6s ease-in-out infinite;
}

.circle-1 {
  width: 120rpx;
  height: 120rpx;
  top: 20rpx;
  right: 80rpx;
  animation-delay: 0s;
}

.circle-2 {
  width: 80rpx;
  height: 80rpx;
  top: 60rpx;
  right: 200rpx;
  animation-delay: 2s;
}

.circle-3 {
  width: 60rpx;
  height: 60rpx;
  top: 120rpx;
  right: 120rpx;
  animation-delay: 4s;
}

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20rpx) rotate(180deg); }
}

.header-content {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 24rpx;
}

.title-container {
  position: relative;
}

.page-title {
  font-size: 36rpx;
  font-weight: 700;
  color: #fff;
  text-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.2);
}

.title-decoration {
  position: absolute;
  bottom: -8rpx;
  left: 0;
  width: 60rpx;
  height: 4rpx;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 2rpx;
}

.favorite-btn {
  width: 80rpx;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.15);
  border: 1rpx solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  backdrop-filter: blur(20rpx) saturate(180%);
  box-shadow: 
    0 8rpx 32rpx rgba(0, 0, 0, 0.12),
    inset 0 1rpx 0 rgba(255, 255, 255, 0.3),
    inset 0 -1rpx 0 rgba(255, 255, 255, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.favorite-btn:active {
  transform: scale(0.95);
  background: rgba(255, 255, 255, 0.25);
  box-shadow: 
    0 4rpx 16rpx rgba(0, 0, 0, 0.15),
    inset 0 1rpx 0 rgba(255, 255, 255, 0.4),
    inset 0 -1rpx 0 rgba(255, 255, 255, 0.15);
}

.favorite-icon-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.star-icon {
  font-size: 32rpx;
  filter: drop-shadow(0 2rpx 4rpx rgba(0, 0, 0, 0.2));
}

.favorite-badge {
  position: absolute;
  top: -8rpx;
  right: -8rpx;
  min-width: 32rpx;
  height: 32rpx;
  background: #ff4757;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2rpx solid #fff;
}

.badge-text {
  font-size: 20rpx;
  color: #fff;
  font-weight: 600;
  line-height: 1;
}

.header-search {
  flex: 1;
  margin-left: 32rpx;
}

.linear-search-box {
  background: rgba(255, 255, 255, 0.25);
  border-radius: 50rpx;
  backdrop-filter: blur(10px);
  border: 1rpx solid rgba(255, 255, 255, 0.3);
}

.search-input-wrapper {
  display: flex;
  align-items: center;
  padding: 0 24rpx;
  height: 72rpx;
}

.search-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font-size: 28rpx;
  color: var(--linear-text-inverse);
  font-weight: 500;
  placeholder-color: rgba(255, 255, 255, 0.7);
}

.search-icon {
  margin-left: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48rpx;
  height: 48rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  transition: all 0.3s ease;
}

.search-icon:active {
  transform: scale(0.95);
  background: rgba(255, 255, 255, 0.3);
}

/* Linear 风格内容区域 */
.linear-content-wrap {
  padding: 24rpx;
}

.linear-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20rpx;
}

.linear-card {
  background: var(--linear-bg-primary);
  border-radius: var(--linear-radius-lg);
  overflow: hidden;
  border: 1px solid var(--linear-border-light);
  box-shadow: var(--linear-shadow-sm);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.linear-card:active {
  transform: scale(0.98);
  box-shadow: var(--linear-shadow);
}

.linear-img-wrapper {
  width: 100%;
  height: 240rpx;
  background: var(--linear-bg-tertiary);
  overflow: hidden;
  border-radius: 12rpx 12rpx 0 0;
}

.linear-info {
  padding: 20rpx;
}

.linear-title {
  font-size: 28rpx;
  color: var(--linear-text-primary);
  font-weight: 600;
  line-height: 1.4;
  letter-spacing: -0.3rpx;
}

.linear-sub {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-top: 8rpx;
  font-size: 24rpx;
  color: var(--linear-text-secondary);
  line-height: 1.4;
  font-weight: 500;
  letter-spacing: 0.2rpx;
}

.empty-products {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 400rpx;
  color: #ccc;
  font-size: 28rpx;
}

/* Linear 风格收藏夹抽屉样式 */
.linear-favorite-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.linear-favorite-drawer {
  position: fixed;
  top: 0;
  right: -600rpx;
  width: 600rpx;
  height: 100vh;
  background: var(--linear-bg-primary);
  z-index: 1001;
  transition: right 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: var(--linear-shadow-lg);
  display: flex;
  flex-direction: column;
  border-left: 1px solid var(--linear-border);
}

.linear-favorite-drawer--show {
  right: 0;
}

.linear-favorite-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 40rpx 32rpx 20rpx;
  border-bottom: 1px solid var(--linear-border-light);
  background: linear-gradient(135deg, var(--linear-bg-secondary) 0%, var(--linear-bg-tertiary) 100%);
}

.linear-favorite-title {
  font-size: 32rpx;
  font-weight: 600;
  color: var(--linear-text-primary);
}

.linear-close-btn {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--linear-bg-tertiary);
  border-radius: 50%;
  border: 1px solid var(--linear-border);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.linear-close-btn:active {
  background: var(--linear-bg-secondary);
  transform: scale(0.95);
  box-shadow: var(--linear-shadow-sm);
}

.linear-close-icon {
  font-size: 36rpx;
  color: var(--linear-text-secondary);
  font-weight: bold;
}

.linear-favorite-content {
  flex: 1;
  padding: 0;
}

.linear-empty-favorites {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 400rpx;
  color: var(--linear-text-tertiary);
  font-size: 28rpx;
  background: var(--linear-bg-tertiary);
  margin: 24rpx;
  border-radius: var(--linear-radius-lg);
}

.linear-favorite-list {
  padding: 20rpx 0;
}

.linear-favorite-item {
  display: flex;
  align-items: center;
  padding: 24rpx 32rpx;
  border-bottom: 1px solid var(--linear-border-light);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.linear-favorite-item:active {
  background: var(--linear-bg-secondary);
  transform: translateX(-4rpx);
}

.linear-favorite-image {
  width: 120rpx;
  height: 120rpx;
  border-radius: var(--linear-radius-lg);
  background: var(--linear-bg-tertiary);
  margin-right: 24rpx;
  flex-shrink: 0;
  border: 1px solid var(--linear-border-light);
}

.linear-favorite-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  margin-right: 16rpx;
}

.linear-favorite-name {
  font-size: 28rpx;
  font-weight: 600;
  color: var(--linear-text-primary);
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.linear-favorite-desc {
  font-size: 24rpx;
  color: var(--linear-text-secondary);
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.linear-remove-favorite {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--linear-bg-tertiary);
  border-radius: 50%;
  border: 1px solid var(--linear-border);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  flex-shrink: 0;
}

.linear-remove-favorite:active {
  background: #fee2e2;
  border-color: #fecaca;
  transform: scale(0.95);
  box-shadow: var(--linear-shadow-sm);
}

.linear-remove-icon {
  font-size: 24rpx;
}
</style>
