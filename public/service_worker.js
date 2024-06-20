const current_cache_name = 'web-km-fkuii-v0.7a1'

self.addEventListener('install', ev => {
    ev.waitUntil(
        caches.open(current_cache_name).then(cache => {
            cache.addAll([
                '/',
                '/index.html',
                '/kegiatan/index.html',
                '/kegiatan/jadwal-rapat/index.html',
                '/kegiatan/logbook/index.html',
                '/kegiatan/kalender/index.html',
                '/kegiatan/rutin-keu/index.html',
                '/kegiatan/triwulan/index.html',
                '/panduan/index.html',
                '/assets/images/kalender-banner.png',
                '/assets/images/kegiatan-banner.png',
                '/assets/images/keu-banner.png',
                '/assets/images/legislasi-banner.png',
                '/assets/images/logbook-banner.png',
                '/assets/images/logo-web-km.png',
                '/assets/images/panduan-banner.png',
                '/assets/images/pubsekre-banner.png',
                '/assets/images/verifikasi-banner.png',
            ])
        })
    )
})

self.addEventListener('fetch', ev => {
    ev.respondWith(
        caches.match(ev.request).then(res => {
            return res || fetch(ev.request)
        })
    )
})

self.addEventListener('activate', ev => {
    ev.waitUntil(
        caches.keys().then(names => {
            for (let name of names) {
                if (name !== current_cache_name) {
                    caches.delete(name)
                }
            }
        })
    )
})
