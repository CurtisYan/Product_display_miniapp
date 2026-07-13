import { WebView } from '@tarojs/components'
import { useRouter } from '@tarojs/taro'

export default function CompanyWebsite() {
  const router = useRouter()
  const url = router.params.url ? decodeURIComponent(router.params.url) : 'https://www.sfy.cn'
  return <WebView src={url} />
}
