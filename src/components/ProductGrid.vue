<template>
  <view>
    <view class="grid">
      <view class="grid-inner">
        <view v-for="p in visibleProducts" :key="p.id" class="item">
          <ProductCard :product="p" @select="$emit('select', p)" />
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import ProductCard from './ProductCard.vue'
export default {
  name: 'ProductGrid',
  components: { ProductCard },
  props: { products: { type: Array, default: () => [] } },
  emits: ['select'],
  data() {
    return {
      visibleProducts: [],
      _chunkTimer: null,
      _chunkIndex: 0,
      chunkSize: 16,
      chunkDelay: 30
    }
  },
  watch: {
    products: {
      immediate: true,
      handler(newList) {
        this._resetChunkedRender()
        if (!Array.isArray(newList) || newList.length === 0) {
          this.visibleProducts = []
          return
        }
        // 首屏先渲染一个较大的首块，提升感知速度
        const firstChunk = this.chunkSize
        this.visibleProducts = newList.slice(0, firstChunk)
        this._chunkIndex = firstChunk
        this._scheduleNextChunk(newList)
      }
    }
  },
  beforeUnmount() {
    this._resetChunkedRender()
  },
  methods: {
    _scheduleNextChunk(list) {
      if (this._chunkIndex >= list.length) return
      this._chunkTimer = setTimeout(() => {
        const next = this._chunkIndex + this.chunkSize
        this.visibleProducts = this.visibleProducts.concat(list.slice(this._chunkIndex, next))
        this._chunkIndex = next
        this._scheduleNextChunk(list)
      }, this.chunkDelay)
    },
    _resetChunkedRender() {
      if (this._chunkTimer) {
        clearTimeout(this._chunkTimer)
        this._chunkTimer = null
      }
      this._chunkIndex = 0
      this.visibleProducts = []
    }
  }
}
</script>

<style>
.grid { }
.grid-inner { display: flex; flex-wrap: wrap; margin-left: -8rpx; margin-right: -8rpx; }
.item { width: 50%; padding: 0 8rpx 16rpx; box-sizing: border-box; }
/* 精简过渡以减轻大列表渲染开销 */
</style>
