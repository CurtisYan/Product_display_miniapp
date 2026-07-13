import { Image, Input, ScrollView, ShareElement, Text, View } from '@tarojs/components'
import Taro, { useDidHide, useDidShow, useLoad, useShareAppMessage, useShareTimeline } from '@tarojs/taro'
import { useMemo, useRef, useState } from 'react'
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
  const [heroMotion, setHeroMotion] = useState(0)
  const [pageActive, setPageActive] = useState(true)
  const handledShare = useRef('')
  const hero = products.find(product => product.id === catalogSettings.heroId) || products[0]
  const heroImage = hero.images[heroIndex]
  const list = useMemo(
    () => products.filter(product => product.id !== hero.id && (!keyword || `${product.name}${product.subtitle}`.toLowerCase().includes(keyword.toLowerCase()))),
    [hero.id, keyword]
  )

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

  function advanceHero() {
    setHeroMotion(value => value + 1)
    if (hero.images.length > 1) {
      setHeroIndex(index => (index + 1) % hero.images.length)
    }
  }

  return <View className='skyline-shell'>
    <ScrollView scrollY className='skyline-scroll' showScrollbar={false}>
      <View className={`safe-page gallery ${!pageActive || selected ? 'gallery--paused' : ''}`}>
        <SiteHeader />
        <Text className='eyebrow'>PACKAGING MATERIALS · {new Date().getFullYear()}</Text>
        <View className='title-block'><Text className='title-line'>{catalogSettings.headlinePrimary}</Text><Text className='title-line title-line--serif'>{catalogSettings.headlineSecondary}</Text></View>
        <Text className='intro'>{catalogSettings.intro}</Text>

        <View className={`hero-card hero-motion-${heroMotion % 3}`} onClick={advanceHero}>
          <View className='hero-stage-grid' />
          <ShareElement className='hero-share' mapkey={`product-${hero.id}`} transform={selected?.id === hero.id} transitionOnGesture duration={520} rectTweenType='materialRectArc'>
            <Image key={`${heroImage}-${heroMotion}`} className='hero-image' src={heroImage} mode='aspectFit' />
          </ShareElement>
          <View key={`scan-${heroMotion}`} className='hero-scan' />
          <View className='hero-shade' />
          <View className='hero-label'><Text>PRODUCT · {String(products.findIndex(item => item.id === hero.id) + 1).padStart(2, '0')}</Text><Text>{hero.name}</Text><Text>{hero.subtitle}</Text></View>
          {hero.images.length > 1 && <View className='hero-pages'>{hero.images.map((_, index) => <Text key={index} className={index === heroIndex ? 'active' : ''} />)}</View>}
          <View className='hero-detail' onClick={event => { event.stopPropagation(); setSelected(hero) }}>查看大图 ↗</View>
        </View>

        <View className='marquee'><Text>{catalogSettings.marqueeText} · {catalogSettings.marqueeText} ·</Text></View>
        <View className='search'><Text>⌕</Text><Input value={keyword} onInput={event => setKeyword(event.detail.value)} placeholder='搜索材料或产品' /></View>
        <View className='section-title'><Text>材料目录</Text><Text>{list.length} SAMPLES</Text></View>
        <View className='product-list'>
          {list.map((product, index) => <View className={`product-row tone-${index % 4}`} key={product.id} onClick={() => setSelected(product)}>
            <Text className='row-number'>{String(products.findIndex(item => item.id === product.id) + 1).padStart(2, '0')}</Text>
            <View><Text className='row-title'>{product.name}</Text><Text className='row-sub'>{product.subtitle}</Text></View>
            <View className='art-image'>
              <ShareElement className='art-share' mapkey={`product-${product.id}`} transform={selected?.id === product.id} transitionOnGesture duration={520} rectTweenType='materialRectArc'>
                <CachedImage src={product.images[0]} mode='aspectFill' width={520} />
              </ShareElement>
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
