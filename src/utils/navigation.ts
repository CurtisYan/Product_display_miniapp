import Taro from '@tarojs/taro'

type MainPage = 'gallery' | 'category' | 'contact'

export function goToMainPage(page: MainPage) {
  void Taro.switchTab({ url: `/pages/${page}/index` }).catch(() => {
    Taro.showToast({ title: '页面切换失败，请重试', icon: 'none' })
  })
}
