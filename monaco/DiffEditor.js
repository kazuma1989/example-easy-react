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
  const diffEditor$ = useRef();

  useEffect(() => {
    const diffEditor = diffEditor$.current;
    if (!diffEditor) return;

    if (!original || !modified) return;

    Promise.all([
      fetch(original.src).then((r) => r.text()),
      fetch(modified.src).then((r) => r.text()),
    ]).then(([originalTxt, modifiedTxt]) => {
      diffEditor.dispose();

      const container = diffEditor.getDomNode();
      container.innerHTML = "";

      diffEditor$.current = monaco.editor.createDiffEditor(container, {
        readOnly: true,
      });

      diffEditor$.current.setModel({
        original: monaco.editor.createModel(originalTxt, original.lang),
        modified: monaco.editor.createModel(modifiedTxt, original.lang),
      });
    });
  }, [original, modified]);

  const target = diffEditor$.current?.getDomNode();
  useEffect(() => {
    if (!target) return;

    const observer = new ResizeObserver(([entry]) => {
      diffEditor$.current?.layout(entry.contentRect);
    });
    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [target]);

  return html`
    <div
      ref=${(e) => {
        if (!e) return;

        diffEditor$.current = monaco.editor.createDiffEditor(e, {
          readOnly: true,
        });
      }}
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
