<template>
  <view class="subcats">
    <view
      v-for="s in subcats"
      :key="s.id"
      class="chip"
      :class="{ selected: s.id === modelValue }"
      @tap="$emit('update:modelValue', s.id)"
      hover-class="chip-hover"
    >{{ s.name }}</view>
  </view>
</template>

<script>
export default {
  name: 'SubcatChips',
  props: {
    subcats: { type: Array, default: () => [] },
    modelValue: { type: String, default: '' }
  },
  emits: ['update:modelValue']
}
</script>

<style>
.subcats { display: flex; flex-wrap: wrap; gap: 12rpx; margin-bottom: 16rpx; }
.chip { padding: 10rpx 16rpx; background: #f6f6f6; border-radius: 999rpx; color: #666; border: 1rpx solid #eee; }
.chip.selected { background: #1677ff; color: #fff; border-color: #1677ff; box-shadow: 0 6rpx 14rpx rgba(22,119,255,0.18); }
.chip-hover { background: #eff6ff; }
</style>
