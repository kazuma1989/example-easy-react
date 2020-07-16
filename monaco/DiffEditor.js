// @ts-check
/// <reference path="./typings.d.ts" />

import { css, cx } from "https://cdn.pika.dev/emotion";
import {
  html,
  useEffect,
  useMemo,
  useRef,
} from "https://cdn.pika.dev/htm/preact/standalone.module.js";
import { shallowEqual } from "./util.js";

const monaco = globalThis.monaco;

/**
 * @param {{
    originalSrc?: string
    originalLang?: string
    modifiedSrc?: string
    modifiedLang?: string
    options?: {
      fontSize?: number
      lineNumbers?: any
      lineNumbersMinChars?: number
      scrollBeyondLastLine?: boolean
      renderSideBySide?: string
    }
    className?: string
    style?: any
  }} props
 */
export function DiffEditor(props) {
  const {
    originalSrc,
    originalLang,
    modifiedSrc,
    modifiedLang,
    options,
    className,
    style,
  } = props;

  /** @type {{ current?: HTMLElement }} */
  const container$ = useRef();
  const container = container$.current;

  const diffEditor = useMemo(
    () =>
      container
        ? monaco.editor.createDiffEditor(container, {
            readOnly: true,
          })
        : undefined,
    [container]
  );

  const prevOptions$ = useRef();
  useEffect(() => {
    if (!diffEditor || !options) return;
    if (shallowEqual(options, prevOptions$.current)) return;

    prevOptions$.current = options;

    diffEditor.updateOptions(options);
  }, [diffEditor, options]);

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
          /* .monaco-sash がはみ出ないように */
          z-index: 0;
        `,
        className
      )}
      style=${style}
    ></div>
  `;
}
