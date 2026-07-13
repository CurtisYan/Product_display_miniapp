import { Text, View } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useEffect, useRef, useState } from 'react'
import './index.scss'

export type MainPage = 'gallery' | 'category' | 'contact'

const items: Array<{ key: MainPage; number: string; label: string; url: string }> = [
  { key: 'gallery', number: '01', label: '展厅', url: '/pages/gallery/index' },
  { key: 'category', number: '02', label: '分类', url: '/pages/category/index' },
  { key: 'contact', number: '03', label: '联系', url: '/pages/contact/index' }
]

export function goToMainPage(key: MainPage) {
  const target = items.find(item => item.key === key)
  if (target) Taro.redirectTo({ url: target.url })
}

export default function PageNav({ active }: { active: MainPage }) {
  const activeIndex = Math.max(0, items.findIndex(item => item.key === active))
  const [cursorIndex, setCursorIndex] = useState(activeIndex)
  const [transitioning, setTransitioning] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    setCursorIndex(activeIndex)
    setTransitioning(false)
    return () => { if (timer.current) clearTimeout(timer.current) }
  }, [activeIndex])

  const goTo = (index: number) => {
    if (index === activeIndex || transitioning) return
    const target = items[index]
    setCursorIndex(index)
    setTransitioning(true)
    timer.current = setTimeout(() => {
      Taro.redirectTo({ url: target.url }).catch(() => {
        setCursorIndex(activeIndex)
        setTransitioning(false)
      })
    }, 170)
  }

  const visualActive = items[cursorIndex].key
  return <View className={`page-nav page-nav--${visualActive} ${transitioning ? 'page-nav--transitioning' : ''}`}>
    <View className='page-nav-spectrum'><View /><View /><View /></View>
    <View className='page-nav-cursor' style={{ transform: `translateX(${cursorIndex * 100}%)` }} />
    <View className='page-nav-items'>
      {items.map((item, index) => <View key={item.key} className={`page-nav-item ${visualActive === item.key ? 'page-nav-item--active' : ''}`} onClick={() => goTo(index)}>
        <Text>{item.number}</Text><Text>{item.label}</Text>
      </View>)}
    </View>
  </View>
}
