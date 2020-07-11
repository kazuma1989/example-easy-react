// @ts-check
/// <reference path="./typings.d.ts" />

import {
  html,
  useEffect,
  useRef,
} from "https://cdn.pika.dev/htm/preact/standalone.module.js";
import { css, cx } from "https://cdn.pika.dev/emotion";

const monaco = globalThis.monaco;

/**
 * @typedef {object} Model
 * @property {string} src
 * @property {string} lang
 */
/**
 * @param {object} _
 * @param {Model=} _.original
 * @param {Model=} _.modified
 * @param {string=} _.className
 */
export function DiffEditor({ original, modified, className }) {
  const container$ = useRef();
  useEffect(() => {
    const container = container$.current;
    if (!container) return;

    if (!original || !modified) return;

    Promise.all([
      fetch(original.src).then((r) => r.text()),
      fetch(modified.src).then((r) => r.text()),
    ]).then(([originalTxt, modifiedTxt]) => {
      container.innerHTML = "";
      const diffEditor = monaco.editor.createDiffEditor(container, {
        readOnly: true,
      });

      diffEditor.setModel({
        original: monaco.editor.createModel(originalTxt, original.lang),
        modified: monaco.editor.createModel(modifiedTxt, original.lang),
      });
    });
  }, [original, modified]);

  return html`
    <div
      ref=${container$}
      className=${cx(
        css`
          border: solid 1px silver;
          border-right: none;
        `,
        className
      )}
    ></div>
  `;
}
