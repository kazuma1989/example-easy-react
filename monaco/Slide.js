// @ts-check
/// <reference path="./typings.d.ts" />

import { cx } from "https://cdn.pika.dev/emotion";
import {
  html,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "https://cdn.pika.dev/htm/preact/standalone.module.js";
import Reveal from "https://unpkg.com/reveal.js/dist/reveal.esm.js";
import Highlight from "https://unpkg.com/reveal.js/plugin/highlight/highlight.esm.js";
import Markdown from "https://unpkg.com/reveal.js/plugin/markdown/markdown.esm.js";

/**
 * @typedef {{
    h: number
    v: number
  }} Index
 * @param {{
    url: string
    indexh: number
    onChange?(next: Index): void
    className?: string
    style?: any
  }} _
 */
export function Slide({ url, indexh, onChange: _onChange, className, style }) {
  const indexh$ = useRef(indexh);
  const onChange$ = useRef(_onChange);

  useEffect(() => {
    indexh$.current = indexh;
    onChange$.current = _onChange;
  });

  /** @type {{ current?: HTMLElement }} */
  const container$ = useRef();
  const reveal = useReveal(container$.current);

  useEffect(() => {
    if (!reveal) return;

    // props.indexh の値と同期する
    reveal.slide(indexh);
  }, [reveal, indexh]);

  useEffect(() => {
    if (!reveal) return;

    const observer = new ResizeObserver(() => {
      reveal.layout();
    });
    observer.observe(reveal.getViewportElement());

    return () => {
      observer.disconnect();
    };
  }, [reveal]);

  const forced$ = useRef(false);
  useEffect(() => {
    if (!reveal) return;

    const onSlideChanged = ({ indexh: h, indexv: v }) => {
      if (forced$.current) return;

      // props.indexh の値に保ち続ける
      forced$.current = true;
      reveal.slide(indexh$.current, v);
      forced$.current = false;

      const next = { h, v };
      onChange$.current?.(next);
    };
    reveal.on("slidechanged", onSlideChanged);

    return () => {
      reveal.off("slidechanged", onSlideChanged);
    };
  }, [reveal]);

  return html`
    <div ref=${container$} className=${cx(className, "reveal")} style=${style}>
      <div className="slides">
        <div
          data-markdown=${url}
          data-separator="==="
          data-separator-vertical="---"
        ></div>
      </div>
    </div>
  `;
}

/**
 * @param {HTMLElement} container
 */
function useReveal(container) {
  const [isReady, setIsReady] = useState(false);

  const reveal = useMemo(
    () =>
      container
        ? new Reveal(container, {
            // コンポーネント外に影響を及ぼさないため必須の設定
            embedded: true,
            keyboardCondition: "focused",
            respondToHashChanges: false,

            controlsLayout: "bottom-right",
            transitionSpeed: "fast",
          })
        : undefined,
    [container]
  );

  useEffect(() => {
    if (!reveal) return;

    reveal
      .initialize({
        plugins: [Markdown, Highlight],
      })
      .then(() => {
        setIsReady(true);
      });

    return () => {
      setIsReady(false);
    };
  }, [reveal]);

  return isReady ? reveal : undefined;
}
