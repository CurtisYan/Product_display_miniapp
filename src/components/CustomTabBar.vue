<template>
  <view class="linear-tabbar">
    <view class="tabbar-main">
      <!-- 内容区域 -->
      <view class="tab-content">
        <view 
          v-for="(item, index) in tabs" 
          :key="index"
          class="tab-item"
          :class="{ 'active': current === index }"
          @tap="switchTab(index)"
        >
          <view class="icon-wrapper">
            <text class="tab-icon">{{ item.icon }}</text>
          </view>
          <text class="tab-label">{{ item.text }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'CustomTabBar',
  data() {
    return {
      current: 0, // 默认选中分类页面
      navigating: false,
      updateHandler: null, // 存储事件处理函数引用
      tabs: [
        { 
          pagePath: '/pages/category/index', 
          text: '分类', 
          icon: '☰'
        },
        { 
          pagePath: '/pages/showcase/index', 
          text: '展示', 
          icon: '★'
        },
        { 
          pagePath: '/pages/contact/index', 
          text: '联系', 
          icon: '☏'
        }
      ]
    }
  },
  created() {
    // 创建事件处理函数，保存引用以便后续移除
    this.updateHandler = () => {
      this.updateCurrent()
    }
    
    // 移除可能存在的旧监听器，避免重复
    uni.$off('updateTabBar', this.updateHandler)
    // 添加新监听器
    uni.$on('updateTabBar', this.updateHandler)
    
    // 初始化当前状态
    this.updateCurrent()
  },
  beforeDestroy() {
    // 使用具体的处理函数引用移除事件监听
    if (this.updateHandler) {
      uni.$off('updateTabBar', this.updateHandler)
      this.updateHandler = null
    }
  },
  methods: {
    switchTab(index) {
      if (this.navigating || this.current === index) return
      
      // 添加触觉反馈
      uni.vibrateShort({
        type: 'light',
        fail: () => {} // 忽略振动失败
      })
      
      this.navigating = true
      const target = this.tabs[index].pagePath
      
      // 立即更新状态
      this.current = index
      
      // 使用 switchTab 跳转
      uni.switchTab({
        url: target,
        fail: (err) => {
          // 失败时恢复状态
          this.updateCurrent()
        },
        complete: () => {
          this.navigating = false
        }
      })
    },
    
    updateCurrent() {
      const pages = getCurrentPages()
      if (pages.length) {
        const currentPage = pages[pages.length - 1]
        const route = currentPage.route || currentPage.$page?.fullPath || ''
        
        // 更精确的路由匹配
        let index = -1
        if (route.includes('category')) {
          index = 0
        } else if (route.includes('showcase')) {
          index = 1
        } else if (route.includes('contact')) {
          index = 2
        }
        
        if (index !== -1 && index !== this.current) {
          this.current = index
        }
      }
    }
  }
}
</script>

<style scoped>
/* Linear 风格导航栏 */
.linear-tabbar {
  position: fixed;
  bottom: -2rpx; /* 稍微下移，确保底部无缝 */
  left: -2rpx; /* 稍微左移 */
  right: -2rpx; /* 稍微右移 */
  z-index: 1000;
  /* 添加底部padding，补偿下移的距离 */
  padding-bottom: 2rpx;
}

.tabbar-main {
  position: relative;
  /* 优化背景透明度，不要太透明 */
  background: rgba(255, 255, 255, 0.72);
  /* 恢复70rpx圆角 */
  border-radius: 70rpx 70rpx 0 0;
  overflow: hidden;
  /* 让导航栏延伸更宽，覆盖屏幕边缘 */
  margin: 0;
  min-height: 100rpx;
  
  /* 清晰的边框 */
  border-top: 1rpx solid rgba(0, 0, 0, 0.15);
  
  /* 优化阴影 */
  box-shadow: 
    0 -12rpx 40rpx rgba(0, 0, 0, 0.08),
    0 -4rpx 12rpx rgba(0, 0, 0, 0.05);
}

/* 主毛玻璃效果层 */
.tabbar-main::before {
  content: '';
  position: absolute;
  top: 0;
  /* 让毛玻璃效果延伸出去，避免边缘缝隙 */
  left: -10rpx;
  right: -10rpx;
  bottom: -10rpx;
  /* 适度的毛玻璃效果 */
  backdrop-filter: blur(16rpx) saturate(150%);
  -webkit-backdrop-filter: blur(16rpx) saturate(150%);
  /* 微妙的渐变叠加 */
  background: linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0.25),
    rgba(250, 250, 250, 0.35)
  );
  border-radius: 70rpx 70rpx 0 0;
  pointer-events: none;
}

/* 微妙的高光效果 */
.tabbar-main::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.6) 50%,
    transparent
  );
  pointer-events: none;
}

/* 内容区域 - 添加内边距 */
.tab-content {
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 14rpx 32rpx calc(12rpx + env(safe-area-inset-bottom)) 32rpx;
  position: relative;
  z-index: 1;
}

/* 标签项 */
.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 8rpx 16rpx 6rpx 16rpx;
  min-width: 80rpx;
}

/* 图标容器 */
.icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 6rpx;
}

/* 图标样式 */
.tab-icon {
  font-size: 40rpx;
  line-height: 1;
  color: #8E8E93;
  -webkit-text-fill-color: #8E8E93;
  font-variant-emoji: text;
  text-rendering: optimizeLegibility;
}

/* 标签文字 */
.tab-label {
  font-size: 20rpx;
  color: #8E8E93;
  font-weight: 400;
  line-height: 1;
  text-align: center;
}

/* 活跃状态 */
.tab-item.active .tab-icon {
  color: #000000;
  -webkit-text-fill-color: #000000;
  font-size: 46rpx;
}

.tab-item.active .tab-label {
  color: #000000;
  font-weight: 500;
  font-size: 22rpx;
}
</style>
