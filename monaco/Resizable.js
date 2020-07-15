// @ts-check
/// <reference path="./typings.d.ts" />

import { css, cx } from "https://cdn.pika.dev/emotion";
import {
  html,
  useEffect,
  useRef,
} from "https://cdn.pika.dev/htm/preact/standalone.module.js";

/**
 * @param {{
    sash: 'top' | 'right' | 'bottom' | 'left'
    onResizeStart?(): void
    onResizeEnd?(): void
    className?: string
    style?: any
    children?: any
  }} props
 */
export function Resizable(props) {
  const {
    sash,
    onResizeStart,
    onResizeEnd,
    className,
    style,
    children,
  } = props;

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

      switch (sash) {
        case "top": {
          const newHeight =
            container.getBoundingClientRect().bottom - e.clientY;
          container.style.height = `${newHeight}px`;
          break;
        }

        case "right": {
          const newWidth = e.clientX - container.getBoundingClientRect().left;
          container.style.width = `${newWidth}px`;
          break;
        }

        case "bottom": {
          const newHeight = e.clientY - container.getBoundingClientRect().top;
          container.style.height = `${newHeight}px`;
          break;
        }

        case "left": {
          const newWidth = container.getBoundingClientRect().right - e.clientX;
          container.style.width = `${newWidth}px`;
          break;
        }
      }
    },
    onResizeEnd,
  });

  return html`
    <div
      ref=${container$}
      className=${cx(
        css`
          position: relative;
        `,
        className
      )}
      style=${style}
    >
      <div
        ref=${handle$}
        className=${cx(
          css`
            position: absolute;
            z-index: 1;
          `,
          sash === "top" &&
            css`
              cursor: row-resize;
              width: 100%;
              height: 4px;
              top: 0;
            `,
          sash === "right" &&
            css`
              cursor: col-resize;
              width: 4px;
              height: 100%;
              right: 0;
            `,
          sash === "bottom" &&
            css`
              cursor: row-resize;
              width: 100%;
              height: 4px;
              bottom: 0;
            `,
          sash === "left" &&
            css`
              cursor: col-resize;
              width: 4px;
              height: 100%;
              left: 0;
            `
        )}
      ></div>

      ${children}
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

  /** @type {{ current?: HTMLElement }} */
  const handle$ = useRef();
  const isResizing$ = useRef(false);

  const handle = handle$.current;
  useEffect(() => {
    const view = handle?.ownerDocument?.defaultView;
    if (!handle || !view) return;

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
