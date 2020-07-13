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
 * @param {string=} _.className
 * @param {any=}    _.style
 */
export function DiffEditor({
  originalSrc,
  originalLang,
  modifiedSrc,
  modifiedLang,
  style,
  className,
}) {
  /** @type {{ current?: HTMLElement }} */
  const container$ = useRef();
  const diffEditor = useMemo(
    () =>
      container$.current
        ? monaco.editor.createDiffEditor(container$.current, {
            readOnly: true,
          })
        : undefined,
    [container$.current]
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
        `,
        className
      )}
      style=${style}
    ></div>
  `;
}
