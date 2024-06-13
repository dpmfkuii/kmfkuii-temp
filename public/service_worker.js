self.addEventListener('install', ev => {
    ev.waitUntil(
        caches.open('web-km-fkuii-v0.4').then(cache => {
            cache.addAll([
                '/',
                '/index.html',
                '/kegiatan/index.html',
                '/kegiatan/jadwal-rapat/index.html',
                '/kegiatan/logbook/index.html',
                '/kegiatan/kalender/index.html',
                '/kegiatan/fincard/index.html',
                '/kegiatan/fintime/index.html',
                '/kegiatan/triwulan/index.html',
                '/panduan/index.html',
                '/assets/css/main.css',
                '/assets/js/defines.js',
                '/assets/js/utils.js',
                '/assets/js/auth.js',
                '/assets/js/main.js',
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
