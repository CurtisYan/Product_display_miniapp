import Taro from '@tarojs/taro'
import type {Product} from '@/data/products'
export function buildProductShare(p:Product){return{title:`【${p.name}】${p.subtitle}`,path:`/pages/gallery/index?productId=${encodeURIComponent(p.id)}&from=share`,imageUrl:p.images[0]}}
export function saveShareRecord(p:Product,type='appMessage'){const records=Taro.getStorageSync('shareRecords')||[];records.push({productId:p.id,productName:p.name,shareType:type,timestamp:Date.now()});Taro.setStorageSync('shareRecords',records.slice(-100))}
