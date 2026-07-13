import { Button, Image, PageContainer, ScrollView, ShareElement, Swiper, SwiperItem, Text, View } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useEffect, useState } from 'react'
import { products, type Product } from '@/data/products'
import { saveShareRecord } from '@/utils/share'
import './index.scss'

export default function SkylineProductDetail({ product, onClose }: { product: Product | null; onClose: () => void }) {
  const [lastProduct, setLastProduct] = useState<Product | null>(product)
  const [imageIndex, setImageIndex] = useState(0)
  const [imageHeights, setImageHeights] = useState<Record<string, number>>({})
  useEffect(() => { if (product) { setLastProduct(product); setImageIndex(0) } }, [product])
  const shown = product || lastProduct
  const contentWidth = Taro.getWindowInfo().windowWidth * (1 - 68 / 750)
  const saveImageSize = (src: string, width: number, height: number) => {
    if (!width || !height) return
    const nextHeight = Math.round(contentWidth * height / width)
    setImageHeights(current => current[src] === nextHeight ? current : { ...current, [src]: nextHeight })
  }
  const recordImageSize = (src: string, event: any) => {
    const { width, height } = event.detail || {}
    saveImageSize(src, width, height)
  }
  const previewImage = (src: string) => {
    if (!shown) return
    Taro.previewImage({ current: src, urls: shown.images })
  }

  useEffect(() => {
    if (!shown) return
    shown.images.forEach(src => {
      Taro.getImageInfo({ src }).then(info => saveImageSize(src, info.width, info.height)).catch(() => undefined)
    })
  }, [shown?.id])

  if (!shown) return null
  const activeImage = shown.images[imageIndex] || shown.images[0]
  const activeImageHeight = imageHeights[activeImage] || Math.round(contentWidth * .66)
  const productNumber = String(products.findIndex(item => item.id === shown.id) + 1).padStart(3, '0')

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
          <View className='sky-detail-top'>
            <Text>{productNumber} / {shown.category}</Text>
            <Button className='sky-detail-share-button' openType='share' data-product-id={shown.id} onClick={() => saveShareRecord(shown)}>分享 ↗</Button>
          </View>
          <View className='sky-detail-title'>{shown.name}</View>
          <Text className='sky-detail-subtitle'>{shown.subtitle}</Text>
          <ShareElement
            className='sky-detail-share'
            style={{ height: `${activeImageHeight}px` }}
            mapkey={`product-${shown.id}`}
            transform
            transitionOnGesture
            duration={520}
            easingFunction='cubic-bezier(.16,1,.3,1)'
            rectTweenType='materialRectArc'
          >
            <Swiper className='sky-detail-swiper' circular onChange={event => setImageIndex(event.detail.current)}>
              {shown.images.map(src => <SwiperItem key={src}><Image className='sky-detail-image' src={src} mode='widthFix' onClick={() => previewImage(src)} onLoad={event => recordImageSize(src, event)} showMenuByLongpress /></SwiperItem>)}
            </Swiper>
            {shown.images.length > 1 && <View className='sky-detail-dots'>{shown.images.map((_, index) => <View key={index} className={index === imageIndex ? 'is-active' : ''} />)}</View>}
          </ShareElement>
          <Text className='sky-detail-tip'>{shown.images.length > 1 ? `点击放大 · 左右滑动查看 ${shown.images.length} 张图片` : '点击图片放大查看'}</Text>
          <View className='sky-detail-rule' />
          <Text className='sky-detail-copy'>{shown.description}</Text>
          {shown.limited && <Text className='sky-detail-limited'>限制生产 · 分类末位展示</Text>}
          <View className='sky-detail-actions'>
            <Button onClick={() => Taro.redirectTo({ url: '/pages/contact/index' })}>咨询这种材料 ↗</Button>
            <Button onClick={onClose}>继续浏览</Button>
          </View>
        </View>
      </ScrollView>
    </View>
  </PageContainer>
}
