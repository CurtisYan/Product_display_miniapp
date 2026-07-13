import { Image, ScrollView, Text, View } from '@tarojs/components'
import Taro, { useShareAppMessage } from '@tarojs/taro'
import { memo, useCallback, useEffect, useRef, useState } from 'react'
import { catalogSettings } from '@/data/products'
import SiteHeader from '@/components/SiteHeader'
import PageNav from '@/components/PageNav'
import './index.scss'

const OSS = 'https://curtisyan.oss-cn-shenzhen.aliyuncs.com/meisubaocai-mini-app/'
const assetUrl = (...parts: string[]) => OSS + parts.map(encodeURIComponent).join('/')
const QR = assetUrl('company', '微信二维码.jpeg')
const LOGO = assetUrl('company', 'SFYlogo.jpeg')
const PHONE = '18924644110'
const SPECIMENS = [
  { id: 'meisu-red', image: assetUrl('contact-playground', '01-meisu-red-v2.png') },
  { id: 'botanical-white', image: assetUrl('contact-playground', '02-botanical-white.png') },
  { id: 'sfy-grid', image: assetUrl('contact-playground', '03-sfy-grid.png') },
  { id: 'sfy-pattern-purple', image: assetUrl('contact-playground', '04-sfy-pattern-purple.png') },
  { id: 'sfy-seal-black', image: assetUrl('contact-playground', '05-sfy-seal-black.png') },
  { id: 'amber-abstract', image: assetUrl('contact-playground', '06-amber-abstract.png') }
]

type DragPoint = { x: number; y: number }
type TouchPoint = DragPoint & { moved: boolean }
type Specimen = (typeof SPECIMENS)[number]

type SpecimenCardProps = {
  specimen: Specimen
  index: number
  slot: number
  showcaseReady: boolean
  showcaseEntered: boolean
  onLoaded: (productId: string) => void
  onDrop: (productId: string, slot: number, offset: DragPoint) => void
}

const SpecimenCard = memo(function SpecimenCard({
  specimen,
  index,
  slot,
  showcaseReady,
  showcaseEntered,
  onLoaded,
  onDrop
}: SpecimenCardProps) {
  const [dragOffset, setDragOffset] = useState<DragPoint>({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const [bouncing, setBouncing] = useState(false)
  const dragStart = useRef<TouchPoint | null>(null)
  const pendingDrag = useRef<DragPoint>({ x: 0, y: 0 })
  const dragTimer = useRef<ReturnType<typeof setTimeout>>()
  const bounceTimer = useRef<ReturnType<typeof setTimeout>>()
  const clickBlockTimer = useRef<ReturnType<typeof setTimeout>>()
  const clickBlocked = useRef(false)

  useEffect(() => () => {
    if (dragTimer.current) clearTimeout(dragTimer.current)
    if (bounceTimer.current) clearTimeout(bounceTimer.current)
    if (clickBlockTimer.current) clearTimeout(clickBlockTimer.current)
  }, [])

  const getTouchPoint = (event: any) => {
    const touch = event.touches?.[0] || event.changedTouches?.[0]
    if (!touch) return null
    return {
      x: touch.clientX ?? touch.pageX ?? 0,
      y: touch.clientY ?? touch.pageY ?? 0
    }
  }

  const startDrag = (event: any) => {
    const point = getTouchPoint(event)
    if (!point) return
    event.stopPropagation()
    pendingDrag.current = { x: 0, y: 0 }
    dragStart.current = { ...point, moved: false }
    setDragging(true)
  }

  const trackDrag = (event: any) => {
    const start = dragStart.current
    const point = getTouchPoint(event)
    if (!start || !point) return
    event.stopPropagation()
    const next = { x: point.x - start.x, y: point.y - start.y }
    if (Math.abs(next.x) > 5 || Math.abs(next.y) > 5) start.moved = true
    pendingDrag.current = next
    if (dragTimer.current) return
    // 约 30fps 已足够跟手，并且这里只更新当前样品，不触发整页重绘。
    dragTimer.current = setTimeout(() => {
      dragTimer.current = undefined
      setDragOffset({ ...pendingDrag.current })
    }, 32)
  }

  const endDrag = (event: any) => {
    const start = dragStart.current
    if (!start) return
    event.stopPropagation()
    if (dragTimer.current) {
      clearTimeout(dragTimer.current)
      dragTimer.current = undefined
    }
    const finalOffset = { ...pendingDrag.current }
    setDragOffset(finalOffset)
    onDrop(specimen.id, slot, finalOffset)
    if (start.moved) {
      clickBlocked.current = true
      if (clickBlockTimer.current) clearTimeout(clickBlockTimer.current)
      clickBlockTimer.current = setTimeout(() => { clickBlocked.current = false }, 180)
    }
    dragStart.current = null
    pendingDrag.current = { x: 0, y: 0 }
    setDragging(false)
    // 下一帧回到新卡槽，CSS 负责弹性归位。
    setTimeout(() => setDragOffset({ x: 0, y: 0 }), 20)
  }

  const bounce = () => {
    if (clickBlocked.current) return
    if (bounceTimer.current) clearTimeout(bounceTimer.current)
    setBouncing(true)
    bounceTimer.current = setTimeout(() => setBouncing(false), 680)
  }

  const column = slot % 2
  const row = Math.floor(slot / 2)

  return <View
    className={`specimen-item ${!showcaseReady ? 'specimen-item--waiting' : showcaseEntered ? 'specimen-item--ready' : `specimen-item--enter-${index}`} ${dragging ? 'specimen-item--dragging' : ''} ${bouncing ? 'specimen-item--bouncing' : ''}`}
    style={{
      left: `${column * 50}%`,
      top: `${row * 33.333}%`,
      zIndex: dragging ? 12 : 2,
      transform: `translate3d(${dragOffset.x}px, ${dragOffset.y}px, 0)`
    }}
    catchMove={dragging}
    onTouchStart={startDrag}
    onTouchMove={trackDrag}
    onTouchEnd={endDrag}
    onTouchCancel={endDrag}
    onClick={bounce}
  >
    <View className='specimen-object'>
      <View className='specimen-object-shadow' />
      <Image className='specimen-object-image' src={specimen.image} mode='aspectFit' lazyLoad onLoad={() => onLoaded(specimen.id)} onError={() => onLoaded(specimen.id)} />
    </View>
  </View>
})

function Contact() {
  const [qrVisible, setQrVisible] = useState(false)
  const [loadedSpecimens, setLoadedSpecimens] = useState<Record<string, boolean>>({})
  const [showcaseEntered, setShowcaseEntered] = useState(false)
  const [slots, setSlots] = useState<Record<string, number>>(() => Object.fromEntries(SPECIMENS.map((specimen, index) => [specimen.id, index])))
  const entranceTimer = useRef<ReturnType<typeof setTimeout>>()
  const showcaseReady = SPECIMENS.every(specimen => loadedSpecimens[specimen.id])
  useShareAppMessage(() => ({ title: '深圳市美塑包装材料有限公司', path: '/pages/contact/index', imageUrl: LOGO }))

  useEffect(() => () => {
    if (entranceTimer.current) clearTimeout(entranceTimer.current)
  }, [])

  useEffect(() => {
    if (!showcaseReady || showcaseEntered || entranceTimer.current) return
    entranceTimer.current = setTimeout(() => {
      entranceTimer.current = undefined
      setShowcaseEntered(true)
    }, 1650)
  }, [showcaseReady, showcaseEntered])

  const call = () => Taro.makePhoneCall({ phoneNumber: PHONE }).catch(() => undefined)
  const copyPhone = () => Taro.setClipboardData({ data: PHONE })
  const openWebsite = () => Taro.navigateTo({ url: `/pages/webview/index?url=${encodeURIComponent(catalogSettings.website)}` })
  const dropSpecimen = useCallback((productId: string, sourceSlot: number, finalOffset: DragPoint) => {
    Taro.createSelectorQuery().select('#specimen-board').boundingClientRect(rect => {
      const bounds = Array.isArray(rect) ? rect[0] : rect
      if (!bounds) return
      const cellWidth = bounds.width / 2
      const cellHeight = bounds.height / 3
      const sourceColumn = sourceSlot % 2
      const sourceRow = Math.floor(sourceSlot / 2)
      const centerX = (sourceColumn + .5) * cellWidth + finalOffset.x
      const centerY = (sourceRow + .5) * cellHeight + finalOffset.y
      const targetColumn = Math.max(0, Math.min(1, Math.floor(centerX / cellWidth)))
      const targetRow = Math.max(0, Math.min(2, Math.floor(centerY / cellHeight)))
      const targetSlot = targetRow * 2 + targetColumn
      if (targetSlot === sourceSlot) return
      setSlots(current => {
        const occupant = Object.keys(current).find(id => current[id] === targetSlot)
        return { ...current, [productId]: targetSlot, ...(occupant ? { [occupant]: sourceSlot } : {}) }
      })
    }).exec()
  }, [])
  const markSpecimenLoaded = useCallback((productId: string) => {
    setLoadedSpecimens(current => current[productId] ? current : { ...current, [productId]: true })
  }, [])

  return <View className='skyline-shell'>
    <ScrollView scrollY className='skyline-scroll' showScrollbar={false}>
      <View className='safe-page contact'>
        <SiteHeader />
        <Text className='eyebrow'>HELLO, MEISU</Text>
        <View className='title-block'>
          <Text className='title-line'>做包装，</Text>
          <Text className='title-line title-line--serif'>先聊产品。</Text>
        </View>

        <View className='showcase-archive'>
          <View className='archive-spine'><Text>MEISU</Text><Text>PACKAGING</Text></View>
          <View className='archive-frame'>
            <View className='specimen-heading'>
              <View><Text>PRODUCT COMPOSITION / 01</Text><Text>精美产品展示</Text><Text>纸张、油墨与工业材料的编辑部档案盒</Text></View>
              <View className='archive-heading-dot' />
            </View>
            <View id='specimen-board' className='specimen-board'>
              <View className='specimen-board-ring' />
              <View className='specimen-board-bars'><View /><View /></View>
              {SPECIMENS.map((specimen, index) => {
                return <SpecimenCard
                  key={specimen.id}
                  specimen={specimen}
                  index={index}
                  slot={slots[specimen.id] ?? index}
                  showcaseReady={showcaseReady}
                  showcaseEntered={showcaseEntered}
                  onLoaded={markSpecimenLoaded}
                  onDrop={dropSpecimen}
                />
              })}
            </View>
          </View>
          <View className='archive-stamp'><Text>GRID</Text><Text>ARCHIVE</Text></View>
        </View>

        <View className='phone-card' onClick={call} onLongPress={copyPhone}>
          <View className='phone-card-top'><Text>PHONE / 电话</Text><Text>↗</Text></View>
          <Text className='phone-number'>189 2464 4110</Text>
          <Text className='phone-tip'>点击拨号 · 长按复制手机号</Text>
        </View>

        <View className='company-line'>
          <Image src={LOGO} mode='aspectFit' />
          <View><Text>深圳市美塑包装材料有限公司</Text><Text>广东省惠州市沥林镇</Text></View>
        </View>

        <View className='wechat-card' onClick={() => setQrVisible(true)}>
          <View><Text>微信联系</Text><Text>点击查看微信二维码</Text></View><Text className='wechat-arrow'>↗</Text>
        </View>

        <View className='company-note'>
          <Text className='company-note-title'>{catalogSettings.contactTitle}</Text>
          <Text className='company-note-copy'>{catalogSettings.contactIntro}</Text>
          <Text className='company-site' onClick={openWebsite}>{catalogSettings.websiteLabel} · 点击跳转 ↗</Text>
          <Text className='company-slogan'>{catalogSettings.contactSlogan}</Text>
        </View>
      </View>
    </ScrollView>
    <PageNav active='contact' />

    {qrVisible && <View className='qr-mask' onClick={() => setQrVisible(false)}>
      <View className='qr-sheet' onClick={event => event.stopPropagation()}>
        <View className='qr-sheet-head'><Text>微信二维码</Text><Text>点击外部关闭</Text></View>
        <Image className='qr-image' src={QR} mode='widthFix' showMenuByLongpress />
        <Text className='qr-tip'>长按二维码，使用微信菜单识别</Text>
      </View>
    </View>}
  </View>
}

export default Contact
