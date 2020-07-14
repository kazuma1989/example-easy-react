// @ts-check
/// <reference path="./typings.d.ts" />

import { cx } from "https://cdn.pika.dev/emotion";
import {
  html,
  useEffect,
  useMemo,
  useRef,
} from "https://cdn.pika.dev/htm/preact/standalone.module.js";
import Reveal from "https://unpkg.com/reveal.js/dist/reveal.esm.js";
import Highlight from "https://unpkg.com/reveal.js/plugin/highlight/highlight.esm.js";
import Markdown from "https://unpkg.com/reveal.js/plugin/markdown/markdown.esm.js";

/**
 * @param {object}               _
 * @param {string=}              _.url
 * @param {(h: number) => void=} _.onChange
 * @param {string=}              _.className
 * @param {any=}                 _.style
 */
export function Slide({ url, onChange: _onChange, className, style }) {
  const onChange$ = useRef(_onChange);

  useEffect(() => {
    onChange$.current = _onChange;
  });

  /** @type {{ current?: HTMLElement }} */
  const container$ = useRef();
  const container = container$.current;

  const reveal = useMemo(
    () =>
      container
        ? new Reveal(container, {
            embedded: true,
            keyboardCondition: "focused", // only react to keys when focused
            controlsLayout: "bottom-right",
            slideNumber: "c/t",
            transitionSpeed: "fast",
          })
        : undefined,
    [container]
  );

  useEffect(() => {
    if (!reveal) return;

    reveal.initialize({
      plugins: [Markdown, Highlight],
    });

    const observer = new ResizeObserver(() => {
      reveal.layout();
    });
    observer.observe(reveal.getViewportElement());

    return () => {
      observer.disconnect();
    };
  }, [reveal]);

  const indexh$ = useRef(0);
  useEffect(() => {
    if (!reveal) return;

    const onSlideChanged = (e) => {
      const { indexh } = e;
      if (indexh === indexh$.current) return;

      indexh$.current = indexh;
      onChange$.current?.(indexh);
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
