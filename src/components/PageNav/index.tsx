import { Text, View } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './index.scss'

export type MainPage = 'gallery' | 'category' | 'contact'

const items: Array<{ key: MainPage; number: string; label: string; route: string }> = [
  { key: 'gallery', number: '01', label: '展厅', route: 'pages/gallery/index' },
  { key: 'category', number: '02', label: '分类', route: 'pages/category/index' },
  { key: 'contact', number: '03', label: '联系', route: 'pages/contact/index' }
]

let navigationPending = false

export async function goToMainPage(key: MainPage, _from?: MainPage) {
  const target = items.find(item => item.key === key)
  if (!target || navigationPending) return

  const pages = Taro.getCurrentPages()
  const currentRoute = pages[pages.length - 1]?.route?.replace(/^[/]/, '')
  if (currentRoute === target.route) return

  navigationPending = true
  try {
    const existingIndex = pages.findIndex(page => page.route?.replace(/^[/]/, '') === target.route)
    if (existingIndex >= 0) {
      await Taro.navigateBack({ delta: pages.length - 1 - existingIndex })
    } else {
      await Taro.navigateTo({ url: `/${target.route}` })
    }
  } catch {
    Taro.showToast({ title: '页面切换失败，请重试', icon: 'none' })
  } finally {
    navigationPending = false
  }
}

export default function PageNav({ active }: { active: MainPage }) {
  const activeIndex = Math.max(0, items.findIndex(item => item.key === active))

  return <View className={`page-nav page-nav--${active}`}>
    <View className='page-nav-spectrum'><View /><View /><View /></View>
    <View className='page-nav-cursor' style={{ transform: `translateX(${activeIndex * 100}%)` }} />
    <View className='page-nav-items'>
      {items.map(item => <View key={item.key} className={`page-nav-item ${active === item.key ? 'page-nav-item--active' : ''}`} onClick={() => { void goToMainPage(item.key) }}>
        <Text>{item.number}</Text><Text>{item.label}</Text>
      </View>)}
    </View>
  </View>
}
