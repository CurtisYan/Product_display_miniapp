import { Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useEffect, useMemo, useRef, useState } from 'react'
import { invalidateCachedImage, resolveCachedImage, thumbnailUrl } from '@/utils/imageCache'

type Props = {
  src: string
  mode?: 'scaleToFill' | 'aspectFit' | 'aspectFill' | 'widthFix' | 'heightFix' | 'top' | 'bottom' | 'center' | 'left' | 'right' | 'top left' | 'top right' | 'bottom left' | 'bottom right'
  className?: string
  width?: number
}

let imageSequence = 0

export default function CachedImage({ src, mode = 'aspectFill', className, width = 640 }: Props) {
  const nodeId = useRef(`cached-thumb-${imageSequence += 1}`)
  const targetUrl = useMemo(() => thumbnailUrl(src, width), [src, width])
  const [visible, setVisible] = useState(false)
  const [resolvedSrc, setResolvedSrc] = useState('')

  useEffect(() => {
    const page = Taro.getCurrentInstance().page
    let observer: ReturnType<typeof Taro.createIntersectionObserver> | undefined
    try {
      observer = Taro.createIntersectionObserver(page as any, { thresholds: [0] })
      observer.relativeToViewport({ top: 260, bottom: 260 }).observe(`#${nodeId.current}`, result => {
        if ((result.intersectionRatio || 0) > 0) {
          setVisible(true)
          observer?.disconnect()
        }
      })
    } catch {
      setVisible(true)
    }
    return () => observer?.disconnect()
  }, [])

  useEffect(() => {
    if (!visible) return
    let active = true
    setResolvedSrc('')
    resolveCachedImage(targetUrl).then(path => { if (active) setResolvedSrc(path) })
    return () => { active = false }
  }, [targetUrl, visible])

  const recover = () => {
    if (resolvedSrc && resolvedSrc !== targetUrl) {
      invalidateCachedImage(targetUrl)
      setResolvedSrc(targetUrl)
    }
  }

  return <Image id={nodeId.current} className={className} src={resolvedSrc} mode={mode} lazyLoad onError={recover} />
}
