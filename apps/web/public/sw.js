/* Only public offline assets are cached. Account pages and APIs are never cached. */
const CACHE = "share-fast-public-v2";
const PUBLIC_ASSETS = ["/app-icon/192?v=forward-v1", "/app-icon/512?v=forward-v1", "/app-icon/maskable?v=forward-v1", "/icon.svg"];
self.addEventListener("install", event => event.waitUntil((async()=>{
 const cache=await caches.open(CACHE);
 const offline=await fetch("/offline",{cache:"reload"});
 if(offline.ok){
  const html=await offline.clone().text();await cache.put("/offline",offline);
  const styles=[...html.matchAll(/href="([^"\s]+\.css(?:\?[^"\s]*)?)"/g)].map(match=>new URL(match[1],self.location.origin)).filter(url=>url.origin===self.location.origin&&url.pathname.startsWith("/_next/static/"));
  await Promise.all(styles.map(async url=>{try{const response=await fetch(url);if(response.ok)await cache.put(url,response)}catch{}}));
 }
 await Promise.all(PUBLIC_ASSETS.map(async path=>{try{const response=await fetch(path,{cache:"reload"});if(response.ok)await cache.put(path,response)}catch{}}));
 await self.skipWaiting();
})()));
self.addEventListener("activate", event=>event.waitUntil((async()=>{
 const keys=await caches.keys();await Promise.all(keys.filter(key=>key.startsWith("share-fast-public-")&&key!==CACHE).map(key=>caches.delete(key)));await self.clients.claim();
})()));
self.addEventListener("fetch", event=>{
 const request=event.request, url=new URL(request.url);
 if(url.origin!==self.location.origin || request.method!=="GET" || url.pathname.startsWith("/api/"))return;
 if(request.mode==="navigate"){
  event.respondWith(fetch(request).catch(async()=>{const response=await caches.match("/offline");return response||new Response("الاتصال غير متاح. أعد الاتصال لفتح حسابك.",{status:503,headers:{"Content-Type":"text/plain; charset=utf-8"}})}));
 }else if((PUBLIC_ASSETS.includes(url.pathname+url.search)||PUBLIC_ASSETS.includes(url.pathname))||(/^\/_next\/static\/.*\.css$/.test(url.pathname))){
  event.respondWith((async()=>{const cached=await caches.match(request)||await caches.match(url.pathname);if(cached)return cached;return fetch(request)})());
 }
});
