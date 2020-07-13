// @ts-check
/// <reference path="./typings.d.ts" />

import { css } from "https://cdn.pika.dev/emotion";
import {
  html,
  useEffect,
  useRef,
} from "https://cdn.pika.dev/htm/preact/standalone.module.js";

/**
 * @param {object} _
 * @param {() => void=} _.onResizeStart
 * @param {() => void=} _.onResizeEnd
 * @param {string=} _.className
 * @param {any=} _.children
 */
export function Resizable({ onResizeStart, onResizeEnd, className, children }) {
  /** @type {{ current?: HTMLElement }} */
  const container$ = useRef();
  const isResizing$ = useRef(false);

  const onResizeEnd$ = useRef(onResizeEnd);
  const container = container$.current;
  useEffect(() => {
    if (!container) return;

    const view = container.ownerDocument?.defaultView;

    const onMouseUp = () => {
      isResizing$.current = false;

      onResizeEnd$.current?.();
    };

    /** @param {MouseEvent} e */
    const resize = (e) => {
      if (!isResizing$.current) return;

      // https://qiita.com/yukiB/items/31a9e9e600dfb1f34f76
      //
      // +-------------------------+-----------------+
      // | Web page area           ^ pageY           |
      // |                         |                 |
      // |   +----------------------------------------------+
      // |   |  Safari File       ^ screenY         |      |
      // |   +----------------------------------------------+
      // |   |   +--------------------------------+  |      |
      // |   |   | ooo             |              |  |      |
      // |   |   +--------------------------------+  |      |
      // |   |   |                 ^ clientY      |  |      |
      // |   |   |                 |              |  |      |
      // |   |   |                 |              |  |      |
      // +<---<---<----------------+              |  |      |
      // |   |   | clientX                        |  |      |
      // |   |   +--------------------------------+  |      |
      // |   | screenX                               |      |
      // |   +----------------------------------------------+
      // | pageX                                     |
      // +-------------------------------------------+

      const newHeight = e.clientY - container.getBoundingClientRect().top;
      container.style.height = `${newHeight}px`;
    };

    view.addEventListener("mousemove", resize);
    view.addEventListener("mouseup", onMouseUp);
    view.addEventListener("mouseleave", onMouseUp);

    return () => {
      view.removeEventListener("mousemove", resize);
      view.removeEventListener("mouseup", onMouseUp);
      view.removeEventListener("mouseleave", onMouseUp);
    };
  }, [container]);

  return html`
    <div ref=${container$} className=${className}>
      ${children}

      <div
        onMouseDown=${(e) => {
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
