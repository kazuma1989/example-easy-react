# 環境構築レスな React 風 UI の書き方

[@kazuma1989](https://github.com/kazuma1989/)

2020-07-16

=

## TODO リストの実装を示しながら紹介します

=

### 対象者

- ちょっとした GUI ツールを作りたい人
  - API 検証用の web ページ
  - Google Apps Script でカスタムダイアログ
- Node.js とか npm とかの環境構築が面倒な人

=

### 必要なもの

- 最新の JS 文法が動くブラウザー（IE でなければモバイル含め大体 OK）
- ローカル Web サーバー（macOS なら `python -m http.server 8000` で OK）

=

### あると嬉しい

- JS, HTML, CSS の基礎知識
- JS, HTML, CSS が書きやすいエディター（VS Code がおすすめ）

=

### いらないもの

- Node.js, npm
  - webpack, Create React App, ...
  - TypeScript

---

## まずは script import

```html
<script type="module" src="./index.js"></script>
```

`type="module"` がキー。  
こう書けば、`index.js` 内で他のファイルを import できる。

---

## index.js の中身

※
`// @ts-xxx` は VS Code で補完を効きやすくするためのもの

=

### CDN からライブラリーを import

React の亜種 (Preact + HTM) を読み込む

- よく使う CDN -> https://unpkg.com
- unpkg が import で読み込むのに対応していない場合 -> https://cdn.pika.dev

=

### JS で HTML を書く

JS の処理で HTML をいじるなら、全部 JS で生み出せばよいのだ！

- バックティック (`) で HTML を囲む
  - JS 的にはただの文字列（ヒアドキュメント）
  - `html` という関数に文字列を渡しているだけ（正確にはちょっと違うけどこの理解で OK）

=

HTML 側に id を割り振って、JS からその id の要素を探し出し・・・という書き方をしなくてよくなる。

---

## 変数を埋め込む書き方

```js
const name = "Alice";

const message = `Hello, ${name}!`; // -> Hello, Alice!
```

---

## 繰り返し要素（配列）の書き方

```js
const names = ["Alice", "Bob"];

const messages = names.map((name) => `Hello, ${name}!`);
// ["Hello, Alice!", "Hello, Bob!"]
```

※
繰り返し要素に `key` 属性をつけるのはお作法

---

---

---

---

---

---

---

---

---

---

---

---

---

---

---

---

---

---

---

---

---

---
