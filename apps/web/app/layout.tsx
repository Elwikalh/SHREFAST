import type { CSSProperties,ReactNode } from "react"
import type { Metadata,Viewport } from "next"
import { SiteCopyHydrator } from "./site-copy-hydrator"
import "./globals.css"

const SITE_URL=process.env.NEXT_PUBLIC_SITE_URL??"https://el7bbob-production.up.railway.app",SITE_NAME="الحَبّوب | El7bboB",SITE_DESCRIPTION="فول وطعمية وميكسات شعبي بجودة وبراند عالمي — الحَبّوب",SOCIAL_IMAGE=`${SITE_URL}/social-logo?v=8`
export const metadata:Metadata={metadataBase:new URL(SITE_URL),title:{default:SITE_NAME,template:`%s | الحَبّوب`},description:SITE_DESCRIPTION,applicationName:SITE_NAME,alternates:{canonical:SITE_URL},appleWebApp:{title:"الحَبّوب",capable:true,statusBarStyle:"default"},openGraph:{type:"website",siteName:SITE_NAME,locale:"ar_EG",url:SITE_URL,title:SITE_NAME,description:SITE_DESCRIPTION,images:[{url:SOCIAL_IMAGE,width:1200,height:630,type:"image/png",alt:"لوجو الحَبّوب — الفولة المبتسمة"}]},twitter:{card:"summary_large_image",title:SITE_NAME,description:SITE_DESCRIPTION,images:[SOCIAL_IMAGE]}}
export const viewport:Viewport={themeColor:"#f7ae33"}
const fontVariables={"--font-arabic":"Tahoma, Arial, sans-serif","--font-latin":"Arial, sans-serif"}as CSSProperties
export default function RootLayout({children}:Readonly<{children:ReactNode}>){return <html lang="ar" dir="rtl" style={fontVariables}><body>{children}<SiteCopyHydrator/></body></html>}
