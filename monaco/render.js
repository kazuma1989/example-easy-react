// @ts-check
/// <reference path="./typings.d.ts" />

Promise.all(
  [
    "https://unpkg.com/ress/dist/ress.min.css",
    "https://unpkg.com/reveal.js/dist/reveal.css",
    "https://unpkg.com/reveal.js/dist/theme/white.css",
    "https://unpkg.com/highlight.js/styles/vs.css",
  ].map((href) => appendStylesheet(href))
);

import("https://cdn.pika.dev/emotion").then(({ injectGlobal: css }) => {
  css`
    html,
    body {
      height: 100%;
      overscroll-behavior: none;
    }
  `;
});

Promise.all(
  ["https://unpkg.com/monaco-editor/min/vs/loader.js"].map((src) =>
    appendScript(src)
  )
).then(() => {
  globalThis.require.config({
    paths: {
      vs: "https://unpkg.com/monaco-editor/min/vs",
    },
  });

  globalThis.require(["vs/editor/editor.main"], () => {
    import("./index.js").then(({ render }) => {
      render(document.body);
    });
  });
});

/**
 * @param {string} src
 * @param {HTMLElement} target
 */
async function appendScript(src, target = document.head) {
  const script = document.createElement("script");
  script.src = src;

  target.appendChild(script);

  return new Promise((resolve, reject) => {
    setTimeout(reject, 20_000);

    script.addEventListener("load", resolve);
  });
}

/**
 * @param {string} href
 * @param {HTMLElement} target
 */
async function appendStylesheet(href, target = document.head) {
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = href;

  target.appendChild(link);

  return new Promise((resolve, reject) => {
    setTimeout(reject, 20_000);

    link.addEventListener("load", resolve);
  });
}
