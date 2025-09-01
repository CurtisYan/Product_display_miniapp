<template>
  <view class="container">
    <!-- 左：分类栏 -->
    <scroll-view class="col col-left" scroll-y>
      <view class="section-title">产品分类</view>
      <view class="category-item active">塑料包装</view>
      <view class="category-item">塑料袋</view>
      <view class="category-item">塑料瓶</view>
      <view class="category-item">收纳盒</view>
      <view class="category-item">更多…</view>
    </scroll-view>

    <!-- 中：产品陈列 -->
    <scroll-view class="col col-middle" scroll-y>
      <view class="section-title">主流产品</view>
      <view class="product-grid">
        <view class="product-card" v-for="i in 6" :key="i">
          <image class="product-image" src="/static/logo.png" mode="aspectFill" />
          <view class="product-info">
            <text class="product-title">示例产品 {{ i }}</text>
            <text class="product-sub">支持定制 · 高品质</text>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 右：联系我们 -->
    <view class="col col-right">
      <view class="section-title">联系我们</view>
      <view class="contact-card">
        <text class="contact-name">XX 塑料科技有限公司</text>
        <text class="contact-line">电话：400-000-0000</text>
        <text class="contact-line">邮箱：contact@example.com</text>
        <text class="contact-line">地址：广东·佛山</text>
      </view>
    </view>
    
    <!-- 一键上滑按钮 -->
    <view class="scroll-to-top" @tap="scrollToTop" v-show="showScrollButton">
      <view class="scroll-icon">↑</view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      // 预留：后续接入真实分类与产品数据
      showScrollButton: false
    }
  },
  onLoad() {
    // 监听页面滚动
    this.initScrollListener()
  },
  methods: {
    // 初始化滚动监听
    initScrollListener() {
      // 监听中间产品列表的滚动
      uni.createSelectorQuery().in(this).select('.col-middle').boundingClientRect((data) => {
        if (data) {
          // 当页面有足够内容时显示按钮
          this.showScrollButton = data.height > 600
        }
      }).exec()
    },
    
    // 滚动到顶部
    scrollToTop() {
      // 滚动中间产品列表到顶部
      uni.pageScrollTo({
        scrollTop: 0,
        duration: 300
      })
      
      // 同时滚动左侧分类列表到顶部
      uni.createSelectorQuery().in(this).select('.col-left').node().exec((res) => {
        if (res[0] && res[0].node) {
          res[0].node.scrollTop = 0
        }
      })
      
      // 滚动中间产品列表到顶部
      uni.createSelectorQuery().in(this).select('.col-middle').node().exec((res) => {
        if (res[0] && res[0].node) {
          res[0].node.scrollTop = 0
        }
      })
    }
  },
}
</script>

<style>
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

.container {
  display: flex;
  flex-direction: row;
  height: 100vh;
  background: var(--linear-bg-secondary);
  box-sizing: border-box;
}

.col {
  box-sizing: border-box;
  background: var(--linear-bg-primary);
  margin: 16rpx 8rpx;
  border-radius: var(--linear-radius-lg);
  box-shadow: var(--linear-shadow);
  border: 1px solid var(--linear-border-light);
}

.col-left {
  width: 25%;
  padding: 24rpx;
  margin-left: 16rpx;
}

.col-middle {
  width: 55%;
  padding: 24rpx;
}

.col-right {
  width: 20%;
  padding: 24rpx;
  margin-right: 16rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 700;
  color: var(--linear-text-primary);
  letter-spacing: -0.5rpx;
  margin-bottom: 24rpx;
}

.category-item {
  padding: 20rpx 16rpx;
  margin-bottom: 12rpx;
  border-radius: var(--linear-radius);
  background: var(--linear-bg-secondary);
  border: 1px solid var(--linear-border-light);
  font-size: 28rpx;
  font-weight: 500;
  color: var(--linear-text-secondary);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.category-item.active {
  background: linear-gradient(135deg, var(--linear-primary) 0%, var(--linear-primary-dark) 100%);
  border-color: var(--linear-primary);
  color: var(--linear-text-inverse);
  font-weight: 600;
  box-shadow: var(--linear-shadow);
}

.product-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20rpx;
}

.product-card {
  background: var(--linear-bg-primary);
  border-radius: var(--linear-radius-lg);
  overflow: hidden;
  border: 1px solid var(--linear-border-light);
  box-shadow: var(--linear-shadow-sm);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.product-image {
  width: 100%;
  height: 240rpx;
  background: var(--linear-bg-tertiary);
}

.product-info {
  padding: 20rpx;
}

.product-title {
  font-size: 28rpx;
  font-weight: 600;
  color: var(--linear-text-primary);
  letter-spacing: -0.3rpx;
  line-height: 1.4;
}

.product-sub {
  display: block;
  margin-top: 8rpx;
  font-size: 24rpx;
  color: var(--linear-text-secondary);
  font-weight: 500;
  letter-spacing: 0.2rpx;
}

.contact-card {
  background: var(--linear-bg-primary);
  border-radius: var(--linear-radius-lg);
  padding: 24rpx;
  border: 1px solid var(--linear-border-light);
  box-shadow: var(--linear-shadow);
}

.contact-name {
  font-size: 28rpx;
  font-weight: 700;
  color: var(--linear-text-primary);
  letter-spacing: -0.3rpx;
  margin-bottom: 16rpx;
  display: block;
}

.contact-line {
  display: block;
  margin-top: 12rpx;
  font-size: 26rpx;
  color: var(--linear-text-secondary);
  font-weight: 500;
  letter-spacing: 0.2rpx;
}

/* 一键上滑按钮 */
.scroll-to-top {
  position: fixed;
  right: 32rpx;
  bottom: 32rpx;
  width: 88rpx;
  height: 88rpx;
  background: linear-gradient(135deg, var(--linear-primary) 0%, var(--linear-primary-dark) 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--linear-shadow-lg);
  z-index: 100;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

.scroll-to-top:active {
  transform: scale(0.95);
  box-shadow: var(--linear-shadow);
}

.scroll-icon {
  font-size: 36rpx;
  font-weight: 700;
  color: var(--linear-text-inverse);
  line-height: 1;
  text-shadow: 0 1rpx 2rpx rgba(0, 0, 0, 0.2);
}
</style>
