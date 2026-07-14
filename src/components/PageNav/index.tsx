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

let pendingNavigation: { from: MainPage; target: MainPage } | null = null

export function goToMainPage(key: MainPage, from?: MainPage) {
  const target = items.find(item => item.key === key)
  if (target && from && from !== key) pendingNavigation = { from, target: key }
  if (target) Taro.redirectTo({ url: target.url })
}

export default function PageNav({ active }: { active: MainPage }) {
  const activeIndex = Math.max(0, items.findIndex(item => item.key === active))
  const entryFrom = useRef<MainPage | null>(pendingNavigation?.target === active ? pendingNavigation.from : null)
  if (pendingNavigation?.target === active) pendingNavigation = null
  const entryFromIndex = entryFrom.current ? items.findIndex(item => item.key === entryFrom.current) : activeIndex
  const [cursorIndex, setCursorIndex] = useState(entryFromIndex < 0 ? activeIndex : entryFromIndex)
  const [transitioning, setTransitioning] = useState(Boolean(entryFrom.current))
  const animationTimer = useRef<ReturnType<typeof setTimeout>>()
  const releaseTimer = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    if (entryFrom.current && entryFrom.current !== active) {
      animationTimer.current = setTimeout(() => setCursorIndex(activeIndex), 16)
      releaseTimer.current = setTimeout(() => setTransitioning(false), 460)
      entryFrom.current = null
    } else {
      setCursorIndex(activeIndex)
      setTransitioning(false)
    }
    return () => {
      if (animationTimer.current) clearTimeout(animationTimer.current)
      if (releaseTimer.current) clearTimeout(releaseTimer.current)
    }
  }, [activeIndex])

  const goTo = (index: number) => {
    if (index === activeIndex || transitioning) return
    const target = items[index]
    setCursorIndex(index)
    setTransitioning(true)
    pendingNavigation = { from: active, target: target.key }
    Taro.redirectTo({ url: target.url }).catch(() => {
      pendingNavigation = null
      setCursorIndex(activeIndex)
      setTransitioning(false)
    })
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
