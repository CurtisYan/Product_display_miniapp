<template>
  <view class="linear-category-page">
    <!-- Linear 风格导航栏 -->
    <view class="linear-header">
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
            <text class="page-title">产品分类</text>
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
                placeholder="搜索你想要的商品..."
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

    <!-- 加载状态 -->
    <view v-if="loading" class="loading-container">
      <text class="loading-text">正在加载分类数据...</text>
    </view>

    <!-- Linear 风格主要内容区域 -->
    <view v-else class="linear-content-container">
      <!-- 左侧：Linear 风格主分类列表 -->
      <scroll-view class="linear-left-categories" scroll-y>
        <view
          v-for="category in categories"
          :key="category.id"
          class="linear-category-item"
          :class="{ 'linear-category-item--active': category.id === activeCategory }"
          @tap="selectMainCategory(category.id)"
        >
          <text class="linear-category-name">{{ category.name }}</text>
        </view>
      </scroll-view>

      <!-- 右侧：Linear 风格子分类和商品展示 -->
      <view class="linear-right-content">
        <!-- Linear 风格子分类标签栏 -->
        <view v-if="currentCategoryData?.children?.length && !isSearchMode" class="linear-subcategory-tabs">
          <scroll-view 
            class="linear-tabs-scroll" 
            scroll-x 
            :show-scrollbar="false"
            :enable-flex="true"
            :scroll-with-animation="true"
            :scroll-left="tabsScrollLeft"
          >
            <view class="linear-tabs-container">
              <text
                v-for="(sub, index) in currentCategoryData.children"
                :key="sub.id"
                :id="sub.id"
                class="linear-tab-item"
                :class="{ 'linear-tab-item--active': sub.id === activeSubcategory }"
                hover-class="none"
                hover-stop-propagation="true"
                @tap="scrollToSubcategory(sub.id)"
              >
                {{ sub.name }}
              </text>
            </view>
          </scroll-view>
          <!-- 滑动提示渐变 -->
          <view class="tabs-gradient-left"></view>
          <view class="tabs-gradient-right"></view>
        </view>

        <!-- Linear 风格商品展示区域 -->
        <scroll-view 
          class="linear-products-container" 
          scroll-y 
          :scroll-into-view="scrollTarget"
          :scroll-with-animation="false"
          enable-flex
          enhanced
          @scroll="onScroll"
        >
          <!-- 搜索模式 -->
          <view v-if="isSearchMode" class="linear-search-results-section">
            <view class="linear-section-title">
              <text class="linear-title-text">搜索结果</text>
              <text class="linear-product-count">({{ searchResults.length }}个商品)</text>
            </view>
            <ProductGrid 
              v-if="searchResults.length" 
              :products="searchResults" 
              @select="onProductSelect" 
            />
            <view v-else class="linear-empty-products">
              <text class="linear-empty-text">未找到相关商品</text>
            </view>
          </view>
          
          <!-- 正常分类模式：显示当前分类下的所有子分类和商品 -->
          <view v-else-if="currentCategoryData" class="linear-category-content">
            <view 
              v-for="subcategory in currentCategoryData.children" 
              :key="subcategory.id" 
              class="linear-subcategory-section"
              :id="'subcategory-' + subcategory.id"
            >
              <view class="linear-section-title">
                <view class="linear-title-content-wrapper">
                  <text class="linear-title-text">{{ subcategory.name }}</text>
                  <text class="linear-product-count">({{ subcategory.products?.length || 0 }}个商品)</text>
                </view>
              </view>
              <ProductGrid 
                v-if="subcategory.products?.length" 
                :products="subcategory.products" 
                @select="onProductSelect" 
              />
              <view v-else class="linear-empty-products">
                <text class="linear-empty-text">暂无商品</text>
              </view>
            </view>
          </view>
        </scroll-view>

      </view>
    </view>

    <!-- 商品详情弹窗 -->
    <ProductDetailDrawer 
      v-model="showProductDetail" 
      :product="selectedProduct" 
      :images="selectedProduct?.images || []"
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
          <text class="linear-empty-text">暂无收藏商品</text>
        </view>
        <view v-else class="linear-favorite-list">
          <view 
            v-for="product in favoriteProducts" 
            :key="product.id" 
            class="linear-favorite-item"
            @tap="onFavoriteProductSelect(product)"
          >
            <image class="linear-favorite-image" :src="product.image" mode="aspectFill" />
            <view class="linear-favorite-info">
              <text class="linear-favorite-name">{{ product.name }}</text>
              <text class="linear-favorite-desc">{{ product.description || product.sub || '暂无描述' }}</text>
            </view>
            <view class="linear-remove-favorite" @tap.stop="removeFavorite(product)">
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
import { fetchCategories } from './data-mock.js'
import ProductGrid from '../../components/ProductGrid.vue'
import ProductDetailDrawer from '../../components/ProductDetailDrawer.vue'
import CustomTabBar from '../../components/CustomTabBar.vue'

export default {
  name: 'CategoryPage',
  components: {
    ProductGrid,
    ProductDetailDrawer,
    CustomTabBar
  },
  data() {
    return {
      loading: true,
      categories: [],
      activeCategory: null,
      activeSubcategory: null,
      // tabs滚动与动画
      tabsScrollLeft: 0, // 控制chips栏scroll-left，实现“尽量居中”
      ANIM_DURATION: 180, // 稍微更干脆的时长，降低延迟感
      scrollTarget: '',
      
      // 搜索相关
      searchKeyword: '',
      isSearchMode: false,
      searchResults: [],
      searchCache: new Map(), // 搜索结果缓存
      searchDebounceTimer: null, // 搜索防抖定时器
      
      // 商品详情相关
      showProductDetail: false,
      selectedProduct: null,
      
      // 收藏夹相关
      showFavorites: false,
      favoriteProducts: [],
      
      // 滚动相关
      isScrollingToTarget: false,
      isProgrammaticTabScroll: false,
      tabScrollTimer: null,
      // tabs 布局缓存（减少每次点击的异步测量延迟）
      tabsLayoutReady: false,
      tabsContainerWidth: 0,
      tabsMaxScroll: 0,
      chipMeta: {}, // { [id]: { left: number, width: number } } 以容器为参考系
      scrollTimer: null,
      // 收藏夹手势相关
      favoriteDragging: false,
      favoriteStartX: 0,
      favoriteStartY: 0,
      dragStartTime: 0,
      // 防止双击
      isOpeningDetail: false,
      openDetailTimer: null
    }
  },
  computed: {
    // 当前主分类数据
    currentCategoryData() {
      return this.categories.find(cat => cat.id === this.activeCategory) || null
    }
  },
  async created() {
    // 先读本地缓存，提升首屏速度
    this.loadCategoriesFromCache()
    // 后台刷新最新数据
    this.refreshCategories()
    this.loadFavorites()
  },
  onLoad() {
    // 原有逻辑保留
  },
  onReady() {
    // 页面初次渲染完成后预先测量 tabs 布局，减少点击时的异步测量
    this.$nextTick(() => {
      this.measureTabsLayout(this.activeSubcategory || '')
    })
  },
  onShow() {
    // 返回页面或切换分类后再次测量，保持缓存新鲜
    this.$nextTick(() => {
      this.measureTabsLayout()
    })
    // 页面显示时通知导航栏更新状态
    uni.$emit('updateTabBar')
  },
  methods: {
    // 从本地缓存加载分类数据（若有），快速首屏
    loadCategoriesFromCache() {
      try {
        const cache = uni.getStorageSync('categoriesCache')
        if (cache && Array.isArray(cache.data)) {
          this.categories = cache.data
          if (cache.data.length > 0) {
            this.activeCategory = cache.data[0].id
            if (cache.data[0].children?.length > 0) {
              this.activeSubcategory = cache.data[0].children[0].id
            }
          }
          this.loading = false
        }
      } catch (e) {
        // 忽略缓存异常
      }
    },

    // 刷新分类数据并写入缓存
    async refreshCategories() {
      try {
        const data = await fetchCategories()
        this.categories = data
        // 默认选中第一个主分类和第一个子分类
        if (data.length > 0) {
          this.activeCategory = data[0].id
          if (data[0].children?.length > 0) {
            this.activeSubcategory = data[0].children[0].id
          }
        }
        // 写入本地缓存 - 使用异步存储
        uni.setStorage({
          key: 'categoriesCache',
          data: { data, time: Date.now() }
        })
      } catch (error) {
        console.error('刷新分类数据失败:', error)
        if (this.categories.length === 0) {
          uni.showToast({ title: '加载失败，请重试', icon: 'none' })
        }
      } finally {
        this.loading = false
      }
    },
    
    // 选择主分类
    selectMainCategory(categoryId) {
      if (this.activeCategory === categoryId) return
      
      this.activeCategory = categoryId
      
      // 退出搜索模式
      this.isSearchMode = false
      this.searchKeyword = ''
      this.searchResults = []
      
      // 自动选中该分类下的第一个子分类
      const category = this.categories.find(cat => cat.id === categoryId)
      if (category?.children?.length > 0) {
        this.activeSubcategory = category.children[0].id
      } else {
        this.activeSubcategory = ''
      }
      
      // 重置滚动位置
      this.scrollTarget = ''
    },
    
    // 点击 chip 滚动到对应子分类
    scrollToSubcategory(subcategoryId) {
      // 若重复点击相同chip，仍尝试居中
      if (this.activeSubcategory === subcategoryId) {
        this.centerActiveTab(subcategoryId)
        return
      }
      
      this.activeSubcategory = subcategoryId
      this.isScrollingToTarget = true
      
      // 将活跃chip尽量居中
      this.centerActiveTab(subcategoryId)
      
      // 触发内容区滚动到对应小节
      this.scrollTarget = ''
      this.$nextTick(() => {
        this.scrollTarget = `subcategory-${subcategoryId}`
        setTimeout(() => {
          this.isScrollingToTarget = false
        }, this.ANIM_DURATION)
      })
    },
    
    // 滚动监听，用于更新当前高亮的 chip
    onScroll(e) {
      if (this.isScrollingToTarget) return // 程序化滚动时不更新高亮
      if (this.isSearchMode) return // 搜索模式下不处理
      if (!this.currentCategoryData?.children?.length) return
      
      // 防抖处理 - 增加防抖时间到200ms
      if (this.scrollTimer) {
        clearTimeout(this.scrollTimer)
      }
      
      this.scrollTimer = setTimeout(() => {
        this.updateActiveSubcategoryByScroll(e.detail)
      }, 200)
    },
    
    // 根据滚动位置更新当前高亮的子分类 - 简化版本
    updateActiveSubcategoryByScroll(scrollDetail) {
      if (!this.currentCategoryData?.children?.length) return
      
      // 使用滚动事件的 scrollTop 直接计算，避免大量DOM查询
      const scrollTop = scrollDetail.scrollTop
      const viewHeight = scrollDetail.scrollHeight / this.currentCategoryData.children.length
      
      // 简单计算当前应该高亮的索引
      const estimatedIndex = Math.floor(scrollTop / viewHeight)
      const targetIndex = Math.min(
        Math.max(0, estimatedIndex),
        this.currentCategoryData.children.length - 1
      )
      
      const targetId = this.currentCategoryData.children[targetIndex].id
      if (targetId !== this.activeSubcategory) {
        this.activeSubcategory = targetId
        // 同时更新chips栏滚动位置（尽量居中）
        this.centerActiveTab(targetId)
      }
    },
    
    // 将活跃 chip 尽量滚动到可视区域中间（优先使用缓存，回退异步测量）
    centerActiveTab(targetId) {
      // 1) 缓存可用：同步计算，响应迅速
      if (this.tabsLayoutReady && this.chipMeta && this.chipMeta[targetId]) {
        const meta = this.chipMeta[targetId]
        const containerWidth = this.tabsContainerWidth || 0
        const maxScroll = this.tabsMaxScroll || 0
        if (containerWidth > 0 && maxScroll >= 0) {
          let target = meta.left - (containerWidth - meta.width) / 2
          if (target < 0) target = 0
          if (target > maxScroll) target = maxScroll
          this.isProgrammaticTabScroll = true
          this.tabsScrollLeft = Math.round(target)
          if (this.tabScrollTimer) clearTimeout(this.tabScrollTimer)
          this.tabScrollTimer = setTimeout(() => {
            this.isProgrammaticTabScroll = false
          }, this.ANIM_DURATION)
          return
        }
      }

      // 2) 缓存不可用：测量并缓存后再计算
      this.measureTabsLayout(targetId)
    },

    // 测量 tabs 容器与 chips 布局，生成缓存，完成后可选地将 targetId 居中
    measureTabsLayout(targetIdAfterMeasure = '') {
      try {
        const q = uni.createSelectorQuery().in(this)
        q.select('.linear-tabs-scroll').boundingClientRect()
        q.select('.linear-tabs-scroll').scrollOffset()
        q.selectAll('.linear-tab-item').boundingClientRect()
        q.exec(res => {
          const containerRect = res && res[0]
          const containerScroll = res && res[1]
          const chipsRects = (res && res[2]) || []
          if (!containerRect || !containerScroll || !chipsRects.length) return

          const containerLeft = containerRect.left
          const containerWidth = containerRect.width
          const scrollWidth = containerScroll.scrollWidth || 0
          const maxScroll = Math.max(0, scrollWidth - containerWidth)

          const metaMap = {}
          chipsRects.forEach(r => {
            // r.left 为屏幕左相对坐标，转换为容器参考系：r.left - containerLeft + currentScrollLeft
            const leftInContainer = (r.left - containerLeft) + (containerScroll.scrollLeft || 0)
            metaMap[r.id] = { left: leftInContainer, width: r.width }
          })

          this.tabsContainerWidth = containerWidth
          this.tabsMaxScroll = maxScroll
          this.chipMeta = metaMap
          this.tabsLayoutReady = true

          if (targetIdAfterMeasure) {
            this.centerActiveTab(targetIdAfterMeasure)
          }
        })
      } catch (e) {
        // ignore
      }
    },
    
    // 选择商品
    onProductSelect(product) {
      // 防止双击：如果已经在打开中或已经打开，直接返回
      if (this.isOpeningDetail || this.showProductDetail) return
      
      this.isOpeningDetail = true
      this.selectedProduct = product
      
      // 延迟一下再设置 showProductDetail，避免双击时的快速切换
      setTimeout(() => {
        this.showProductDetail = true
        // 500ms 后才允许再次操作
        setTimeout(() => {
          this.isOpeningDetail = false
        }, 500)
      }, 50)
    },
    
    // 商品分享 - 可选，如果需要额外处理
    onProductShare(product) {
      // 分享逻辑已由ProductDetailDrawer组件内部处理
      // 这里可以添加额外的统计或者其他业务逻辑
      console.log('分享商品:', product?.name)
    },
    
    // 商品收藏 - 由ProductDetailDrawer组件内部处理，这里只需要重新加载收藏列表
    onProductFavorite(product, isFavorite) {
      // 重新加载收藏列表以保持同步
      this.loadFavorites()
    },
    

    
    // 搜索输入处理 - 添加防抖
    onSearchInput(e) {
      const keyword = e.detail.value.trim()
      this.searchKeyword = keyword
      
      if (keyword === '') {
        this.isSearchMode = false
        this.searchResults = []
        // 清除防抖定时器
        if (this.searchDebounceTimer) {
          clearTimeout(this.searchDebounceTimer)
          this.searchDebounceTimer = null
        }
        return
      }
      
      // 防抖处理 - 用户停止输入300ms后才执行搜索
      if (this.searchDebounceTimer) {
        clearTimeout(this.searchDebounceTimer)
      }
      
      this.searchDebounceTimer = setTimeout(() => {
        this.performSearch(keyword)
      }, 300)
    },
    
    // 搜索确认 - 立即执行搜索
    onSearchConfirm() {
      if (this.searchKeyword.trim()) {
        // 清除防抖定时器
        if (this.searchDebounceTimer) {
          clearTimeout(this.searchDebounceTimer)
          this.searchDebounceTimer = null
        }
        // 立即执行搜索
        this.performSearch(this.searchKeyword.trim())
      }
    },
    
    // 执行搜索 - 添加缓存优化
    performSearch(keyword) {
      this.isSearchMode = true
      
      // 先检查缓存
      const cacheKey = keyword.toLowerCase()
      if (this.searchCache.has(cacheKey)) {
        // 直接使用缓存的结果
        this.searchResults = this.searchCache.get(cacheKey)
        return
      }
      
      // 执行搜索
      const results = []
      const searchTerm = keyword.toLowerCase()
      
      // 遍历所有分类和子分类，搜索匹配的商品
      this.categories.forEach(category => {
        category.children?.forEach(subcategory => {
          subcategory.products?.forEach(product => {
            // 同时搜索产品名称和描述
            const nameMatch = product.name.toLowerCase().includes(searchTerm)
            const descMatch = product.sub && product.sub.toLowerCase().includes(searchTerm)
            
            if (nameMatch || descMatch) {
              results.push({
                ...product,
                categoryName: category.name,
                subcategoryName: subcategory.name,
                searchRelevance: nameMatch ? 2 : 1 // 名称匹配优先级更高
              })
            }
          })
        })
      })
      
      // 按相关性排序
      results.sort((a, b) => b.searchRelevance - a.searchRelevance)
      
      // 缓存搜索结果（限制缓存大小）
      if (this.searchCache.size > 50) {
        // 清除最早的缓存项
        const firstKey = this.searchCache.keys().next().value
        this.searchCache.delete(firstKey)
      }
      this.searchCache.set(cacheKey, results)
      
      this.searchResults = results
    },
    
    // 显示收藏夹抽屉
    showFavoriteDrawer() {
      this.showFavorites = true
    },
    
    // 隐藏收藏夹抽屉
    hideFavoriteDrawer() {
      this.showFavorites = false
    },
    
    // 点击收藏夹中的商品
    onFavoriteProductSelect(product) {
      // 防止双击：如果已经在打开中或已经打开，直接返回
      if (this.isOpeningDetail || this.showProductDetail) return
      
      this.isOpeningDetail = true
      this.selectedProduct = product
      
      // 延迟一下再设置 showProductDetail，避免双击时的快速切换
      setTimeout(() => {
        this.showProductDetail = true
        // 不关闭收藏夹，这样关闭详情页后可以返回收藏夹
        // 500ms 后才允许再次操作
        setTimeout(() => {
          this.isOpeningDetail = false
        }, 500)
      }, 50)
    },
    
    // 从收藏夹移除商品
    removeFavorite(product) {
      const index = this.favoriteProducts.findIndex(item => item.id === product.id)
      if (index !== -1) {
        this.favoriteProducts.splice(index, 1)
        // 更新本地存储 - 使用异步存储
        uni.setStorage({
          key: 'favoriteProducts',
          data: this.favoriteProducts,
          success: () => {
            uni.showToast({
              title: '已取消收藏',
              icon: 'success'
            })
          }
        })
      }
    },
    
    // 加载收藏数据
    loadFavorites() {
      try {
        const favorites = uni.getStorageSync('favoriteProducts')
        if (favorites && Array.isArray(favorites)) {
          this.favoriteProducts = favorites
        }
      } catch (e) {
        console.error('加载收藏数据失败:', e)
      }
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

/* Linear 风格页面容器 */
.linear-category-page {
  height: 100vh;
  background: var(--linear-bg-secondary);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding-bottom: 180rpx;
  /* 禁止全页滚动 */
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

/* Linear 风格导航栏 */
.linear-header {
  position: sticky;
  top: 0;
  z-index: 100;
  padding: 20rpx 32rpx 24rpx;
  padding-top: calc(env(safe-area-inset-top) + 20rpx);
  overflow: hidden;
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
  color: var(--linear-text-inverse);
  text-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.2);
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
  transition: background 0.15s ease, box-shadow 0.15s ease;
  position: relative;
}

.favorite-btn:active {
  background: rgba(255, 255, 255, 0.3);
  box-shadow: 
    0 4rpx 16rpx rgba(0, 0, 0, 0.08),
    inset 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
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

/* 加载状态 */
.loading-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-text {
  color: #999;
  font-size: 28rpx;
}

/* Linear 风格主要内容区域 */
.linear-content-container {
  flex: 1;
  display: flex;
  overflow: hidden;
}

/* Linear 风格左侧主分类列表 */
.linear-left-categories {
  width: 200rpx;
  background: var(--linear-bg-primary);
  border-right: 1px solid var(--linear-border-light);
}

.linear-category-item {
  padding: 32rpx 24rpx;
  border-bottom: 1px solid var(--linear-border-light);
  text-align: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.linear-category-item--active {
  background: linear-gradient(135deg, var(--linear-primary) 0%, var(--linear-primary-light) 100%);
  border-right: 4rpx solid var(--linear-primary);
}

.linear-category-item--active::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.1);
  pointer-events: none;
}

.linear-category-name {
  font-size: 26rpx;
  color: var(--linear-text-primary);
  line-height: 1.4;
  font-weight: 500;
  transition: all 0.3s ease;
}

.linear-category-item--active .linear-category-name {
  color: var(--linear-text-inverse);
  font-weight: 600;
}

/* Linear 风格右侧内容区域 */
.linear-right-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: var(--linear-bg-primary);
}

.search-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font-size: 28rpx;
  color: #FFFFFF;
  font-weight: 500;
}

/* 占位符文字样式 */
.search-input::-webkit-input-placeholder {
  color: rgba(255, 255, 255, 0.7);
  font-weight: 400;
  opacity: 1;
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.7);
  font-weight: 400;
  opacity: 1;
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



/* Linear 风格子分类标签栏 */
.linear-subcategory-tabs {
  background: var(--linear-bg-primary);
  border-bottom: 1px solid var(--linear-border-light);
  padding: 20rpx 0;
  position: relative;
  overflow: hidden;
}

.linear-tabs-scroll {
  white-space: nowrap;
  width: 100%;
}

.linear-tabs-container {
  display: inline-flex;
  padding: 0 32rpx;
  gap: 16rpx;
}

/* 左右渐变提示效果 */
.tabs-gradient-left,
.tabs-gradient-right {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 40rpx;
  pointer-events: none;
  z-index: 10;
}

.tabs-gradient-left {
  left: 0;
  background: linear-gradient(to right, var(--linear-bg-primary) 0%, transparent 100%);
}

.tabs-gradient-right {
  right: 0;
  background: linear-gradient(to left, var(--linear-bg-primary) 0%, transparent 100%);
}

.linear-tab-item {
  display: inline-block;
  padding: 12rpx 24rpx;
  font-size: 26rpx;
  color: var(--linear-text-secondary);
  background: var(--linear-bg-tertiary);
  border-radius: var(--linear-radius-xl);
  border: 1px solid var(--linear-border-light);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;
  font-weight: 500;
  flex-shrink: 0;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  outline: none;
  user-select: none;
  -webkit-user-select: none;
}

.linear-tab-item--active {
  background: linear-gradient(135deg, var(--linear-primary) 0%, var(--linear-primary-dark) 100%);
  color: var(--linear-text-inverse);
  border-color: var(--linear-primary);
  box-shadow: var(--linear-shadow-sm);
  font-weight: 600;
}

/* H5/iOS 按压态移除系统背景 */
.linear-tab-item:focus { outline: none; }
.linear-tab-item:active { background: var(--linear-bg-tertiary); }

/* Linear 风格商品展示区域 */
.linear-products-container {
  flex: 1;
  height: 0;
  box-sizing: border-box;
  padding-bottom: 40rpx;
}

.linear-search-results-section,
.linear-category-content {
  padding: 24rpx 32rpx;
}

.linear-category-content {
  min-height: 100%;
  padding-bottom: 60rpx;
}

.linear-subcategory-section {
  margin-bottom: 48rpx;
}

.linear-section-title {
  position: sticky;
  top: 0;
  z-index: 10;
  background: var(--linear-bg-primary);
  width: auto;
  border-bottom: 2rpx solid var(--linear-border-light);
  margin-left: -32rpx;
  margin-right: -32rpx;
  box-shadow: var(--linear-shadow-sm);
}

.linear-title-content-wrapper {
  display: flex;
  align-items: center;
  padding: 20rpx 32rpx;
}

.linear-title-text {
  font-size: 32rpx;
  font-weight: 600;
  color: var(--linear-text-primary);
  margin-right: 16rpx;
}

.linear-product-count {
  font-size: 24rpx;
  color: var(--linear-text-tertiary);
  background: var(--linear-bg-tertiary);
  padding: 4rpx 12rpx;
  border-radius: var(--linear-radius);
  border: 1px solid var(--linear-border-light);
}

/* Linear 风格空状态 */
.linear-empty-products {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 400rpx;
  background: var(--linear-bg-tertiary);
  border-radius: var(--linear-radius-lg);
  margin: 24rpx 0;
}

.linear-empty-text {
  color: var(--linear-text-tertiary);
  font-size: 28rpx;
  font-weight: 500;
}

/* Linear 风格收藏夹抽屉样式 */
.linear-favorite-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1999; /* 提高z-index，覆盖导航栏(z-index: 1000) */
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

.linear-favorite-drawer {
  position: fixed;
  top: 0;
  right: -600rpx;
  width: 600rpx;
  height: 100vh;
  background: var(--linear-bg-primary);
  z-index: 2000; /* 提高z-index，保证在遮罩层之上 */
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
