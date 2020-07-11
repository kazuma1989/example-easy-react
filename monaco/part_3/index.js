// @ts-check

import {
  html,
  render,
  useState,
  useEffect,
  // @ts-ignore
} from "https://cdn.pika.dev/htm/preact/standalone.module.js";
// @ts-ignore
import { css, cx, injectGlobal } from "https://cdn.pika.dev/emotion";

function App() {
  return html`
    <h1>HELLO</h1>

    <p>World</p>
  `;
}

render(html`<${App} />`, document.body);
