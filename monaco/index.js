// @ts-check
/// <reference path="./typings.d.ts" />

import {
  html,
  render,
  useReducer,
  useEffect,
  useRef,
  useCallback,
  useState,
} from "https://cdn.pika.dev/htm/preact/standalone.module.js";
import { css, cx, injectGlobal } from "https://cdn.pika.dev/emotion";
import produce from "https://cdn.pika.dev/immer";
import { DiffEditor } from "./DiffEditor.js";

/**
 * @typedef {object} DiffSrc
 * @property {string} title
 * @property {string} path
 * @property {string} lang
 * @property {string} preview
 */

/**
 * @typedef {object} State
 * @property {number} currentIndex
 * @property {DiffSrc[]} diffList
 */

/**
 * @typedef {object} Action
 * @property {'prev' | 'next' | 'set-diff-list' | 'set-hash'} type
 * @property {any=} payload
 */

const reducer = produce(
  /**
   * @param {State} draft
   * @param {Action} action
   */
  (draft, action) => {
    switch (action?.type) {
      case "prev": {
        if (draft.currentIndex <= 0) return;

        draft.currentIndex -= 1;
        return;
      }

      case "next": {
        if (draft.currentIndex >= draft.diffList.length - 2) return;

        draft.currentIndex += 1;
        return;
      }

      case "set-diff-list": {
        const { diffList } = action.payload;

        draft.diffList = diffList;
        return;
      }

      case "set-hash": {
        const { hash } = action.payload;

        const maybeNewIndex = parseInt(hash.slice(1));
        if (isNaN(maybeNewIndex)) return;

        if (0 <= maybeNewIndex && maybeNewIndex <= draft.diffList.length - 2) {
          draft.currentIndex = maybeNewIndex;
        }
        return;
      }
    }
  }
);

/** @param {State} _ */
const selector = ({ currentIndex, diffList }) => {
  const original = diffList[currentIndex];
  const modified = diffList[currentIndex + 1];

  const prevDisabled = currentIndex <= 0;
  const nextDisabled = currentIndex >= diffList.length - 2;

  return {
    hash: `#${currentIndex}`,
    original,
    modified,
    prevDisabled,
    nextDisabled,
  };
};

const initialIndex = parseInt(location.hash.slice(1)) || 0;

function App() {
  const [_state, dispatch] = useReducer(reducer, {
    currentIndex: initialIndex,
    diffList: [],
  });
  const { hash, original, modified, prevDisabled, nextDisabled } = selector(
    _state
  );

  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    fetch("/diff-list.json")
      .then((r) => r.json())
      .then((diffList) => {
        dispatch({
          type: "set-diff-list",
          payload: {
            diffList,
          },
        });

        dispatch({
          type: "set-hash",
          payload: {
            hash: location.hash,
          },
        });
      });
  }, []);

  useEffect(() => {
    location.hash = hash;
  }, [hash]);

  useEffect(() => {
    const listener = () => {
      dispatch({
        type: "set-hash",
        payload: {
          hash: location.hash,
        },
      });
    };

    globalThis.addEventListener("hashchange", listener);
    return () => {
      globalThis.removeEventListener("hashchange", listener);
    };
  }, []);

  return html`
    <div
      className=${css`
        height: 100%;
        display: grid;
        grid-template:
          "title-original title-modified title-spacer" 32px
          "diff diff diff" auto
          "preview-original preview-modified preview-spacer" 1fr
          / 1fr 1fr 30px;
        align-items: stretch;
        justify-items: stretch;
      `}
    >
      <${SrcTitle}
        disabled=${prevDisabled}
        onClick=${() => {
          dispatch({
            type: "prev",
          });
        }}
        className=${css`
          grid-area: title-original;
        `}
      >
        <${Icon} type="left-arrow" />
        ${original?.title}
        <span></span>
      <//>

      <${SrcTitle}
        disabled=${nextDisabled}
        onClick=${() => {
          dispatch({
            type: "next",
          });
        }}
        className=${css`
          grid-area: title-modified;
        `}
      >
        <span></span>
        ${modified?.title}
        <${Icon} type="right-arrow" />
      <//>

      <${Resizable}
        onResizeStart=${() => {
          setIsResizing(true);
        }}
        onResizeEnd=${() => {
          setIsResizing(false);
        }}
        className=${css`
          grid-area: diff;
          height: 300px;
        `}
      >
        <${DiffEditor}
          original=${original
            ? {
                src: original.path,
                lang: original.lang,
              }
            : undefined}
          modified=${modified
            ? {
                src: modified.path,
                lang: original.lang,
              }
            : undefined}
          className=${css`
            height: 100%;
          `}
        />
      <//>

      <${Iframe}
        src=${original?.preview}
        className=${cx(
          css`
            grid-area: preview-original;
          `,
          isResizing &&
            css`
              pointer-events: none;
            `
        )}
      />

      <${Iframe}
        src=${modified?.preview}
        className=${cx(
          css`
            grid-area: preview-modified;
          `,
          isResizing &&
            css`
              pointer-events: none;
            `
        )}
      />
    </div>
  `;
}

/**
 * @param {object} _
 * @param {number | string=} _.handleSize
 * @param {() => void=} _.onResizeStart
 * @param {() => void=} _.onResizeEnd
 * @param {string=} _.className
 * @param {any=} _.children
 */
function Resizable({
  handleSize = 4,
  onResizeStart,
  onResizeEnd,
  className,
  children,
}) {
  const container$ = useRef();
  const positionY$ = useRef(0);

  const resize = useCallback(
    /** @param {MouseEvent} e */
    (e) => {
      const container = container$.current;
      if (!container) return;

      const dy = e.y - positionY$.current;
      positionY$.current = e.y;

      container.style.height = `${
        parseInt(getComputedStyle(container).height) + dy
      }px`;
    },
    []
  );

  const onResizeEnd$ = useRef(onResizeEnd);
  useEffect(() => {
    const onMouseUp = () => {
      onResizeEnd$.current?.();
      document.removeEventListener("mousemove", resize);
    };

    document.addEventListener("mouseup", onMouseUp);
    return () => {
      document.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("mousemove", resize);
    };
  }, [resize]);

  return html`
    <div
      ref=${container$}
      className=${className}
      style=${{
        paddingBottom: handleSize,
      }}
    >
      ${children}

      <div
        onMouseDown=${(e) => {
          positionY$.current = e.y;
          onResizeStart?.();
          document.addEventListener("mousemove", resize);
        }}
        className=${css`
          cursor: row-resize;
          background-color: silver;
        `}
        style=${{
          height: handleSize,
        }}
      ></div>
    </div>
  `;
}

/**
 * @param {object} _
 * @param {boolean=} _.disabled
 * @param {() => void=} _.onClick
 * @param {string=} _.className
 * @param {any=} _.children
 */
function SrcTitle({ disabled, onClick, className, children }) {
  return html`
    <button
      disabled=${disabled}
      onClick=${onClick}
      className=${cx(
        css`
          border: solid 1px silver;
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 14px;
        `,
        className
      )}
    >
      ${children}
    </button>
  `;
}

/**
 * @param {object} _
 * @param {'left-arrow' | 'right-arrow'} _.type
 */
function Icon({ type }) {
  switch (type) {
    case "left-arrow": {
      return html`
        <svg viewBox="0 0 50 100" style="fill: currentColor; height: 1em;">
          <polygon points="50,0 50,100 0,50" />
        </svg>
      `;
    }

    case "right-arrow": {
      return html`
        <svg viewBox="0 0 50 100" style="fill: currentColor; height: 1em;">
          <polygon points="0,0 0,100 50,50" />
        </svg>
      `;
    }
  }
}

/**
 * @param {object} _
 * @param {string=} _.src
 * @param {string=} _.className
 */
function Iframe({ src, className }) {
  return html`<iframe
    src=${src}
    className=${cx(
      css`
        border: solid 1px silver;
      `,
      className
    )}
  ></iframe>`;
}

injectGlobal`
  * {
    box-sizing: border-box;
  }

  html,
  body {
    max-width: unset;
    height: 100%;
    margin: 0;
    padding: 0;
    overscroll-behavior: none;
  }
`;

render(html`<${App} />`, document.body);
