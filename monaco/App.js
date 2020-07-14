// @ts-check
/// <reference path="./typings.d.ts" />

import { css, cx } from "https://cdn.pika.dev/emotion";
import {
  html,
  useEffect,
  useReducer,
  useState,
} from "https://cdn.pika.dev/htm/preact/standalone.module.js";
import produce from "https://cdn.pika.dev/immer";
import { DiffEditor } from "./DiffEditor.js";
import { Resizable } from "./Resizable.js";
import { Slide } from "./Slide.js";

/**
 * @typedef {{
    currentIndex: number
    diffList: {
      title: string
      path: string
      lang: string
      preview: string
    }[]
  }} State
 */

/**
 * @typedef {
    | {
      type: 'prev'
    }
    | {
      type: 'next'
    }
    | {
      type: 'set-index'
      payload: {
        index: number
      }
    }
    | {
      type: 'set-diff-list'
      payload: {
        diffList: any[]
      }
    }
    | {
      type: 'set-hash'
      payload: {
        hash: string
      }
    }
  } Action
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

      case "set-index": {
        const { index } = action.payload;

        if (0 <= index && index <= draft.diffList.length - 2) {
          draft.currentIndex = index;
        }
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
    indexh: currentIndex,
    hash: `#${currentIndex}`,
    original,
    modified,
    prevDisabled,
    nextDisabled,
  };
};

const initialIndex = parseInt(location.hash.slice(1)) || 0;

export function App() {
  const [_state, dispatch] = useReducer(reducer, {
    currentIndex: initialIndex,
    diffList: [],
  });
  const {
    indexh,
    hash,
    original,
    modified,
    prevDisabled,
    nextDisabled,
  } = selector(_state);

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

    window.addEventListener("hashchange", listener);
    return () => {
      window.removeEventListener("hashchange", listener);
    };
  }, []);

  const titleHeight = 32;
  const rightGutter = 30;

  return html`
    <div
      className=${cx(
        css`
          height: 100%;
          display: grid;
          grid-template:
            "slide title title-spacer" ${titleHeight}px
            "slide diff diff" 1fr
            "slide preview preview-spacer" auto
            / auto 1fr ${rightGutter}px;
          align-items: stretch;
          justify-items: stretch;
        `,
        isResizing &&
          css`
            user-select: none;
            pointer-events: none;
          `
      )}
    >
      <${Resizable}
        sash="right"
        onResizeStart=${() => {
          setIsResizing(true);
        }}
        onResizeEnd=${() => {
          setIsResizing(false);
        }}
        className=${css`
          grid-area: slide;
          width: 50vw;
          min-width: 100px;
          max-width: calc(100vw - ${rightGutter}px - 100px);
        `}
      >
        <${Slide}
          url="/slides.md"
          indexh=${indexh}
          onChange=${(next) => {
            dispatch({
              type: "set-index",
              payload: {
                index: next.h,
              },
            });
          }}
        />
      <//>

      <div
        className=${css`
          grid-area: title;
          display: flex;
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
            width: 50%;
          `}
        >
          ${arrowLeft} ${original?.title} <span></span>
        <//>

        <${SrcTitle}
          disabled=${nextDisabled}
          onClick=${() => {
            dispatch({
              type: "next",
            });
          }}
          className=${css`
            width: 50%;
          `}
        >
          <span></span> ${modified?.title} ${arrowRight}
        <//>
      </div>

      <${DiffEditor}
        originalSrc=${original?.path}
        originalLang=${original?.lang}
        modifiedSrc=${modified?.path}
        modifiedLang=${modified?.lang}
        className=${css`
          grid-area: diff;
        `}
      />

      <${Resizable}
        sash="top"
        onResizeStart=${() => {
          setIsResizing(true);
        }}
        onResizeEnd=${() => {
          setIsResizing(false);
        }}
        className=${css`
          grid-area: preview;
          height: 20vh;
          min-height: 16px;
          max-height: calc(100vh - ${titleHeight}px - 16px);
          display: flex;
        `}
      >
        <${Resizable}
          sash="right"
          onResizeStart=${() => {
            setIsResizing(true);
          }}
          onResizeEnd=${() => {
            setIsResizing(false);
          }}
          className=${css`
            width: 50%;
            min-width: 100px;
            max-width: calc(50vw - ${rightGutter}px - 100px);
          `}
        >
          <${Iframe}
            src=${original?.preview}
            className=${css`
              height: 100%;
            `}
          />
        <//>

        <div
          className=${css`
            flex-grow: 1;
            flex-basis: 0;
          `}
        >
          <${Iframe}
            src=${modified?.preview}
            className=${css`
              height: 100%;
            `}
          />
        </div>
      <//>
    </div>
  `;
}

/**
 * @param {object}      _
 * @param {boolean=}    _.disabled
 * @param {() => void=} _.onClick
 * @param {string=}     _.className
 * @param {any=}        _.children
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
          padding: 0 8px;
        `,
        className
      )}
    >
      ${children}
    </button>
  `;
}

const arrowLeft = html`
  <svg viewBox="0 0 50 100" style="fill: currentColor; height: 1em;">
    <polygon points="50,0 50,100 0,50" />
  </svg>
`;

const arrowRight = html`
  <svg viewBox="0 0 50 100" style="fill: currentColor; height: 1em;">
    <polygon points="0,0 0,100 50,50" />
  </svg>
`;

/**
 * @param {object}  _
 * @param {string=} _.src
 * @param {string=} _.className
 * @param {any=}    _.style
 */
function Iframe({ src: loadingSrc, className, style }) {
  const [activeSrc, setActiveSrc] = useState("");
  const loading = activeSrc !== loadingSrc;

  return html`
    <div
      className=${cx(
        loading &&
          css`
            opacity: 0.7;
            pointer-events: none;
          `,
        css`
          transition: opacity 0.4s;
        `,
        className
      )}
      style=${style}
    >
      <iframe
        key=${activeSrc}
        ref=${// Monaco Editor が強制してくるので、レンダリングの都度打ち消す
        clearStyle("pointerEvents")}
        src=${activeSrc}
        className=${css`
          border: solid 1px silver;
          display: block;
          width: 100%;
          height: 100%;
          min-width: 0;
          min-height: 0;
        `}
      ></iframe>

      ${loading &&
      // display: none の状態でコンテンツを読み込み始め、完了したら古い iframe と入れ替える。
      // そうすることで、src が変わるタイミングで一瞬白く見えてしまうのを防げる。
      html`
        <iframe
          key=${loadingSrc}
          src=${loadingSrc}
          onLoad=${() => {
            setActiveSrc(loadingSrc);
          }}
          className=${css`
            display: none;
          `}
        ></iframe>
      `}
    </div>
  `;
}

/**
 * @param {Exclude<keyof HTMLElement['style'], 'length' | 'parentRule'>} key
 * @returns {(e: HTMLElement) => void}
 */
const clearStyle = (key) => (e) => {
  if (!e) return;

  e.style[key] = null;
};
