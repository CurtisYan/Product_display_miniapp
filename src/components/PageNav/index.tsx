import { Text, View } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './index.scss'

export type MainPage = 'gallery' | 'category' | 'contact'

const pages: Array<{ key: MainPage; number: string; label: string; url: string }> = [
  { key: 'gallery', number: '01', label: '展厅', url: '/pages/gallery/index' },
  { key: 'category', number: '02', label: '分类', url: '/pages/category/index' },
  { key: 'contact', number: '03', label: '联系', url: '/pages/contact/index' }
]

export function goToMainPage(page: MainPage) {
  const target = pages.find(item => item.key === page)
  if (target) Taro.redirectTo({ url: target.url })
}

export default function PageNav({ active }: { active: MainPage }) {
  return <View className={`page-nav page-nav--${active}`}>
    <View className={`page-nav-progress page-nav-progress--${active}`} />
    <View className='page-nav-items'>
      {pages.map(item => <View key={item.key} className={`page-nav-item ${active === item.key ? 'page-nav-item--active' : ''}`} onClick={() => active !== item.key && goToMainPage(item.key)}>
        <Text>{item.number}</Text><Text>{item.label}</Text>
      </View>)}
    </View>
  </View>
}
