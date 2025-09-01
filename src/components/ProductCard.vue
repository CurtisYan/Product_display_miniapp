<template>
  <view class="card" @tap="$emit('select', product)" hover-class="card-hover">
    <image class="img" :src="product.image" mode="aspectFill" :lazy-load="true" />
    <view class="info">
      <text class="title">{{ product.name }}</text>
      <slot name="badge"></slot>
      <text class="sub" v-if="product.sub">{{ product.sub }}</text>
    </view>
  </view>
</template>

<script>
export default {
  name: 'ProductCard',
  props: { product: { type: Object, required: true } },
  emits: ['select']
}
</script>

<style>
.card { background: #fff; border-radius: var(--radius-md, 12rpx); overflow: hidden; box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.04); transition: transform .12s ease; }
.card-hover { transform: scale(0.98); }
.img { width: 100%; height: 220rpx; background: #f0f0f0; }
.info { padding: 12rpx 16rpx 16rpx; }
.title { font-size: 26rpx; color: var(--text-strong, #111); }
.sub { 
  display: -webkit-box; 
  -webkit-line-clamp: 2; 
  -webkit-box-orient: vertical; 
  overflow: hidden; 
  margin-top: 6rpx; 
  font-size: 22rpx; 
  color: var(--text-sub, #8f8f94); 
}
</style>
