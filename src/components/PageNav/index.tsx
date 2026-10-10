import { Text, View } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './index.scss'

export type MainPage = 'gallery' | 'category' | 'contact'

const items: Array<{ key: MainPage; number: string; label: string }> = [
  { key: 'gallery', number: '01', label: '展厅' },
  { key: 'category', number: '02', label: '分类' },
  { key: 'contact', number: '03', label: '联系' }
]

let selectPage: ((key: MainPage) => void) | null = null

export function registerMainPageHandler(handler: (key: MainPage) => void) {
  selectPage = handler
  return () => { if (selectPage === handler) selectPage = null }
}

export function goToMainPage(key: MainPage) {
  if (selectPage) selectPage(key)
  else void Taro.reLaunch({ url: `/pages/gallery/index?view=${key}` })
}

export default function PageNav({ active }: { active: MainPage }) {
  const activeIndex = items.findIndex(item => item.key === active)

  return <View className={`page-nav page-nav--${active}`}>
    <View className='page-nav-spectrum'><View /><View /><View /></View>
    <View className='page-nav-cursor' style={{ transform: `translateX(${activeIndex * 100}%)` }} />
    <View className='page-nav-items'>
      {items.map(item => <View key={item.key} className={`page-nav-item ${active === item.key ? 'page-nav-item--active' : ''}`} onClick={() => goToMainPage(item.key)}>
        <Text>{item.number}</Text><Text>{item.label}</Text>
      </View>)}
    </View>
  </View>
}
