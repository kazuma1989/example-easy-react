// @ts-check
/// <reference path="./typings.d.ts" />

import { css, cx } from "https://cdn.pika.dev/emotion";
import {
  html,
  useEffect,
  useRef,
} from "https://cdn.pika.dev/htm/preact/standalone.module.js";

const monaco = globalThis.monaco;

/**
 * @param {object} _
 * @param {string=} _.originalSrc
 * @param {string=} _.originalLang
 * @param {string=} _.modifiedSrc
 * @param {string=} _.modifiedLang
 * @param {string=} _.className
 */
export function DiffEditor({
  originalSrc,
  originalLang,
  modifiedSrc,
  modifiedLang,
  className,
}) {
  const diffEditor$ = useRef();
  useEffect(() => {
    const diffEditor = diffEditor$.current;
    if (!diffEditor) return;

    if (!originalSrc || !modifiedSrc) return;

    Promise.all([
      fetch(originalSrc).then((r) => r.text()),
      fetch(modifiedSrc).then((r) => r.text()),
    ]).then(([originalTxt, modifiedTxt]) => {
      diffEditor.dispose();

      const container = diffEditor.getDomNode();
      container.innerHTML = "";

      diffEditor$.current = monaco.editor.createDiffEditor(container, {
        readOnly: true,
      });

      diffEditor$.current.setModel({
        original: monaco.editor.createModel(originalTxt, originalLang),
        modified: monaco.editor.createModel(modifiedTxt, modifiedLang),
      });
    });
  }, [originalSrc, originalLang, modifiedSrc, modifiedLang]);

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
        if (!e || diffEditor$.current) return;

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
