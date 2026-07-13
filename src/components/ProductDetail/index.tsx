import { Button, Image, ScrollView, Swiper, SwiperItem, Text, View } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useEffect, useRef, useState } from 'react'
import { products, type Product } from '@/data/products'
import { saveShareRecord } from '@/utils/share'
import './index.scss'

export default function ProductDetail({ product, onClose }: { product: Product | null; onClose: () => void }) {
  const [closing, setClosing] = useState(false)
  const [dragY, setDragYState] = useState(0)
  const [imageIndex, setImageIndex] = useState(0)
  const [imageHeights, setImageHeights] = useState<Record<string, number>>({})
  const closeTimer = useRef<ReturnType<typeof setTimeout>>()
  const dragTimer = useRef<ReturnType<typeof setTimeout>>()
  const pendingDrag = useRef(0)
  const startY = useRef(0)
  const dragYRef = useRef(0)
  const scrollTop = useRef(0)
  const canDrag = useRef(false)

  useEffect(() => () => {
    if (dragTimer.current) clearTimeout(dragTimer.current)
    if (closeTimer.current) clearTimeout(closeTimer.current)
  }, [])

  useEffect(() => {
    if (!product) return
    if (dragTimer.current) clearTimeout(dragTimer.current)
    dragTimer.current = undefined
    dragYRef.current = 0
    pendingDrag.current = 0
    scrollTop.current = 0
    canDrag.current = false
    setImageIndex(0)
    setDragYState(0)
    setClosing(false)
  }, [product?.id])

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
    if (!product) return
    Taro.previewImage({ current: src, urls: product.images })
  }

  const setDragY = (value: number) => { dragYRef.current = value; setDragYState(value) }
  const flushDrag = () => {
    dragTimer.current = undefined
    setDragYState(pendingDrag.current)
  }
  const scheduleDrag = (value: number) => {
    pendingDrag.current = value
    dragYRef.current = value
    if (!dragTimer.current) dragTimer.current = setTimeout(flushDrag, 32)
  }
  const stopDragTimer = () => {
    if (dragTimer.current) clearTimeout(dragTimer.current)
    dragTimer.current = undefined
  }
  const close = () => {
    if (closing) return
    setClosing(true)
    closeTimer.current = setTimeout(onClose, 460)
  }

  const touchStart = (event: any) => {
    event.stopPropagation()
    startY.current = event.touches[0]?.clientY || 0
    canDrag.current = scrollTop.current <= 2
  }
  const touchMove = (event: any) => {
    event.stopPropagation()
    if (!canDrag.current) return
    const currentY = event.touches[0]?.clientY || startY.current
    const distance = currentY - startY.current
    if (distance > 0) scheduleDrag(Math.min(360, distance * .86))
  }
  const touchEnd = (event: any) => {
    event.stopPropagation()
    stopDragTimer()
    if (canDrag.current && dragYRef.current > 78) close()
    else setDragY(0)
    canDrag.current = false
  }

  useEffect(() => {
    if (!product) return
    product.images.forEach(src => {
      Taro.getImageInfo({ src }).then(info => saveImageSize(src, info.width, info.height)).catch(() => undefined)
    })
  }, [product?.id])

  if (!product) return null

  const activeImage = product.images[imageIndex] || product.images[0]
  const activeImageHeight = imageHeights[activeImage] || Math.round(contentWidth * .66)
  const productNumber = String(products.findIndex(item => item.id === product.id) + 1).padStart(3, '0')

  return <View className={`detail-mask ${closing ? 'detail-mask--closing' : ''}`} catchMove onClick={close}>
    <View
      className={`detail-sheet ${closing ? 'detail-sheet--closing' : ''} ${dragY > 0 ? 'detail-sheet--dragging' : ''}`}
      style={{ transform: closing ? 'translateY(100%)' : `translateY(${dragY}px)` }}
      onClick={event => event.stopPropagation()}
      onTouchStart={touchStart}
      onTouchMove={touchMove}
      onTouchEnd={touchEnd}
      onTouchCancel={touchEnd}
    >
      <ScrollView scrollY className='detail-scroll' onScroll={event => { scrollTop.current = event.detail.scrollTop }}>
        <View className='detail-inner'>
          <View className='detail-handle' />
          <View className='detail-top'>
            <Text>{productNumber} / {product.category}</Text>
            <Button className='detail-share' openType='share' data-product-id={product.id} onClick={() => saveShareRecord(product)}>分享 ↗</Button>
          </View>
          <View className='detail-title'>{product.name}</View>
          <Text className='detail-subtitle'>{product.subtitle}</Text>
          <View className='detail-media' style={{ height: `${activeImageHeight}px` }}>
            <Swiper className='detail-swiper' circular onChange={event => setImageIndex(event.detail.current)}>
              {product.images.map(src => <SwiperItem key={src}><Image className='detail-image' src={src} mode='widthFix' onClick={() => previewImage(src)} onLoad={event => recordImageSize(src, event)} showMenuByLongpress /></SwiperItem>)}
            </Swiper>
            {product.images.length > 1 && <View className='detail-dots'>{product.images.map((_, index) => <View key={index} className={index === imageIndex ? 'is-active' : ''} />)}</View>}
          </View>
          <Text className='detail-image-tip'>{product.images.length > 1 ? `点击放大 · 左右滑动查看 ${product.images.length} 张图片` : '点击图片放大查看'}</Text>
          <Text className='detail-copy'>{product.description}</Text>
          {product.limited && <Text className='limited-note'>限制生产 · 分类末位展示</Text>}
          <View className='detail-actions'>
            <Button onClick={() => Taro.redirectTo({ url: '/pages/contact/index' })}>咨询这种材料 ↗</Button>
            <Button onClick={onClose}>继续浏览</Button>
          </View>
        </View>
      </ScrollView>
    </View>
  </View>
}
