// @ts-check
/// <reference path="./typings.d.ts" />

import { css, cx } from "https://cdn.pika.dev/emotion";
import {
  html,
  useEffect,
  useMemo,
  useRef,
} from "https://cdn.pika.dev/htm/preact/standalone.module.js";

const monaco = globalThis.monaco;

/**
 * @param {object}  _
 * @param {string=} _.originalSrc
 * @param {string=} _.originalLang
 * @param {string=} _.modifiedSrc
 * @param {string=} _.modifiedLang
 * @param {number=} _.fontSize
 * @param {string=} _.className
 * @param {any=}    _.style
 */
export function DiffEditor({
  originalSrc,
  originalLang,
  modifiedSrc,
  modifiedLang,
  fontSize = 16,
  style,
  className,
}) {
  /** @type {{ current?: HTMLElement }} */
  const container$ = useRef();
  const container = container$.current;

  const diffEditor = useMemo(
    () =>
      container
        ? monaco.editor.createDiffEditor(container, {
            readOnly: true,
            scrollBeyondLastLine: false,
            fontSize,
          })
        : undefined,
    [container, fontSize]
  );

  useEffect(() => {
    if (!diffEditor) return;

    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      diffEditor.layout({ width, height });
    });
    observer.observe(diffEditor.getDomNode());

    return () => {
      observer.disconnect();

      diffEditor.dispose();
    };
  }, [diffEditor]);

  useEffect(() => {
    if (!diffEditor) return;
    if (!originalSrc || !modifiedSrc) return;

    Promise.all([
      fetch(originalSrc).then((r) => r.text()),
      fetch(modifiedSrc).then((r) => r.text()),
    ]).then(([originalTxt, modifiedTxt]) => {
      diffEditor.setModel({
        original: monaco.editor.createModel(originalTxt, originalLang),
        modified: monaco.editor.createModel(modifiedTxt, modifiedLang),
      });
    });
  }, [diffEditor, originalSrc, originalLang, modifiedSrc, modifiedLang]);

  return html`
    <div
      ref=${container$}
      className=${cx(
        css`
          border: solid 1px silver;
          border-right: none;

          /* .monaco-sash がはみ出ないように */
          z-index: 0;
        `,
        className
      )}
      style=${style}
    ></div>
  `;
}
