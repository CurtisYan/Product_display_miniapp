import { Text, View } from '@tarojs/components'
import Taro, { usePageScroll, useShareAppMessage } from '@tarojs/taro'
import { useEffect, useMemo, useRef, useState } from 'react'
import SiteHeader from '@/components/SiteHeader'
import ProductDetail from '@/components/ProductDetail'
import PageNav from '@/components/PageNav'
import CachedImage from '@/components/CachedImage'
import { categories, products, type Product } from '@/data/products'
import './index.scss'

export default function Category() {
  const [active, setActive] = useState(categories[0])
  const [selected, setSelected] = useState<Product | null>(null)
  const scrollTop = useRef(0)
  const restoreScrollTop = useRef<number | null>(null)
  const list = useMemo(() => products.filter(product => product.category === active), [active])
  const maxCategorySize = useMemo(() => Math.max(...categories.map(category => products.filter(product => product.category === category).length)), [])

  useShareAppMessage((event: any) => {
    const productId = event?.target?.dataset?.productId
    const product = products.find(item => item.id === productId) || selected
    return product
      ? { title: `美塑包装｜${product.name}`, path: `/pages/gallery/index?productId=${product.id}`, imageUrl: product.images[0] }
      : { title: '美塑包装｜产品分类', path: '/pages/category/index' }
  })
  usePageScroll(event => { scrollTop.current = event.scrollTop })

  useEffect(() => {
    if (restoreScrollTop.current === null) return
    const target = restoreScrollTop.current
    restoreScrollTop.current = null
    Taro.nextTick(() => Taro.pageScrollTo({ scrollTop: target, duration: 0 }).catch(() => undefined))
  }, [active])

  const changeCategory = (category: string) => {
    if (category === active) return
    restoreScrollTop.current = scrollTop.current
    setActive(category)
  }

  return <View className='safe-page category'>
    <SiteHeader />
    <Text className='eyebrow'>MATERIAL INDEX</Text>
    <View className='title-block'>
      <Text className='title-line'>按材料，</Text>
      <Text className='title-line title-line--serif'>重新排列。</Text>
    </View>

    <View className='category-tabs'>
      {categories.map(category => <View key={category} className={`pill ${active === category ? 'pill--active' : ''}`} onClick={() => changeCategory(category)}>{category}</View>)}
    </View>

    <View className='material-list' style={{ minHeight: `${maxCategorySize * 236}rpx` }}>
      {list.map((product, index) => <View key={product.id} className={`material-card card-${index % 5}`} onClick={() => setSelected(product)}>
        <CachedImage src={product.images[0]} mode='aspectFill' width={520} />
        <View className='material-copy'>
          <Text className='material-index'>{String(products.findIndex(item => item.id === product.id) + 1).padStart(2, '0')} / {active}</Text>
          <Text className='material-name'>{product.name}</Text>
          <Text className='material-subtitle'>{product.subtitle}</Text>
          {product.limited && <Text className='limited-badge'>限制生产 · 末位展示</Text>}
        </View>
        <Text className='material-arrow'>↗</Text>
      </View>)}
    </View>

    <Text className='gesture-tip'>点击卡片查看材料大图与说明</Text>
    <ProductDetail product={selected} onClose={() => setSelected(null)} />
    <PageNav active='category' />
  </View>
}
