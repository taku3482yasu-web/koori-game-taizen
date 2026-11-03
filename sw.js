// ゲーム大全を アプリとして 入れたときの サービスワーカー
// ページと アイコンを とっておき、電波が ないときでも 開けるように する (ゲーム本体は それぞれの サイトから 読む)
// 中身を かえたら VERSION を 上げる
const VERSION = 'taizen-v5';
const FILES = ['./', './index.html', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png', './icons/maskable-512.png', './icons/apple-touch-icon.png'];

self.addEventListener('install', (e) => {
    e.waitUntil(caches.open(VERSION).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
    e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
// このサイトの ものだけ: まず ネットから (新しい ページを 見せる)、だめなら とっておいた もの
self.addEventListener('fetch', (e) => {
    const url = new URL(e.request.url);
    if (e.request.method !== 'GET' || url.origin !== location.origin || !url.pathname.startsWith(new URL('./', location).pathname)) return;
    e.respondWith(fetch(e.request).then((res) => {
        const copy = res.clone();
        caches.open(VERSION).then((c) => c.put(e.request, copy));
        return res;
    }).catch(() => caches.match(e.request).then((r) => r || caches.match('./index.html'))));
});
