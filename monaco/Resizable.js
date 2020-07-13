// @ts-check
/// <reference path="./typings.d.ts" />

import { css } from "https://cdn.pika.dev/emotion";
import {
  html,
  useEffect,
  useRef
} from "https://cdn.pika.dev/htm/preact/standalone.module.js";

/**
 * @param {object} _
 * @param {() => void=} _.onResizeStart
 * @param {() => void=} _.onResizeEnd
 * @param {string=} _.className
 * @param {any=} _.children
 */
export function Resizable({ onResizeStart, onResizeEnd, className, children }) {
  const container$ = useRef();
  const positionY$ = useRef(0);
  const isResizing$ = useRef(false);

  const onResizeEnd$ = useRef(onResizeEnd);
  useEffect(() => {
    const onMouseUp = () => {
      isResizing$.current = false;

      onResizeEnd$.current?.();
    };

    /** @param {MouseEvent} e */
    const resize = (e) => {
      if (!isResizing$.current) return;

      const container = container$.current;
      if (!container) return;

      const dy = e.y - positionY$.current;
      positionY$.current = e.y;

      container.style.height = `${
        parseInt(getComputedStyle(container).height) + dy
      }px`;
    };

    document.addEventListener("mousemove", resize);

    document.addEventListener("mouseup", onMouseUp);
    document.addEventListener("mouseleave", onMouseUp);

    return () => {
      document.removeEventListener("mousemove", resize);

      document.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("mouseleave", onMouseUp);
    };
  }, []);

  return html`
    <div ref=${container$} className=${className}>
      ${children}

      <div
        onMouseDown=${(e) => {
          positionY$.current = e.y;
          isResizing$.current = true;

          onResizeStart?.();
        }}
        className=${css`
          cursor: row-resize;
          position: relative;
          z-index: 1;
          top: -4px;
          height: 4px;
        `}
      ></div>
    </div>
  `;
}
