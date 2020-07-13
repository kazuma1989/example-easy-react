// @ts-check
/// <reference path="./typings.d.ts" />

import { css } from "https://cdn.pika.dev/emotion";
import {
  html,
  useEffect,
  useRef,
} from "https://cdn.pika.dev/htm/preact/standalone.module.js";

/**
 * @param {object}           _
 * @param {'top' | 'bottom'} _.sash
 * @param {() => void=}      _.onResizeStart
 * @param {() => void=}      _.onResizeEnd
 * @param {string=}          _.className
 * @param {any=}             _.style
 * @param {any=}             _.children
 */
export function Resizable({
  sash,
  onResizeStart,
  onResizeEnd,
  className,
  style,
  children,
}) {
  /** @type {{ current?: HTMLElement }} */
  const container$ = useRef();
  const handle$ = useResizable({
    onResizeStart,
    onResize(e) {
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
      const container = container$.current;
      if (!container) return;

      let newHeight;
      switch (sash) {
        case "top": {
          newHeight = container.getBoundingClientRect().bottom - e.clientY;
          break;
        }

        case "bottom": {
          newHeight = e.clientY - container.getBoundingClientRect().top;
          break;
        }

        default: {
          return;
        }
      }

      container.style.height = `${newHeight}px`;
    },
    onResizeEnd,
  });

  return html`
    <div ref=${container$} className=${className} style=${style}>
      ${sash === "top" &&
      html`
        <div
          ref=${handle$}
          className=${css`
            cursor: row-resize;
            position: relative;
            z-index: 1;
            height: 4px;
            margin-bottom: -4px;
          `}
        ></div>
      `}
      ${children}
      ${sash === "bottom" &&
      html`
        <div
          ref=${handle$}
          className=${css`
            cursor: row-resize;
            position: relative;
            z-index: 1;
            height: 4px;
            margin-top: -4px;
          `}
        ></div>
      `}
    </div>
  `;
}

/**
 * @param {object}                   props
 * @param {() => void=}              props.onResizeStart
 * @param {(e: MouseEvent) => void=} props.onResize
 * @param {() => void=}              props.onResizeEnd
 */
export function useResizable(props) {
  const onResizeStart$ = useRef(props.onResizeStart);
  const onResize$ = useRef(props.onResize);
  const onResizeEnd$ = useRef(props.onResizeEnd);

  useEffect(() => {
    onResizeStart$.current = props.onResizeStart;
    onResize$.current = props.onResize;
    onResizeEnd$.current = props.onResizeEnd;
  });

  const isResizing$ = useRef(false);

  /** @type {{ current?: HTMLElement }} */
  const handle$ = useRef();
  const handle = handle$.current;
  useEffect(() => {
    if (!handle) return;

    const view = handle.ownerDocument?.defaultView;

    const onMouseDown = () => {
      if (isResizing$.current) return;

      isResizing$.current = true;

      onResizeStart$.current?.();
    };

    /** @param {MouseEvent} e */
    const resize = (e) => {
      if (!isResizing$.current) return;

      onResize$.current?.(e);
    };

    const onMouseUp = () => {
      if (!isResizing$.current) return;

      isResizing$.current = false;

      onResizeEnd$.current?.();
    };

    handle.addEventListener("mousedown", onMouseDown);

    view.addEventListener("mousemove", resize);

    view.addEventListener("mouseup", onMouseUp);
    view.addEventListener("mouseleave", onMouseUp);

    return () => {
      handle.removeEventListener("mousedown", onMouseDown);

      view.removeEventListener("mousemove", resize);

      view.removeEventListener("mouseup", onMouseUp);
      view.removeEventListener("mouseleave", onMouseUp);
    };
  }, [handle]);

  return handle$;
}
