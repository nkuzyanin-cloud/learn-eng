const CACHE = 'afterhours-' + encodeURIComponent(new URL('./', self.location.href).pathname) + '-54a1400d1a62';
const FILES = ["./", "index.html", "styles.css", "app.js", "course.js", "manifest.webmanifest", "assets/airport.webp", "assets/audio/v1-03.mp3", "assets/audio/v1-04.mp3", "assets/audio/v1-05.mp3", "assets/audio/v1-06.mp3", "assets/audio/v1-07.mp3", "assets/audio/v1-08.mp3", "assets/audio/v1-09.mp3", "assets/audio/v1-10.mp3", "assets/audio/v1-11.mp3", "assets/audio/v1-12.mp3", "assets/audio/v1-13.mp3", "assets/audio/v1-14.mp3", "assets/audio/v1-18.mp3", "assets/audio/v1-19.mp3", "assets/audio/v1-20.mp3", "assets/audio/v1-21.mp3", "assets/audio/v1-22.mp3", "assets/audio/v1-23.mp3", "assets/audio/v1-24.mp3", "assets/audio/v1-25.mp3", "assets/audio/v1-26.mp3", "assets/audio/v1-27.mp3", "assets/audio/v1-28.mp3", "assets/audio/v1-29.mp3", "assets/audio/v1-30.mp3", "assets/audio/v1-31.mp3", "assets/audio/v1-32.mp3", "assets/audio/v1-33.mp3", "assets/audio/v1-34.mp3", "assets/audio/v1-35.mp3", "assets/audio/v1-36.mp3", "assets/audio/v1-37.mp3", "assets/audio/v1-38.mp3", "assets/audio/v1-39.mp3", "assets/audio/v1-40.mp3", "assets/audio/v1-41.mp3", "assets/audio/v1-42.mp3", "assets/audio/v1-43.mp3", "assets/audio/v1-44.mp3", "assets/audio/v1-45.mp3", "assets/audio/v1-46.mp3", "assets/audio/v1-47.mp3", "assets/audio/v1-48.mp3", "assets/audio/v1-49.mp3", "assets/audio/v1-50.mp3", "assets/audio/v1-51.mp3", "assets/audio/v1-52.mp3", "assets/audio/v2-01.mp3", "assets/audio/v2-02.mp3", "assets/audio/v2-03.mp3", "assets/audio/v2-04.mp3", "assets/audio/v2-05.mp3", "assets/audio/v2-06.mp3", "assets/audio/v2-07.mp3", "assets/audio/v2-08.mp3", "assets/audio/v2-09.mp3", "assets/audio/v2-10.mp3", "assets/audio/v2-11.mp3", "assets/audio/v2-12.mp3", "assets/audio/v2-13.mp3", "assets/audio/v2-14.mp3", "assets/audio/v2-15.mp3", "assets/audio/v2-16.mp3", "assets/audio/v2-17.mp3", "assets/audio/v2-18.mp3", "assets/audio/v2-19.mp3", "assets/audio/v2-20.mp3", "assets/audio/v2-21.mp3", "assets/audio/v2-23.mp3", "assets/audio/v2-24.mp3", "assets/audio/v2-25.mp3", "assets/audio/v2-26.mp3", "assets/audio/v2-27.mp3", "assets/audio/v2-28.mp3", "assets/audio/v2-29.mp3", "assets/audio/v2-30.mp3", "assets/bees.webp", "assets/cafe.webp", "assets/cinema.webp", "assets/circus.webp", "assets/city.webp", "assets/classroom.webp", "assets/forest.webp", "assets/halloween.webp", "assets/home.webp", "assets/icon-192.png", "assets/icon-512.png", "assets/manrope-400.ttf", "assets/manrope-700.ttf", "assets/margo.webp", "assets/market.webp", "assets/museum.webp", "assets/office.webp", "assets/park.webp", "assets/restaurant.webp", "assets/road.webp", "assets/theater.webp", "assets/train.webp"];
const BASE = new URL('./', self.location.href);
self.addEventListener('install', event => event.waitUntil((async () => {
  const cache = await caches.open(CACHE);
  await cache.addAll(FILES.map(file => new URL(file, BASE).href));
  await self.skipWaiting();
})()));
self.addEventListener('activate', event => event.waitUntil((async () => {
  const names = await caches.keys();
  await Promise.all(names.filter(n => n.startsWith('afterhours-' + encodeURIComponent(BASE.pathname) + '-') && n !== CACHE).map(n => caches.delete(n)));
  await self.clients.claim();
})()));
async function cachedRange(request, response) {
  const bytes = await response.arrayBuffer(), size = bytes.byteLength;
  const match = /^bytes=(\d*)-(\d*)$/.exec(request.headers.get('range') || '');
  if (!match) return new Response(bytes, {headers:response.headers});
  const start = match[1] ? Number(match[1]) : Math.max(0, size - Number(match[2]));
  const end = match[1] && match[2] ? Math.min(Number(match[2]), size-1) : size-1;
  if (start >= size || start > end) return new Response(null, {status:416,headers:{'Content-Range':`bytes */${size}`}});
  const headers = new Headers(response.headers);
  headers.set('Content-Range',`bytes ${start}-${end}/${size}`);
  headers.set('Content-Length', String(end-start+1));headers.set('Accept-Ranges','bytes');
  return new Response(bytes.slice(start,end+1),{status:206,headers});
}
self.addEventListener('fetch', event => {
  const req=event.request, url=new URL(req.url);
  if(req.method!=='GET' || url.origin!==BASE.origin || !url.pathname.startsWith(BASE.pathname))return;
  event.respondWith((async()=>{
    const cache=await caches.open(CACHE);
    const cached=await cache.match(req,{ignoreSearch:true});
    if(cached)return req.headers.has('range')?cachedRange(req,cached):cached;
    try{return await fetch(req);}
    catch(error){if(req.mode==='navigate')return await cache.match(new URL('index.html',BASE).href);throw error;}
  })());
});
