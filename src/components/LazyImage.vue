<template>
  <view class="lazy-image-container" :style="containerStyle">
    <!-- 骨架屏/加载占位符 -->
    <view v-if="!loaded && !error" class="skeleton-wrapper">
      <view class="skeleton-animation">
        <view class="skeleton-gradient"></view>
      </view>
      <view class="loading-spinner" v-if="showSpinner">
        <view class="spinner"></view>
      </view>
    </view>
    
    <!-- 图片 -->
    <image
      :class="['lazy-image', { 'fade-in': loaded && !immediate }]"
      :src="src"
      :mode="mode"
      :style="imageStyle"
      :show-menu-by-longpress="showMenuByLongpress"
      @load="onImageLoad"
      @error="onImageError"
      v-show="loaded || error"
    />
    
    <!-- 错误占位符 -->
    <view v-if="error" class="error-placeholder">
      <text class="error-icon">🖼️</text>
      <text class="error-text">加载失败</text>
    </view>
  </view>
</template>

<script>
import imagePreloader from '../utils/imagePreloader.js'

export default {
  name: 'LazyImage',
  props: {
    src: {
      type: String,
      required: true
    },
    mode: {
      type: String,
      default: 'aspectFill'
    },
    width: {
      type: String,
      default: '100%'
    },
    height: {
      type: String,
      default: '100%'
    },
    borderRadius: {
      type: String,
      default: '0'
    },
    showSpinner: {
      type: Boolean,
      default: false
    },
    immediate: {
      type: Boolean,
      default: false
    },
    showMenuByLongpress: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      loaded: false,
      error: false,
      isPreloaded: false
    }
  },
  computed: {
    containerStyle() {
      return {
        width: this.width,
        height: this.height,
        borderRadius: this.borderRadius
      }
    },
    imageStyle() {
      return {
        width: '100%',
        height: '100%',
        borderRadius: this.borderRadius
      }
    }
  },
  mounted() {
    // 检查图片是否已经预加载
    if (imagePreloader.isPreloaded(this.src)) {
      this.isPreloaded = true
      // 如果已预加载，立即显示
      this.loaded = true
    }
  },
  methods: {
    onImageLoad() {
      if (!this.loaded) {
        // 立即显示图片，不添加人为延迟
        this.loaded = true
        this.$emit('load')
      }
    },
    onImageError(e) {
      this.error = true
      this.$emit('error', e)
      console.error('图片加载失败:', this.src, e)
    }
  }
}
</script>

<style scoped>
.lazy-image-container {
  position: relative;
  overflow: hidden;
  background-color: #f5f5f5;
}

/* 骨架屏 */
.skeleton-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, #f0f0f0 0%, #f8f8f8 50%, #f0f0f0 100%);
  z-index: 1;
}

.skeleton-animation {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
}

.skeleton-gradient {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.4) 50%,
    transparent 100%
  );
  animation: skeleton-loading 1.5s ease-in-out infinite;
}

@keyframes skeleton-loading {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(200%);
  }
}

/* 加载动画 */
.loading-spinner {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 2;
}

.spinner {
  width: 40rpx;
  height: 40rpx;
  border: 3rpx solid rgba(139, 92, 246, 0.2);
  border-top-color: #8B5CF6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* 图片淡入效果 */
.lazy-image {
  width: 100%;
  height: 100%;
  opacity: 0;
  transition: opacity 0.3s ease-in-out;
}

.lazy-image.fade-in {
  animation: fadeIn 0.5s ease-in-out forwards;
}

@keyframes fadeIn {
  0% {
    opacity: 0;
    transform: scale(1.05);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

/* 立即显示的图片（预加载的） */
.lazy-image:not(.fade-in) {
  opacity: 1;
}

/* 错误占位符 */
.error-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
}

.error-icon {
  font-size: 48rpx;
  margin-bottom: 16rpx;
  opacity: 0.5;
}

.error-text {
  font-size: 24rpx;
  color: #999;
}
</style>
