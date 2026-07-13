import { Button, Image, PageContainer, ScrollView, ShareElement, Swiper, SwiperItem, Text, View } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useEffect, useState } from 'react'
import type { Product } from '@/data/products'
import { saveShareRecord } from '@/utils/share'
import './index.scss'

export default function SkylineProductDetail({ product, onClose }: { product: Product | null; onClose: () => void }) {
  const [lastProduct, setLastProduct] = useState<Product | null>(product)
  useEffect(() => { if (product) setLastProduct(product) }, [product])
  const shown = product || lastProduct
  if (!shown) return null

  return <PageContainer
    show={Boolean(product)}
    position='bottom'
    duration={520}
    zIndex={90}
    overlay
    closeOnSlideDown
    overlayStyle='background:rgba(32,33,29,.38);'
    customStyle='height:78vh;background:transparent;overflow:hidden;'
    onClickOverlay={onClose}
    onAfterLeave={() => { if (product) onClose() }}
  >
    <View className='sky-detail'>
      <ScrollView scrollY className='sky-detail-scroll' showScrollbar={false}>
        <View className='sky-detail-inner'>
          <View className='sky-detail-handle' />
          <View className='sky-detail-meta'><Text>PRODUCT SAMPLE</Text><Text>{shown.id}</Text></View>
          <View className='sky-detail-title'>{shown.name}</View>
          <ShareElement
            className='sky-detail-share'
            mapkey={`product-${shown.id}`}
            transform
            transitionOnGesture
            duration={520}
            easingFunction='cubic-bezier(.16,1,.3,1)'
            rectTweenType='materialRectArc'
          >
            <Swiper className='sky-detail-swiper' circular indicatorDots>
              {shown.images.map(src => <SwiperItem key={src}><Image src={src} mode='aspectFit' showMenuByLongpress /></SwiperItem>)}
            </Swiper>
          </ShareElement>
          {shown.images.length > 1 && <Text className='sky-detail-tip'>左右滑动查看 {shown.images.length} 张图片</Text>}
          <View className='sky-detail-rule' />
          <Text className='sky-detail-copy'>{shown.description}</Text>
          {shown.limited && <Text className='sky-detail-limited'>限制生产 · 分类末位展示</Text>}
          <View className='sky-detail-actions'>
            <Button onClick={() => Taro.redirectTo({ url: '/pages/contact/index' })}>咨询材料 ↗</Button>
            <Button openType='share' data-product-id={shown.id} onClick={() => saveShareRecord(shown)}>分享 ↗</Button>
          </View>
        </View>
      </ScrollView>
    </View>
  </PageContainer>
}
