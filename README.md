# 민우 ♥ ひな — Bilingual Wedding Invitation (KR/JP)

ボタン1つで韓国語/日本語が切り替わるモバイルWeb招待状です。
Vite + React 製。ゲストブックは Supabase に保存されます。

## ローカルで動かす

```bash
npm install
npm run dev
```

Supabase 未設定でも動きます(送信データが保存されないだけ)。

## Supabase のセットアップ(ゲストブック保存)

1. https://supabase.com で無料プロジェクトを作成
2. SQL Editor に `supabase/schema.sql` の中身を貼り付けて実行
   (guestbook テーブルとアクセスポリシーが作られます)
3. Settings > API から URL と anon key をコピー
4. `.env.example` をコピーして `.env` を作り、2つの値を貼り付け

```bash
cp .env.example .env
```

## Vercel へデプロイ

1. このフォルダを GitHub リポジトリに push
2. https://vercel.com で「Add New Project」→ リポジトリを選択
   (Vite は自動検出されるので設定はそのままでOK)
3. Environment Variables に以下の2つを追加
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy を押すと `https://xxx.vercel.app` で公開されます

独自ドメイン(例: 招待状用のサブドメイン)も Vercel の
Settings > Domains から無料で設定できます。

## コンテンツの差し替え方

| 変えたいもの | 場所 |
|---|---|
| 名前・日時・会場・電話・口座 | `src/App.jsx` 冒頭の `WEDDING` オブジェクト |
| 文面(韓国語/日本語) | `src/App.jsx` の `T` オブジェクト |
| メイン写真 | `public/images/hero.webp` を置き換え |
| ギャラリー写真 | `public/images/gallery-01.webp` 〜 `gallery-19.webp` を置き換え。枚数を変えたら `App.jsx` の `GALLERY_COUNT` も変更 |
| BGM | `public/bgm/bgm.mp3` を置く(無い間はデモピアノが流れます) |
| フォント | `src/App.jsx` の `FONT_PAIRS` |

※ BGMに市販の楽曲を使う場合は権利にご注意を。フリー音源
(DOVA-SYNDROME、Artlist等)か、権利処理済みの音源をおすすめします。

## 招待状の共有

カカオトーク/LINEで送ると `index.html` の OGP タグの内容
(タイトル・メイン写真)がプレビュー表示されます。
