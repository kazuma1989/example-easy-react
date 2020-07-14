// @ts-check
/// <reference path="./typings.d.ts" />

import { injectGlobal as css } from "https://cdn.pika.dev/emotion";
import {
  html,
  render,
} from "https://cdn.pika.dev/htm/preact/standalone.module.js";
import { App } from "./App.js";

css`
  :root {
    font-family: "Helvetica Neue", Arial, "Hiragino Kaku Gothic ProN",
      "Hiragino Sans", Meiryo, sans-serif;
  }

  html,
  body {
    height: 100%;
    overscroll-behavior: none;
  }
`;

render(html`<${App} />`, document.body);
