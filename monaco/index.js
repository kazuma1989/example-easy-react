// @ts-check
/// <reference path="./typings.d.ts" />

import { injectGlobal } from "https://cdn.pika.dev/emotion";
import {
  html,
  render,
} from "https://cdn.pika.dev/htm/preact/standalone.module.js";
import { App } from "./App.js";

injectGlobal`
  * {
    box-sizing: border-box;
  }

  html,
  body {
    max-width: unset;
    height: 100%;
    margin: 0;
    padding: 0;
    overscroll-behavior: none;
  }
`;

render(html`<${App} />`, document.body);
