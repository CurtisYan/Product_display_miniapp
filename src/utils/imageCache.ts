import Taro from '@tarojs/taro'

type CacheEntry = {
  path: string
  size: number
  touchedAt: number
  expiresAt: number
}

type CacheIndex = Record<string, CacheEntry>

const CACHE_KEY = 'meisu-thumbnail-cache-v2'
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000
const MAX_CACHE_BYTES = 12 * 1024 * 1024
const MAX_CACHE_FILES = 48
const OSS_HOST = 'curtisyan.oss-cn-shenzhen.aliyuncs.com'

let cacheIndex: CacheIndex | null = null
const pending = new Map<string, Promise<string>>()
const fileSystem = Taro.getFileSystemManager()

function saveLocalFile(tempFilePath: string) {
  return new Promise<string>((resolve, reject) => {
    fileSystem.saveFile({
      tempFilePath,
      success: result => resolve(result.savedFilePath),
      fail: reject
    })
  })
}

function getLocalFileSize(filePath: string) {
  return new Promise<number>((resolve, reject) => {
    fileSystem.getFileInfo({
      filePath,
      success: result => resolve(result.size || 0),
      fail: reject
    })
  })
}

function deleteLocalFile(filePath: string) {
  fileSystem.removeSavedFile({
    filePath,
    fail: () => undefined
  })
}

function readIndex(): CacheIndex {
  if (cacheIndex) return cacheIndex
  try {
    cacheIndex = Taro.getStorageSync<CacheIndex>(CACHE_KEY) || {}
  } catch {
    cacheIndex = {}
  }
  return cacheIndex
}

function persistIndex() {
  try { Taro.setStorageSync(CACHE_KEY, readIndex()) } catch { /* storage metadata is best-effort */ }
}

function removeEntry(url: string) {
  const index = readIndex()
  const entry = index[url]
  if (!entry) return
  delete index[url]
  persistIndex()
  deleteLocalFile(entry.path)
}

async function pruneCache() {
  const index = readIndex()
  const entries = Object.entries(index).sort(([, a], [, b]) => b.touchedAt - a.touchedAt)
  let total = entries.reduce((sum, [, entry]) => sum + entry.size, 0)
  for (let i = MAX_CACHE_FILES; i < entries.length; i += 1) {
    const [url, entry] = entries[i]
    total -= entry.size
    removeEntry(url)
  }
  for (let i = 0; total > MAX_CACHE_BYTES && i < entries.length; i += 1) {
    const [url, entry] = entries[entries.length - 1 - i]
    if (!readIndex()[url]) continue
    total -= entry.size
    removeEntry(url)
  }
}

export function thumbnailUrl(source: string, width = 640) {
  if (!source) return ''
  if (!source.includes(OSS_HOST) || source.includes('x-oss-process=')) return source
  const separator = source.includes('?') ? '&' : '?'
  return `${source}${separator}x-oss-process=image/resize,w_${width},limit_1/format,webp/quality,q_78`
}

export async function resolveCachedImage(url: string) {
  if (!url || !url.startsWith('http')) return url
  const existingRequest = pending.get(url)
  if (existingRequest) return existingRequest

  const task = (async () => {
    const index = readIndex()
    const cached = index[url]
    if (cached && cached.expiresAt > Date.now()) {
      cached.touchedAt = Date.now()
      persistIndex()
      return cached.path
    }
    if (cached) removeEntry(url)

    const downloaded = await Taro.downloadFile({ url })
    if (downloaded.statusCode !== 200 || !downloaded.tempFilePath) throw new Error(`image download failed: ${downloaded.statusCode}`)
    const savedFilePath = await saveLocalFile(downloaded.tempFilePath)
    if (!savedFilePath) throw new Error('image save failed')
    const size = await getLocalFileSize(savedFilePath)
    index[url] = {
      path: savedFilePath,
      size,
      touchedAt: Date.now(),
      expiresAt: Date.now() + CACHE_TTL
    }
    persistIndex()
    pruneCache().catch(() => undefined)
    return savedFilePath
  })().catch(() => url).finally(() => pending.delete(url))

  pending.set(url, task)
  return task
}

export function invalidateCachedImage(url: string) {
  removeEntry(url)
}
