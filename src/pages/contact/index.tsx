import { Image, ScrollView, Text, View } from '@tarojs/components'
import Taro, { useShareAppMessage } from '@tarojs/taro'
import { useEffect, useRef, useState } from 'react'
import { catalogSettings } from '@/data/products'
import SiteHeader from '@/components/SiteHeader'
import PageNav from '@/components/PageNav'
import './index.scss'

const OSS = 'https://curtisyan.oss-cn-shenzhen.aliyuncs.com/meisubaocai-mini-app/'
const QR = `${OSS}${encodeURIComponent('微信二维码.jpeg')}`
const LOGO = `${OSS}SFYlogo.jpeg`
const PHONE = '18924644110'

function Contact() {
  const [qrVisible, setQrVisible] = useState(false)
  const [materialX, setMaterialX] = useState(0)
  const [materialActive, setMaterialActive] = useState(false)
  const materialStart = useRef({ x: 0, y: 0 })
  const materialPending = useRef(0)
  const materialTimer = useRef<ReturnType<typeof setTimeout>>()
  useShareAppMessage(() => ({ title: '深圳市美塑包装材料有限公司', path: '/pages/contact/index', imageUrl: LOGO }))

  useEffect(() => () => {
    if (materialTimer.current) clearTimeout(materialTimer.current)
  }, [])

  const materialTouchStart = (event: any) => {
    const touch = event.touches[0]
    if (!touch) return
    if (materialTimer.current) clearTimeout(materialTimer.current)
    materialTimer.current = undefined
    materialStart.current = { x: touch.clientX, y: touch.clientY }
    materialPending.current = materialX
    setMaterialActive(true)
  }
  const materialTouchMove = (event: any) => {
    const touch = event.touches[0]
    if (!touch) return
    const dx = touch.clientX - materialStart.current.x
    const dy = touch.clientY - materialStart.current.y
    if (Math.abs(dx) < Math.abs(dy)) return
    materialPending.current = Math.max(-130, Math.min(130, dx))
    if (!materialTimer.current) {
      materialTimer.current = setTimeout(() => {
        materialTimer.current = undefined
        setMaterialX(materialPending.current)
      }, 32)
    }
  }
  const materialTouchEnd = () => {
    if (materialTimer.current) clearTimeout(materialTimer.current)
    materialTimer.current = undefined
    setMaterialX(0)
    setMaterialActive(false)
  }

  const call = () => Taro.makePhoneCall({ phoneNumber: PHONE }).catch(() => undefined)
  const copyPhone = () => Taro.setClipboardData({ data: PHONE })

  return <View className='skyline-shell'>
    <ScrollView scrollY className='skyline-scroll' showScrollbar={false}>
      <View className='safe-page contact'>
        <SiteHeader />
        <Text className='eyebrow'>HELLO, MEISU</Text>
        <View className='title-block'>
          <Text className='title-line'>做包装，</Text>
          <Text className='title-line title-line--serif'>先聊产品。</Text>
        </View>

        <View className='material-heading'>
          <Text>MATERIAL FIELD / 01</Text>
          <Text>拖动样本，查看四种材料结构。</Text>
        </View>
        <View
          className={`material-lab ${materialActive ? 'material-lab--active' : ''}`}
          onTouchStart={materialTouchStart}
          onTouchMove={materialTouchMove}
          onTouchEnd={materialTouchEnd}
          onTouchCancel={materialTouchEnd}
        >
            <View className='material-coordinate material-coordinate--top'>−130　DRAG FIELD　+130</View>
            <View className='material-deck'>
              <View className='material-layer material-cushion' style={{ transform: `translateX(${materialX * -.08}px) translateY(48px) rotate(${materialX * -.008 + 2}deg)` }}><Text>04</Text><Text>缓冲结构</Text><View className='material-bubbles' /></View>
              <View className='material-layer material-static' style={{ transform: `translateX(${materialX * .15}px) translateY(28px) rotate(${materialX * .012 - 2}deg)` }}><Text>03</Text><Text>静电屏障</Text><View className='material-charge'>＋　−　＋　−</View></View>
              <View className='material-layer material-grid' style={{ transform: `translateX(${materialX * -.24}px) translateY(8px) rotate(${materialX * -.018 + 4}deg)` }}><Text>02</Text><Text>网格导电</Text><View className='material-grid-pattern' /></View>
              <View className='material-layer material-film' style={{ transform: `translateX(${materialX * .38}px) translateY(-12px) rotate(${materialX * .025 - 5}deg)` }}><Text>01</Text><Text>透明薄膜</Text><View className='material-glint' style={{ transform: `translateX(${materialX * 1.6}px) rotate(18deg)` }} /></View>
            </View>
            <View className='material-coordinate material-coordinate--bottom'><Text>拖动样本</Text><Text>释放后弹性归位 ↔</Text></View>
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
      <Text className='company-site' onClick={() => Taro.navigateTo({ url: `/pages/webview/index?url=${encodeURIComponent(catalogSettings.website)}` })}>{catalogSettings.websiteLabel} · 点击跳转 ↗</Text>
      <Text className='company-slogan'>{catalogSettings.contactSlogan}</Text>
        </View>
      </View>
    </ScrollView>
    <PageNav active='contact' />

    {qrVisible && <View className='qr-mask' onClick={() => setQrVisible(false)}>
      <View className='qr-sheet' onClick={event => event.stopPropagation()}>
        <View className='qr-sheet-head'><Text>微信二维码</Text><Text onClick={() => setQrVisible(false)}>关闭 ×</Text></View>
        <Image className='qr-image' src={QR} mode='aspectFit' showMenuByLongpress />
        <Text className='qr-tip'>长按二维码，使用微信菜单识别</Text>
      </View>
    </View>}
  </View>
}

export default Contact
