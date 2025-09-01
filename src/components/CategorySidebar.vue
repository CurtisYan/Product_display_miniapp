<template>
  <scroll-view class="side" scroll-y>
    <view
      v-for="c in categories"
      :key="c.id"
      class="side-item"
      :class="{ active: c.id === modelValue }"
      @tap="$emit('update:modelValue', c.id)"
      hover-class="side-item-hover"
    >{{ c.name }}</view>
  </scroll-view>
</template>

<script>
export default {
  name: 'CategorySidebar',
  props: {
    categories: { type: Array, default: () => [] },
    modelValue: { type: String, default: '' }
  },
  emits: ['update:modelValue']
}
</script>

<style>
.side { width: 28%; background: #fafafa; }
.side-item { padding: 22rpx 16rpx; border-bottom: 1px solid #f0f0f0; color: #333; }
.side-item.active { background: #eaf3ff; color: #1677ff; font-weight: 600; }
.side-item-hover { background: #f0f7ff; }
</style>
