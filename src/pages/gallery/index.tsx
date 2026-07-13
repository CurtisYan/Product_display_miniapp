import { Image, Input, ScrollView, ShareElement, Text, View } from '@tarojs/components'
import Taro, { useDidHide, useDidShow, useLoad, useShareAppMessage, useShareTimeline } from '@tarojs/taro'
import { useEffect, useMemo, useRef, useState } from 'react'
import SiteHeader from '@/components/SiteHeader'
import PageNav from '@/components/PageNav'
import CachedImage from '@/components/CachedImage'
import SkylineProductDetail from '@/components/SkylineProductDetail'
import { catalogSettings, products, type Product } from '@/data/products'
import { buildProductShare } from '@/utils/share'
import './index.scss'

export default function Gallery() {
  const [selected, setSelected] = useState<Product | null>(null)
  const [keyword, setKeyword] = useState('')
  const [heroIndex, setHeroIndex] = useState(0)
  const [heroPhase, setHeroPhase] = useState('')
  const [pageActive, setPageActive] = useState(true)
  const [heroDrag, setHeroDrag] = useState({ x: 0, y: 0 })
  const [heroDragging, setHeroDragging] = useState(false)
  const handledShare = useRef('')
  const heroStart = useRef({ x: 0, y: 0 })
  const heroPending = useRef({ x: 0, y: 0 })
  const heroTimer = useRef<ReturnType<typeof setTimeout>>()
  const heroSwitchTimer = useRef<ReturnType<typeof setTimeout>>()
  const heroEnterTimer = useRef<ReturnType<typeof setTimeout>>()
  const blockHeroClick = useRef(false)
  const clickTimer = useRef<ReturnType<typeof setTimeout>>()
  const hero = products.find(product => product.id === catalogSettings.heroId) || products[0]
  const heroImage = hero.images[heroIndex]
  const heroStack = Array.from({ length: Math.min(3, Math.max(0, hero.images.length - 1)) }, (_, index) => ({
    depth: index + 1,
    src: hero.images[(heroIndex + index + 1) % hero.images.length]
  }))
  const list = useMemo(
    () => products.filter(product => product.id !== hero.id && (!keyword || `${product.name}${product.subtitle}`.toLowerCase().includes(keyword.toLowerCase()))),
    [hero.id, keyword]
  )

  useEffect(() => () => {
    if (heroTimer.current) clearTimeout(heroTimer.current)
    if (heroSwitchTimer.current) clearTimeout(heroSwitchTimer.current)
    if (heroEnterTimer.current) clearTimeout(heroEnterTimer.current)
    if (clickTimer.current) clearTimeout(clickTimer.current)
  }, [])

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

  const switchHero = (direction: 'left' | 'right' | 'up' | 'down', step: number) => {
    if (hero.images.length < 2 || heroPhase) return
    blockHeroClick.current = true
    setHeroPhase(direction)
    heroSwitchTimer.current = setTimeout(() => {
      setHeroIndex(index => (index + step + hero.images.length) % hero.images.length)
      const entrance = direction === 'left' ? 'from-right' : direction === 'right' ? 'from-left' : direction === 'up' ? 'from-down' : 'from-up'
      setHeroDrag({ x: 0, y: 0 })
      setHeroPhase(entrance)
      heroEnterTimer.current = setTimeout(() => {
        setHeroPhase('')
        clickTimer.current = setTimeout(() => { blockHeroClick.current = false }, 380)
      }, 34)
    }, 260)
  }
  const heroTouchStart = (event: any) => {
    if (heroPhase) return
    const touch = event.touches[0]
    if (!touch) return
    if (heroTimer.current) clearTimeout(heroTimer.current)
    if (clickTimer.current) clearTimeout(clickTimer.current)
    heroStart.current = { x: touch.clientX, y: touch.clientY }
    heroPending.current = { x: 0, y: 0 }
    blockHeroClick.current = false
    setHeroDragging(true)
  }
  const heroTouchMove = (event: any) => {
    const touch = event.touches[0]
    if (!touch) return
    const dx = touch.clientX - heroStart.current.x
    const dy = touch.clientY - heroStart.current.y
    if (Math.abs(dx) > 7 || Math.abs(dy) > 7) blockHeroClick.current = true
    heroPending.current = { x: Math.max(-90, Math.min(90, dx)), y: Math.max(-90, Math.min(90, dy)) }
    if (!heroTimer.current) {
      heroTimer.current = setTimeout(() => {
        heroTimer.current = undefined
        setHeroDrag(heroPending.current)
      }, 32)
    }
  }
  const heroTouchEnd = () => {
    if (heroTimer.current) clearTimeout(heroTimer.current)
    heroTimer.current = undefined
    setHeroDragging(false)
    const { x, y } = heroPending.current
    const horizontal = Math.abs(x) >= Math.abs(y)
    if (Math.max(Math.abs(x), Math.abs(y)) >= 38) {
      if (horizontal) switchHero(x < 0 ? 'left' : 'right', x < 0 ? 1 : -1)
      else switchHero(y < 0 ? 'up' : 'down', y < 0 ? 1 : -1)
    } else {
      setHeroDrag({ x: 0, y: 0 })
      if (blockHeroClick.current) clickTimer.current = setTimeout(() => { blockHeroClick.current = false }, 120)
    }
  }
  const handleHeroClick = () => {
    if (!blockHeroClick.current) switchHero('left', 1)
  }

  const heroTransform = heroPhase === 'left'
    ? 'perspective(780px) translate3d(-125%, -5%, 32px) rotate(-9deg)'
    : heroPhase === 'right'
      ? 'perspective(780px) translate3d(125%, 5%, 32px) rotate(9deg)'
      : heroPhase === 'up'
        ? 'perspective(780px) translate3d(0, -125%, 32px) rotate(3deg)'
        : heroPhase === 'down'
          ? 'perspective(780px) translate3d(0, 125%, 32px) rotate(-3deg)'
          : heroPhase === 'from-right'
            ? 'perspective(780px) translate3d(125%, 5%, 32px) rotate(9deg)'
            : heroPhase === 'from-left'
              ? 'perspective(780px) translate3d(-125%, -5%, 32px) rotate(-9deg)'
              : heroPhase === 'from-down'
                ? 'perspective(780px) translate3d(0, 125%, 32px) rotate(-3deg)'
                : heroPhase === 'from-up'
                  ? 'perspective(780px) translate3d(0, -125%, 32px) rotate(3deg)'
                  : `perspective(780px) rotateX(${-heroDrag.y / 18}deg) rotateY(${heroDrag.x / 15}deg) translate3d(${heroDrag.x * .82}px,${heroDrag.y * .82}px,30px) rotate(${heroDrag.x / 35}deg)`

  return <View className='skyline-shell'>
    <ScrollView scrollY className='skyline-scroll' showScrollbar={false}>
      <View className={`safe-page gallery ${!pageActive || selected ? 'gallery--paused' : ''}`}>
        <SiteHeader />
        <Text className='eyebrow'>PACKAGING MATERIALS · {new Date().getFullYear()}</Text>
        <View className='title-block'><Text className='title-line'>{catalogSettings.headlinePrimary}</Text><Text className='title-line title-line--serif'>{catalogSettings.headlineSecondary}</Text></View>
        <Text className='intro'>{catalogSettings.intro}</Text>

        <View
          className={`hero-stage ${heroDragging ? 'hero-stage--dragging' : ''}`}
          onClick={handleHeroClick}
          onTouchStart={heroTouchStart}
          onTouchMove={heroTouchMove}
          onTouchEnd={heroTouchEnd}
          onTouchCancel={heroTouchEnd}
        >
          <View className='hero-stage-grid' />
          <View className='hero-orbit hero-orbit--a' style={{ transform: `translate(${heroDrag.x * -.12}px,${heroDrag.y * -.12}px)` }} />
          <View className='hero-orbit hero-orbit--b' style={{ transform: `translate(${heroDrag.x * .18}px,${heroDrag.y * .18}px)` }} />
          {heroStack.slice().reverse().map(card => <View className={`hero-stack-card hero-stack-card--${card.depth}`} key={`${card.src}-${card.depth}`}>
            <View className='hero-stack-glass' />
            <Image className='hero-stack-image' src={card.src} mode='aspectFit' lazyLoad />
          </View>)}
          <ShareElement
            className={`hero-product ${heroPhase.startsWith('from-') ? 'hero-product--teleport' : ''}`}
            style={{ transform: heroTransform }}
            mapkey={`product-${hero.id}`}
            transform={selected?.id === hero.id}
            transitionOnGesture
            duration={520}
            rectTweenType='materialRectArc'
          >
            <View className='hero-glass' />
            <Image key={heroImage} className='hero-product-image' src={heroImage} mode='aspectFit' />
            <View className='hero-refraction' style={{ transform: `translateX(${heroDrag.x * 2.7}px) rotate(18deg)` }} />
          </ShareElement>
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
              <ShareElement className='art-share' mapkey={`product-${product.id}`} transform={selected?.id === product.id} transitionOnGesture duration={520} rectTweenType='materialRectArc'>
                <CachedImage src={product.images[0]} mode='aspectFill' width={520} />
              </ShareElement>
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
    <PageNav active='gallery' />
  </View>
}
