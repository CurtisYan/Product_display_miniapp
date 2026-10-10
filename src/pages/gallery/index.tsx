import { Image, Input, ScrollView, Text, View } from '@tarojs/components'
import Taro, { useDidHide, useDidShow, useLoad, useShareAppMessage, useShareTimeline } from '@tarojs/taro'
import { useEffect, useMemo, useRef, useState } from 'react'
import SiteHeader from '@/components/SiteHeader'
import CachedImage from '@/components/CachedImage'
import SkylineProductDetail from '@/components/SkylineProductDetail'
import { catalogSettings, products, type Product } from '@/data/products'
import { buildProductShare } from '@/utils/share'
import './index.scss'

export default function Gallery() {
  const [selected, setSelected] = useState<Product | null>(null)
  const [keyword, setKeyword] = useState('')
  const [heroIndex, setHeroIndex] = useState(0)
  const [heroDirection, setHeroDirection] = useState<1 | -1>(1)
  const [heroDragX, setHeroDragX] = useState(0)
  const [heroDragging, setHeroDragging] = useState(false)
  const [heroPhase, setHeroPhase] = useState<'' | 'left' | 'right' | 'reset'>('')
  const [heroImageSizes, setHeroImageSizes] = useState<Record<string, { width: number; height: number }>>({})
  const [pageActive, setPageActive] = useState(true)
  const handledShare = useRef('')
  const heroTouchStart = useRef({ x: 0, y: 0 })
  const heroTouchAxis = useRef<'' | 'horizontal' | 'vertical'>('')
  const heroPendingX = useRef(0)
  const heroDirectionRef = useRef<1 | -1>(1)
  const heroDragTimer = useRef<ReturnType<typeof setTimeout>>()
  const heroAnimationTimer = useRef<ReturnType<typeof setTimeout>>()
  const heroResetTimer = useRef<ReturnType<typeof setTimeout>>()
  const hero = products.find(product => product.id === catalogSettings.heroId) || products[0]
  const windowWidth = Taro.getWindowInfo().windowWidth
  const heroDeckWidth = windowWidth * (1 - 192 / 750)
  const heroDeckHeight = windowWidth * 500 / 750
  const wrapHeroIndex = (index: number) => (index + hero.images.length) % hero.images.length
  const heroImageAt = (offset: number) => hero.images[wrapHeroIndex(heroIndex + heroDirection * offset)]
  const list = useMemo(
    () => products.filter(product => product.id !== hero.id && (!keyword || `${product.name}${product.subtitle}`.toLowerCase().includes(keyword.toLowerCase()))),
    [hero.id, keyword]
  )

  useEffect(() => () => {
    if (heroDragTimer.current) clearTimeout(heroDragTimer.current)
    if (heroAnimationTimer.current) clearTimeout(heroAnimationTimer.current)
    if (heroResetTimer.current) clearTimeout(heroResetTimer.current)
  }, [])

  const saveHeroImageSize = (src: string, width: number, height: number) => {
    if (!width || !height) return
    setHeroImageSizes(current => current[src]?.width === width && current[src]?.height === height
      ? current
      : { ...current, [src]: { width, height } })
  }
  useEffect(() => {
    hero.images.forEach(src => {
      Taro.getImageInfo({ src }).then(info => saveHeroImageSize(src, info.width, info.height)).catch(() => undefined)
    })
  }, [hero.id])
  const heroCardStyle = (src: string, transform?: string) => {
    const size = heroImageSizes[src]
    if (!size) return transform ? { transform } : undefined
    const ratio = size.height / size.width
    let width = heroDeckWidth
    let height = width * ratio
    if (height > heroDeckHeight) {
      height = heroDeckHeight
      width = height / ratio
    }
    return {
      width: `${Math.round(width)}px`,
      height: `${Math.round(height)}px`,
      left: `${Math.round((heroDeckWidth - width) / 2)}px`,
      top: `${Math.round((heroDeckHeight - height) / 2)}px`,
      ...(transform ? { transform } : {})
    }
  }

  const startHeroDrag = (event: any) => {
    if (hero.images.length < 2 || heroPhase) return
    const touch = event.touches?.[0]
    if (!touch) return
    heroTouchStart.current = { x: touch.clientX, y: touch.clientY }
    heroTouchAxis.current = ''
    heroPendingX.current = 0
  }
  const moveHeroDrag = (event: any) => {
    if (heroPhase) return
    const touch = event.touches?.[0]
    if (!touch) return
    const dx = touch.clientX - heroTouchStart.current.x
    const dy = touch.clientY - heroTouchStart.current.y
    if (!heroTouchAxis.current && Math.max(Math.abs(dx), Math.abs(dy)) > 7) {
      heroTouchAxis.current = Math.abs(dx) > Math.abs(dy) * 1.15 ? 'horizontal' : 'vertical'
      if (heroTouchAxis.current === 'horizontal') setHeroDragging(true)
    }
    if (heroTouchAxis.current !== 'horizontal') return
    event.stopPropagation()
    const direction: 1 | -1 = dx < 0 ? 1 : -1
    if (heroDirectionRef.current !== direction) {
      heroDirectionRef.current = direction
      setHeroDirection(direction)
    }
    heroPendingX.current = Math.max(-160, Math.min(160, dx))
    if (!heroDragTimer.current) {
      heroDragTimer.current = setTimeout(() => {
        heroDragTimer.current = undefined
        setHeroDragX(heroPendingX.current)
      }, 16)
    }
  }
  const endHeroDrag = () => {
    if (heroDragTimer.current) clearTimeout(heroDragTimer.current)
    heroDragTimer.current = undefined
    const distance = heroPendingX.current
    const completed = heroTouchAxis.current === 'horizontal' && Math.abs(distance) >= 48
    setHeroDragging(false)
    heroTouchAxis.current = ''
    if (!completed) {
      heroPendingX.current = 0
      setHeroDragX(0)
      return
    }
    setHeroDragX(distance)
    setHeroPhase(distance < 0 ? 'left' : 'right')
    heroAnimationTimer.current = setTimeout(() => {
      setHeroIndex(index => wrapHeroIndex(index + heroDirectionRef.current))
      setHeroDragX(0)
      setHeroPhase('reset')
      heroResetTimer.current = setTimeout(() => setHeroPhase(''), 34)
    }, 300)
  }

  const openSharedProduct = (productId?: string) => {
    if (!productId || handledShare.current === productId) return
    const product = products.find(item => item.id === productId)
    if (product) { handledShare.current = productId; setSelected(product) }
  }
  useLoad(({ productId }) => openSharedProduct(productId))
  useDidShow(() => {
    setPageActive(true)
    openSharedProduct(Taro.getEnterOptionsSync().query?.productId as string | undefined)
  })
  useDidHide(() => setPageActive(false))
  useShareAppMessage((event: any) => {
    const productId = event?.target?.dataset?.productId
    const product = products.find(item => item.id === productId) || selected
    return product ? buildProductShare(product) : { title: '美塑包装｜工业包装材料产品展厅', path: '/pages/gallery/index' }
  })
  useShareTimeline(() => ({ title: selected ? `美塑包装｜${selected.name}` : '美塑包装｜产品展厅', query: selected ? `productId=${selected.id}` : '' }))

  return <View className='skyline-shell'>
    <ScrollView scrollY className='skyline-scroll' showScrollbar={false}>
      <View className={`safe-page gallery ${!pageActive || selected ? 'gallery--paused' : ''}`}>
        <SiteHeader />
        <Text className='eyebrow'>PACKAGING MATERIALS · {new Date().getFullYear()}</Text>
        <View className='title-block'><Text className='title-line'>{catalogSettings.headlinePrimary}</Text><Text className='title-line title-line--serif'>{catalogSettings.headlineSecondary}</Text></View>
        <Text className='intro'>{catalogSettings.intro}</Text>

        <View
          className='hero-stage'
          onTouchStart={startHeroDrag}
          onTouchMove={moveHeroDrag}
          onTouchEnd={endHeroDrag}
          onTouchCancel={endHeroDrag}
        >
          <View className='hero-stage-grid' />
          <View className='hero-orbit hero-orbit--a' />
          <View className='hero-orbit hero-orbit--b' />
          <View className={`hero-deck ${heroDragging ? 'hero-deck--dragging' : ''} ${heroDirection < 0 ? 'hero-deck--reverse' : ''} ${heroPhase ? `hero-deck--${heroPhase}` : ''}`}>
            <View className='hero-deck-card hero-deck-card--incoming' style={heroCardStyle(heroImageAt(3))}><Image src={heroImageAt(3)} mode='aspectFit' lazyLoad onLoad={event => saveHeroImageSize(heroImageAt(3), Number(event.detail.width), Number(event.detail.height))} /></View>
            <View className='hero-deck-card hero-deck-card--bottom' style={heroCardStyle(heroImageAt(2))}><Image src={heroImageAt(2)} mode='aspectFit' lazyLoad onLoad={event => saveHeroImageSize(heroImageAt(2), Number(event.detail.width), Number(event.detail.height))} /></View>
            <View className='hero-deck-card hero-deck-card--middle' style={heroCardStyle(heroImageAt(1))}><Image src={heroImageAt(1)} mode='aspectFit' lazyLoad onLoad={event => saveHeroImageSize(heroImageAt(1), Number(event.detail.width), Number(event.detail.height))} /></View>
            <View className='hero-deck-card hero-deck-card--top' style={heroCardStyle(heroImageAt(0), heroDragging ? `translate3d(${heroDragX}px,0,0) rotate(${heroDragX / 24}deg)` : undefined)}>
              <Image src={heroImageAt(0)} mode='aspectFit' onLoad={event => saveHeroImageSize(heroImageAt(0), Number(event.detail.width), Number(event.detail.height))} />
            </View>
          </View>
          <View className='hero-meta'><Text>PRODUCT · {String(products.findIndex(item => item.id === hero.id) + 1).padStart(3, '0')}</Text><Text>{hero.name}</Text><Text>{hero.subtitle}</Text></View>
          {hero.images.length > 1 && <View className='hero-pages'>{hero.images.map((_, index) => <Text key={index} className={index === heroIndex ? 'active' : ''} />)}</View>}
          <View className='hero-detail' onClick={event => { event.stopPropagation(); setSelected(hero) }}>查看大图 <Text>↗</Text></View>
        </View>

        <View className='marquee'><Text>{catalogSettings.marqueeText} · {catalogSettings.marqueeText} ·</Text></View>
        <View className='search'><Text>⌕</Text><Input value={keyword} onInput={event => setKeyword(event.detail.value)} placeholder='搜索材料或产品' /></View>
        <View className='section-title'><View><Text>PRODUCT SAMPLES</Text><Text>所有产品</Text></View><Text>{list.length} SAMPLES</Text></View>
        <View className='product-list'>
          {list.map((product, index) => <View className={`product-row tone-${index % 4}`} key={product.id} onClick={() => setSelected(product)}>
            <View className='row-image'>
              <CachedImage src={product.images[0]} mode='aspectFill' width={520} />
            </View>
            <View className='row-gradient' />
            <View className='row-copy'>
              <Text className='row-number'>{String(products.findIndex(item => item.id === product.id) + 1).padStart(3, '0')} / {product.category}</Text>
              <View><Text className='row-title'>{product.name}</Text><Text className='row-sub'>{product.subtitle}</Text></View>
            </View>
            <Text className='row-arrow'>↗</Text>
          </View>)}
        </View>
      </View>
    </ScrollView>
    <SkylineProductDetail product={selected} onClose={() => setSelected(null)} />
  </View>
}
