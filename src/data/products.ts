import catalog from './catalog.json'

export type Product={id:string;name:string;subtitle:string;description:string;category:string;images:string[];priority:number;limited?:boolean}
export type CatalogSettings=typeof catalog.settings
export type CatalogCategory=typeof catalog.categories[number]

const OSS='https://curtisyan.oss-cn-shenzhen.aliyuncs.com/meisubaocai-mini-app/'
const imageUrl=(value:string)=>/^https?:\/\//.test(value)?value:OSS+value.split('/').map(encodeURIComponent).join('/')
const normalize=(item:Omit<Product,'priority'>,index:number):Product=>({...item,priority:index+1,images:item.images.map(imageUrl)})

export const catalogSettings:CatalogSettings=catalog.settings
export const categoryConfig:CatalogCategory[]=catalog.categories
export const categories=categoryConfig.map(category=>category.name)
const allProductData=[...catalog.products,...catalog.companyShowcase]
const orderedProductData=categoryConfig.flatMap(category=>allProductData.filter(item=>item.category===category.name))
const orphanProductData=allProductData.filter(item=>!categoryConfig.some(category=>category.name===item.category))
export const products:Product[]=[...orderedProductData,...orphanProductData].map((item,index)=>normalize(item,index))
export const companyProducts=catalog.companyProducts
