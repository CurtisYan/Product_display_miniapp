import { Image, Text, View } from '@tarojs/components'
import Taro from '@tarojs/taro'
import logo from '@/assets/SFYlogo-black-circle.svg'
import './index.scss'

export default function SiteHeader() {
  const windowInfo = Taro.getWindowInfo()
  const menu = Taro.getMenuButtonBoundingClientRect()
  const statusBarHeight = windowInfo.statusBarHeight || 20
  const menuGap = Math.max(4, menu.top - statusBarHeight)
  const navigationHeight = menu.height + menuGap * 2
  return <View className='site-header' style={{ paddingTop: `${statusBarHeight}px`, minHeight: `${navigationHeight}px` }}>
    <Image className='brand-mark' src={logo} mode='aspectFit' />
    <Text>美塑包装</Text>
  </View>
}
