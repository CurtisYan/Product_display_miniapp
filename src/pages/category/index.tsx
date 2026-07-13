import { Text, View } from '@tarojs/components'
import { useShareAppMessage } from '@tarojs/taro'
import { useMemo, useState } from 'react'
import SiteHeader from '@/components/SiteHeader'
import ProductDetail from '@/components/ProductDetail'
import PageNav from '@/components/PageNav'
import CachedImage from '@/components/CachedImage'
import { categories, products, type Product } from '@/data/products'
import './index.scss'

export default function Category() {
  const [active, setActive] = useState(categories[0])
  const [selected, setSelected] = useState<Product | null>(null)
  const list = useMemo(() => products.filter(product => product.category === active), [active])

  useShareAppMessage(() => ({ title: '美塑包装｜产品分类', path: '/pages/category/index' }))

  return <View className='safe-page category'>
    <SiteHeader />
    <Text className='eyebrow'>MATERIAL INDEX</Text>
    <View className='title-block'>
      <Text className='title-line'>按材料，</Text>
      <Text className='title-line title-line--serif'>重新排列。</Text>
    </View>

    <View className='category-tabs'>
      {categories.map(category => <View key={category} className={`pill ${active === category ? 'pill--active' : ''}`} onClick={() => setActive(category)}>{category}</View>)}
    </View>

    <View className='material-list'>
      {list.map((product, index) => <View key={product.id} className={`material-card card-${index % 5}`} onClick={() => setSelected(product)}>
        <CachedImage src={product.images[0]} mode='aspectFill' width={520} />
        <View className='material-copy'>
          <Text className='material-index'>{String(index + 1).padStart(2, '0')}</Text>
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
