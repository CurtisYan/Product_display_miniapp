<template>
  <view class="tree">
    <block v-for="(lvl1, i1) in data" :key="lvl1.id">
      <view class="node lvl1" @tap="toggle(lvl1.id)">
        <text class="caret" v-if="hasChildren(lvl1)">{{ caret(lvl1) }}</text>
        <text class="label">{{ lvl1.name }}</text>
      </view>
      <view v-if="expanded[lvl1.id]" class="children">
        <block v-for="(lvl2, i2) in (lvl1.children || [])" :key="lvl2.id">
          <view class="node lvl2" @tap="toggle(lvl2.id)">
            <text class="caret" v-if="hasChildren(lvl2)">{{ caret(lvl2) }}</text>
            <text class="label">{{ lvl2.name }}</text>
          </view>
          <view v-if="expanded[lvl2.id]" class="children">
            <block v-for="(lvl3, i3) in (lvl2.children || [])" :key="lvl3.id">
              <view class="node lvl3" @tap.stop="select(lvl3)">
                <text class="dot">•</text>
                <text class="label">{{ lvl3.name }}</text>
              </view>
            </block>
          </view>
        </block>
      </view>
    </block>
  </view>
</template>

<script>
export default {
  name: 'CategoryTree',
  props: {
    data: { type: Array, default: () => [] }
  },
  emits: ['select'],
  data() {
    return { expanded: {} }
  },
  methods: {
    hasChildren(node) {
      return node && Array.isArray(node.children) && node.children.length > 0
    },
    toggle(id) {
      if (!id) return
      this.$set ? this.$set(this.expanded, id, !this.expanded[id]) : (this.expanded = { ...this.expanded, [id]: !this.expanded[id] })
    },
    caret(node) {
      return this.expanded[node.id] ? '▾' : '▸'
    },
    select(node) {
      this.$emit('select', node)
    }
  }
}
</script>

<style>
.tree { padding: 8rpx 0; }
.node { display: flex; align-items: center; padding: 14rpx 12rpx; border-radius: 8rpx; }
.node:hover { background: #f7f7f7; }
.label { margin-left: 8rpx; color: #333; }
.caret { width: 28rpx; color: #1677ff; }
.dot { width: 28rpx; color: #bbb; text-align: center; }
.lvl1 { font-weight: 600; }
.lvl2 { padding-left: 24rpx; }
.lvl3 { padding-left: 48rpx; }
.children { margin-left: 8rpx; border-left: 2rpx solid #f0f0f0; }
</style>
