// TripMate offline support: itinerary pages open without network once viewed.
const VERSION = 'tm-v1'
const PAGES = `${VERSION}-pages`
const ASSETS = `${VERSION}-assets`
const OFFLINE_PAGE = /^\/(en\/)?(trips\/[^/]+|demo)\/?$/

self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k)))).then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const req = event.request
  if (req.method !== 'GET') return
  const url = new URL(req.url)
  if (url.origin !== self.location.origin) return

  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(
      caches.open(ASSETS).then(async (cache) => {
        const hit = await cache.match(req)
        if (hit) return hit
        const res = await fetch(req)
        if (res.ok) cache.put(req, res.clone())
        return res
      }),
    )
    return
  }

  if (req.mode === 'navigate' && OFFLINE_PAGE.test(url.pathname)) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res.ok) {
            const copy = res.clone()
            event.waitUntil(caches.open(PAGES).then((cache) => cache.put(url.pathname, copy)))
          }
          return res
        })
        .catch(async () => (await caches.match(url.pathname, { ignoreVary: true, ignoreSearch: true })) ?? Response.error()),
    )
  }
})
