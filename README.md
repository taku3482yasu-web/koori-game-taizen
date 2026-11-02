# こおりくんのゲーム大全

こおりくんシリーズのゲームを、1 つのサイトから遊べるようにしたページです。パッケージをクリックすると、そのゲームが起動します。

公開ページ: https://taku3482yasu-web.github.io/koori-game-taizen/

ゲームのとび先は `index.html` の `GAMES` に書いてあります。

## アプリとして 使う (2026-11-02)

ホーム画面に 入れると、ブラウザの わくの ない アプリとして 開けます。

- Android・PC の Chrome / Edge: ページの「アプリとして 入れる」ボタン (または アドレスバーの インストール)
- iPhone・iPad: Safari の 共有ボタン →「ホーム画面に追加」

しくみ: `manifest.webmanifest` (名前・アイコン・`scope: "/"` で シリーズの ゲームも アプリの 中で 開く)、`sw.js` (ページと アイコンを とっておく。中身を かえたら `VERSION` を 上げる)、`icons/` (`node tools/make-icons.mjs` で 作りなおせる)。
