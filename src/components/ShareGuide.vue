<template>
  <view v-if="visible" class="share-guide" @tap="close">
    <!-- 遮罩层 -->
    <view class="guide-mask"></view>
    
    <!-- 引导内容 -->
    <view class="guide-content">
      <!-- 箭头指向右上角 -->
      <view class="guide-arrow">
        <view class="arrow-line"></view>
        <view class="arrow-head"></view>
      </view>
      
      <!-- 提示文字 -->
      <view class="guide-text">
        <text class="guide-title">点击右上角「···」</text>
        <text class="guide-subtitle">{{ subtitle }}</text>
      </view>
      
      <!-- 动画效果 -->
      <view class="guide-hand">👆</view>
      
      <!-- 关闭按钮 -->
      <view class="guide-close" @tap.stop="close">
        <text class="close-text">我知道了</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'ShareGuide',
  props: {
    subtitle: {
      type: String,
      default: '分享给朋友或保存图片'
    }
  },
  data() {
    return {
      visible: false
    }
  },
  methods: {
    show() {
      this.visible = true
      // 3秒后自动关闭
      setTimeout(() => {
        this.close()
      }, 3000)
    },
    close() {
      this.visible = false
    }
  }
}
</script>

<style scoped>
.share-guide {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
}

.guide-mask {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
}

.guide-content {
  position: relative;
  padding-top: calc(env(safe-area-inset-top) + 100rpx);
  padding-right: 40rpx;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

/* 箭头样式 */
.guide-arrow {
  position: relative;
  width: 120rpx;
  height: 120rpx;
  margin-right: 20rpx;
}

.arrow-line {
  position: absolute;
  top: 50%;
  right: 0;
  width: 100rpx;
  height: 4rpx;
  background: white;
  transform: rotate(-45deg);
  transform-origin: right center;
}

.arrow-head {
  position: absolute;
  top: 20rpx;
  right: 0;
  width: 0;
  height: 0;
  border-left: 20rpx solid transparent;
  border-right: 20rpx solid transparent;
  border-bottom: 30rpx solid white;
  transform: rotate(45deg);
}

/* 文字提示 */
.guide-text {
  margin-top: 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30rpx 40rpx;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.2);
}

.guide-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 12rpx;
}

.guide-subtitle {
  font-size: 28rpx;
  color: #666;
}

/* 手势动画 */
.guide-hand {
  position: absolute;
  top: calc(env(safe-area-inset-top) + 60rpx);
  right: 80rpx;
  font-size: 60rpx;
  animation: hand-point 1.5s ease-in-out infinite;
}

@keyframes hand-point {
  0%, 100% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-20rpx) scale(1.1);
  }
}

/* 关闭按钮 */
.guide-close {
  margin-top: 60rpx;
  padding: 20rpx 60rpx;
  background: white;
  border-radius: 50rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
}

.close-text {
  font-size: 32rpx;
  color: #8B5CF6;
  font-weight: 600;
}

.guide-close:active {
  transform: scale(0.95);
  opacity: 0.8;
}
</style>
