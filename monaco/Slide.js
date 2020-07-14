// @ts-check
/// <reference path="./typings.d.ts" />

import { css, cx } from "https://cdn.pika.dev/emotion";
import {
  html,
  useEffect,
  useReducer,
  useState,
} from "https://cdn.pika.dev/htm/preact/standalone.module.js";
import Reveal from "https://cdn.pika.dev/reveal.js/dist/reveal.esm.js";
import Markdown from "https://cdn.pika.dev/reveal.js/plugin/markdown/markdown.esm.js";

/**
 * @param {object}  _
 * @param {string=} _.className
 * @param {any=}    _.style
 */
export function Slide({ className, style }) {
  useEffect(() => {
    Reveal.initialize({
      plugins: [Markdown],
    });
  }, []);

  return html`
    <div className=${className} style=${style}>
      <div class="reveal deck1">
        <div class="slides">
          <section
            data-markdown=""
            data-separator="==="
            data-separator-vertical="---"
          >
            <script type="text/markdown">
              ## Demo 1

              Slide 1

              note: xxxxxxxx

              ===

              ## Demo 1

              Slide 2

              ---

              ## Demo 1

              - z
              - b

              Slide 3
            </script>
          </section>
        </div>
      </div>
    </div>
  `;
}
