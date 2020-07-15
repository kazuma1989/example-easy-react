// @ts-check
/// <reference path="./typings.d.ts" />

import {
  html,
  render as _render,
} from "https://cdn.pika.dev/htm/preact/standalone.module.js";
import { App } from "./App.js";

/**
 * @param {HTMLElement} target
 */
export function render(target) {
  _render(html`<${App} />`, target);
}
