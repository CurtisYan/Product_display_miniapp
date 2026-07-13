import { useRef } from 'react'
import { goToMainPage, type MainPage } from '@/components/PageNav'

const order: MainPage[] = ['gallery', 'category', 'contact']

export default function usePageSwipe(active: MainPage) {
  const start = useRef({ x: 0, y: 0 })
  return {
    onTouchStart(event: any) {
      const touch = event.touches[0]
      if (touch) start.current = { x: touch.clientX, y: touch.clientY }
    },
    onTouchEnd(event: any) {
      const touch = event.changedTouches[0]
      if (!touch) return
      const dx = touch.clientX - start.current.x
      const dy = touch.clientY - start.current.y
      if (Math.abs(dx) < 85 || Math.abs(dx) < Math.abs(dy) * 1.35) return
      const index = order.indexOf(active)
      const next = dx < 0 ? index + 1 : index - 1
      if (next >= 0 && next < order.length) goToMainPage(order[next])
    }
  }
}
