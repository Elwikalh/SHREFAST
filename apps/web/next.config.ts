import type { NextConfig } from "next"
import path from "node:path"

const securityHeaders=[
	{key:"X-Content-Type-Options",value:"nosniff"},
	{key:"X-Frame-Options",value:"DENY"},
	{key:"Referrer-Policy",value:"strict-origin-when-cross-origin"},
	{key:"Permissions-Policy",value:"camera=(), microphone=(), geolocation=(self), payment=()"},
	{key:"Cross-Origin-Opener-Policy",value:"same-origin"},
	{key:"Strict-Transport-Security",value:"max-age=31536000; includeSubDomains"},
]
const nextConfig:NextConfig={output:"standalone",outputFileTracingRoot:path.join(__dirname,"../.."),transpilePackages:["@el7bboB/core","@el7bboB/db"],poweredByHeader:false,compress:true,async headers(){return[{source:"/(.*)",headers:securityHeaders}]}}
export default nextConfig
