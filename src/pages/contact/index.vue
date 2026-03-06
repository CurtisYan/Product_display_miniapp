<template>
  <view class="linear-contact-page">


    <!-- 主要内容区域 -->
    <view class="main-content">
      <!-- 公司信息卡片 -->
      <view class="linear-card company-section">
        <view class="company-header">
          <view class="company-avatar">
            <LazyImage 
              :src="companyLogoUrl" 
              mode="aspectFill"
              width="120rpx"
              height="120rpx"
              border-radius="50%"
              :show-spinner="true"
            />
          </view>
        </view>
        <view class="company-details">
          <text class="company-name">{{ contactInfo.company }}</text>
          <text class="company-tagline">专业塑料制品解决方案提供商</text>
          <view class="about-button" hover-class="about-button-hover" @tap="showAbout">
            <text class="about-button-text">公司介绍</text>
          </view>
        </view>
      </view>

      <!-- 联系方式卡片 -->
      <view class="linear-card contact-section">
        <view class="section-header">
          <text class="section-title">联系方式</text>
          <text class="copy-hint-text">点击可复制</text>
        </view>
        
        <view class="contact-grid">
          <view class="contact-item" hover-class="contact-item-hover" @tap="copyToClipboard(contactInfo.phone, '电话')">
            <view class="contact-icon phone-icon">
              <text class="icon-text">📞</text>
            </view>
            <view class="contact-info">
              <text class="contact-label">电话</text>
              <text class="contact-value">{{ contactInfo.phone }}</text>
            </view>
          </view>
          
          <view class="contact-item" hover-class="contact-item-hover" @tap="copyToClipboard(contactInfo.email, '邮箱')">
            <view class="contact-icon email-icon">
              <text class="icon-text">✉️</text>
            </view>
            <view class="contact-info">
              <text class="contact-label">邮箱</text>
              <text class="contact-value">{{ contactInfo.email }}</text>
            </view>
          </view>
          
          <view class="contact-item" hover-class="contact-item-hover" @tap="copyToClipboard(contactInfo.address, '地址')">
            <view class="contact-icon location-icon">
              <text class="icon-text">📍</text>
            </view>
            <view class="contact-info">
              <text class="contact-label">地址</text>
              <text class="contact-value">{{ contactInfo.address }}</text>
            </view>
          </view>
          
          <view class="contact-item wechat-item" hover-class="contact-item-hover" @tap="showQRCode">
            <view class="contact-icon wechat-icon">
              <text class="icon-text">💬</text>
            </view>
            <view class="contact-info">
              <text class="contact-label">微信</text>
              <text class="contact-value wechat-link">点击添加微信</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 工作时间卡片 -->
      <view class="linear-card schedule-section">
        <view class="section-header">
          <text class="section-title">工作时间</text>
        </view>
        <view class="schedule-content">
          <view class="schedule-item">
            <text class="schedule-day">周一至周五</text>
            <text class="schedule-time">8:30 - 19:30</text>
          </view>
          <view class="schedule-item">
            <text class="schedule-day">周六</text>
            <text class="schedule-time">9:00 - 17:00</text>
          </view>
          <view class="schedule-note">
            <text class="note-text">周日及法定节假日休息</text>
          </view>
        </view>
      </view>
    </view>
  </view>

  <!-- Linear 风格二维码弹窗 -->
  <view v-if="showQRModal" class="modal-backdrop" @tap="hideQRCode"></view>
  <view v-if="showQRModal" class="modal-container">
    <view class="modal-content" @tap.stop>
      <view class="modal-header">
        <text class="modal-title">添加微信</text>
        <view class="close-button" @tap="hideQRCode">
          <text class="close-icon">×</text>
        </view>
      </view>
      <view class="modal-body">
        <view class="qr-container">
          <view class="qr-code">
            <LazyImage 
              :src="wechatQrUrl" 
              mode="aspectFit"
              width="456rpx"
              height="456rpx"
              border-radius="12rpx"
              :show-spinner="true"
              :showMenuByLongpress="true"
              @error="onQRImageError"
              @load="onQRImageLoad"
            />
          </view>
        </view>
        <text class="qr-tip">长按识别二维码或使用微信扫一扫</text>
      </view>
    </view>
  </view>
  
  <!-- 公司介绍弹窗 -->
  <view v-if="showAboutModal" class="modal-backdrop" @tap="hideAbout"></view>
  <view v-if="showAboutModal" class="modal-container">
    <view class="modal-content" @tap.stop>
      <view class="modal-header">
        <text class="modal-title">公司介绍</text>
        <view class="close-button" @tap="hideAbout">
          <text class="close-icon">✕</text>
        </view>
      </view>
      <view class="modal-body">
        <view class="about-content">
          <view 
            v-for="(paragraph, index) in (contactInfo.companyIntroduction || [])" 
            :key="index" 
            class="about-paragraph"
          >
            {{ paragraph }}
          </view>
        </view>
      </view>
    </view>
  </view>
  
  <!-- 自定义底部导航栏 -->
  <CustomTabBar />
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
// 改为从服务器获取公司信息，移除本地 config.js 依赖
import { fetchCompany } from '../../utils/api.js'
import CustomTabBar from '../../components/CustomTabBar.vue'
import LazyImage from '../../components/LazyImage.vue'

// 页面显示时通知导航栏更新状态
uni.$on('page-show-contact', () => {
  uni.$emit('updateTabBar')
})

// 公司信息（从服务端加载）
const contactInfo = ref({
  company: '公司名称',
  phone: '',
  email: '',
  address: '',
  companyIntroduction: [],
  company_logo: '',
  wechat_qr: ''
})

// 计算图片URL（若服务端未配置则回退到本地占位）
const companyLogoUrl = computed(() => contactInfo.value.company_logo || '/static/images/company/szmeisu.jpeg')
const wechatQrUrl = computed(() => contactInfo.value.wechat_qr || '/static/images/company/WeChat-Business-Card.jpeg')

// 控制二维码弹窗显示
const showQRModal = ref(false)

// 控制公司介绍弹窗显示
const showAboutModal = ref(false)

// 显示二维码
const showQRCode = () => {
  showQRModal.value = true
}

// 隐藏二维码
const hideQRCode = () => {
  showQRModal.value = false
}

// 显示公司介绍
const showAbout = () => {
  showAboutModal.value = true
  // 在弹窗显示时禁用页面滚动
  // #ifdef H5
  if (typeof document !== 'undefined' && document.body) {
    document.body.style.overflow = 'hidden'
  }
  // #endif
}

// 隐藏公司介绍
const hideAbout = () => {
  showAboutModal.value = false
  // 在弹窗关闭时恢复页面滚动
  // #ifdef H5
  if (typeof document !== 'undefined' && document.body) {
    document.body.style.overflow = 'auto'
  }
  // #endif
}

// 长按图片事件（备用，如果 show-menu-by-longpress 不生效）
const onImageLongPress = () => {
  // 在微信小程序中，show-menu-by-longpress 属性会自动显示菜单
  // 这里可以添加额外的逻辑
  console.log('长按图片')
}

// 复制到剪贴板
const copyToClipboard = (text, type) => {
  uni.setClipboardData({
    data: text,
    success: () => {
      uni.showToast({
        title: `${type}已复制`,
        icon: 'success',
        duration: 2000
      })
    },
    fail: () => {
      uni.showToast({
        title: '复制失败',
        icon: 'none',
        duration: 2000
      })
    }
  })
}

// 二维码图片加载成功
const onQRImageLoad = () => {
  console.log('二维码图片加载成功')
}

// 二维码图片加载失败
const onQRImageError = (e) => {
  console.error('二维码图片加载失败:', e)
  uni.showToast({
    title: '图片加载失败',
    icon: 'none',
    duration: 2000
  })
}

// 加载公司信息
onMounted(async () => {
  try {
    const data = await fetchCompany()
    const intro = (data?.introduction || '').split(/\n+/).map(s => s.trim()).filter(Boolean)
    contactInfo.value = {
      company: data?.name || '公司名称',
      phone: data?.phone || '',
      email: data?.email || '',
      address: data?.address || '',
      companyIntroduction: intro,
      company_logo: data?.company_logo || '',
      wechat_qr: data?.wechat_qr || ''
    }
    console.log('[Contact] 公司信息已加载')
  } catch (err) {
    console.error('[Contact] 加载公司信息失败:', err)
    uni.showToast({ title: '公司信息加载失败', icon: 'none' })
  }
})
</script>

<script>
export default {
  name: 'ContactPage',
  components: {
    CustomTabBar,
    LazyImage
  },
  onShow() {
    // 页面显示时通知导航栏更新状态
    uni.$emit('updateTabBar')
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
  
  --linear-bg: #F8FAFC;
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

.linear-contact-page {
  min-height: 100vh;
  background: var(--linear-bg);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  padding-bottom: 140rpx;
}



/* 顶部标题区域 */
.header-section {
  text-align: center;
  margin-bottom: 60rpx;
  padding-top: 40rpx;
}

.page-title {
  display: block;
  font-size: 56rpx;
  font-weight: 700;
  color: #1a202c;
}

.page-subtitle {
  font-size: 28rpx;
  color: var(--linear-text-secondary);
  line-height: 1.5;
}

/* 主要内容区域 */
.main-content {
  max-width: 1200rpx;
  margin: 0 auto;
  padding: 60rpx 32rpx 120rpx;
  padding-top: calc(env(safe-area-inset-top) + 40rpx);
}

/* Linear 卡片基础样式 */
.linear-card {
  background: var(--linear-bg-primary);
  border: 1rpx solid var(--linear-border);
  border-radius: var(--linear-radius-lg);
  margin-bottom: 24rpx;
  box-shadow: var(--linear-shadow);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 公司信息部分 */
.company-section {
  padding: 48rpx;
  margin-bottom: 32rpx;
}

.company-header {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24rpx;
}

.company-avatar {
  width: 120rpx;
  height: 120rpx;
  background: linear-gradient(135deg, var(--linear-primary) 0%, var(--linear-primary-dark) 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 32rpx rgba(139, 92, 246, 0.3);
}

/* 移除旧的 avatar-image 样式，由 LazyImage 组件处理 */

.company-details {
  text-align: center;
}

.company-name {
  font-size: 40rpx;
  font-weight: 700;
  color: var(--linear-text-primary);
  margin-bottom: 12rpx;
  display: block;
}

.company-tagline {
  font-size: 28rpx;
  color: var(--linear-text-secondary);
  line-height: 1.4;
  display: block;
  margin-top: 6rpx;
}

/* 公司介绍按钮 */
.about-button {
  margin: 16rpx auto 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 16rpx 28rpx;
  background: linear-gradient(135deg, var(--linear-primary) 0%, var(--linear-primary-light) 100%);
  color: var(--linear-text-inverse);
  border-radius: 9999rpx;
  box-shadow: 0 8rpx 20rpx rgba(139, 92, 246, 0.25);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.about-button-hover {
  transform: translateY(-2rpx);
  box-shadow: 0 12rpx 24rpx rgba(139, 92, 246, 0.3);
}

.about-button-text {
  font-size: 26rpx;
  font-weight: 600;
  letter-spacing: 0.3rpx;
}

/* 联系方式部分 */
.contact-section {
  padding: 32rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: 700;
  color: var(--linear-text-primary);
  letter-spacing: -0.3rpx;
}

.copy-hint-text {
  font-size: 22rpx;
  color: var(--linear-primary);
  font-weight: 500;
  opacity: 0.8;
}

.contact-grid {
  display: flex;
  flex-direction: column;
  gap: 2rpx;
}

.contact-item {
  display: flex;
  align-items: center;
  padding: 20rpx 16rpx;
  border-radius: var(--linear-radius);
  transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  cursor: pointer;
}

.contact-item-hover {
  background: #F6F8FA;
}



.contact-icon {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
  flex-shrink: 0;
}

.phone-icon {
  background: linear-gradient(135deg, #00D4FF 0%, #5B73FF 100%);
}

.email-icon {
  background: linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%);
}

.location-icon {
  background: linear-gradient(135deg, #4ECDC4 0%, #44A08D 100%);
}

.wechat-icon {
  background: linear-gradient(135deg, #A8E6CF 0%, #7FCDCD 100%);
}

.icon-text {
  font-size: 28rpx;
}

.contact-info {
  flex: 1;
  min-width: 0;
}

.contact-label {
  font-size: 24rpx;
  color: var(--linear-text-secondary);
  display: block;
  margin-bottom: 4rpx;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5rpx;
}

.contact-value {
  font-size: 30rpx;
  color: var(--linear-text-primary);
  font-weight: 600;
  word-break: break-all;
  line-height: 1.4;
}

.wechat-link {
  color: var(--linear-primary);
}

.wechat-item {
  cursor: pointer;
}


/* 工作时间部分 */
.schedule-section {
  padding: 32rpx;
}

.schedule-content {
  margin-top: 24rpx;
}

.schedule-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16rpx 0;
  border-bottom: 1rpx solid #F6F8FA;
}

.schedule-item:last-of-type {
  border-bottom: none;
}

.schedule-day {
  font-size: 26rpx;
  color: var(--linear-text-secondary);
  font-weight: 500;
}

.schedule-time {
  font-size: 26rpx;
  color: var(--linear-text-primary);
  font-weight: 600;
  font-family: 'SF Mono', Monaco, monospace;
}

.schedule-note {
  margin-top: 20rpx;
  padding: 16rpx 20rpx;
  background: #F6F8FA;
  border-radius: var(--linear-radius);
}

.note-text {
  font-size: 24rpx;
  color: var(--linear-text-secondary);
  line-height: 1.5;
}

  /* Linear 风格弹窗 */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8rpx);
  z-index: 999;
  animation: fadeIn 0.15s ease-out;
  /* 阻止滚动穿透 */
  touch-action: none;
}

.modal-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  /* 阻止滚动穿透 */
  touch-action: none;
}.modal-content {
  background: var(--linear-bg-primary);
  border-radius: var(--linear-radius-lg);
  width: 680rpx;
  max-width: 90%;
  position: relative;
  box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.3);
  animation: slideIn 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  pointer-events: auto;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(20rpx);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx;
  border-bottom: 1rpx solid var(--linear-border);
}

.modal-title {
  font-size: 28rpx;
  font-weight: 600;
  color: var(--linear-text-primary);
}

.close-button {
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  background: #F6F8FA;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
  cursor: pointer;
}

.close-button:hover {
  background: #E1E4E8;
}

.close-icon {
  font-size: 36rpx;
  color: var(--linear-text-secondary);
  font-weight: 300;
  line-height: 1;
}

.modal-body {
  padding: 24rpx 20rpx;
  text-align: center;
  max-height: 60vh; /* 设置最大高度 */
  overflow: hidden; /* 防止内容溢出 */
}

/* 公司介绍弹窗内容 */
.about-content {
  padding: 8rpx 24rpx 4rpx;
  text-align: left; /* 覆盖 modal-body 的居中，让段落更易读 */
  max-height: calc(60vh - 48rpx); /* 减去padding的高度 */
  overflow-y: auto; /* 允许垂直滚动 */
  -webkit-overflow-scrolling: touch; /* 在iOS上启用滚动回弹效果 */
}

.about-text {
  font-size: 28rpx;
  color: var(--linear-text-primary);
  line-height: 1.6;
}

/* 多段落样式 */
.about-paragraph {
  font-size: 28rpx;
  color: var(--linear-text-primary);
  line-height: 1.8;
  margin-bottom: 14rpx;
}

.qr-container {
  margin-bottom: 20rpx;
}

.qr-code {
  width: 480rpx;
  height: 480rpx;
  background: linear-gradient(135deg, #F6F8FA 0%, #E1E4E8 100%);
  border-radius: var(--linear-radius-lg);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  padding: 12rpx;
  border: 2rpx dashed var(--linear-border);
  position: relative;
}

.qr-code::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 60rpx;
  height: 60rpx;
  background: var(--linear-primary);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  opacity: 0.1;
}

/* 移除旧的 qr-image 样式，由 LazyImage 组件处理 */

.qr-tip {
  font-size: 24rpx;
  color: var(--linear-text-secondary);
  line-height: 1.5;
}
</style>
