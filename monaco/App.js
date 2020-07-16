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
import { Iframe } from "./Iframe.js";
import { Resizable } from "./Resizable.js";
import { Slide } from "./Slide.js";

/**
 * @typedef {{
    currentIndex: number
    diffList: {
      title: string
      original: {
        src: string
        lang: string
        preview: string
      }
      modified: {
        src: string
        lang: string
        preview: string
      }
    }[]
  }} State
 */

/**
 * @typedef {
    | {
      type: 'set-diff-list'
      payload: {
        diffList: any[]
      }
    }
    | {
      type: 'set-index'
      payload: {
        index: number
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
      case "set-diff-list": {
        const { diffList } = action.payload;

        draft.diffList = diffList;
        return;
      }

      case "set-index": {
        const { index } = action.payload;

        if (0 <= index && index <= draft.diffList.length - 1) {
          draft.currentIndex = index;
        }
        return;
      }
    }
  }
);

/** @param {State} _ */
const computed = ({ currentIndex, diffList }) => {
  const { title, original, modified } = diffList[currentIndex] ?? {};

  return {
    indexh: currentIndex,
    hash: `#${currentIndex}`,
    title,
    original,
    modified,
  };
};

const initialIndex = parseInt(location.hash.slice(1)) || 0;

/**
 * @param {{
    className?: string
    style?: any
  }} props
 */
export function App(props) {
  const { className, style } = props;

  const [_state, dispatch] = useReducer(reducer, {
    currentIndex: initialIndex,
    diffList: [],
  });
  const { indexh, hash, title, original, modified } = computed(_state);

  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    fetch("./diff-list.json")
      .then((r) => r.json())
      .then((diffList) => {
        dispatch({
          type: "set-diff-list",
          payload: {
            diffList,
          },
        });

        dispatch({
          type: "set-index",
          payload: {
            index: parseInt(location.hash?.slice(1)),
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
        type: "set-index",
        payload: {
          index: parseInt(location.hash?.slice(1)),
        },
      });
    };

    window.addEventListener("hashchange", listener);
    return () => {
      window.removeEventListener("hashchange", listener);
    };
  }, []);

  const [fontSize, setFontSize] = useState(16);
  const [renderSideBySide, setRenderSideBySide] = useState(true);

  return html`
    <div
      className=${cx(
        css`
          font-family: "Helvetica Neue", Arial, "Hiragino Kaku Gothic ProN",
            "Hiragino Sans", Meiryo, sans-serif;

          height: 100%;
          display: grid;
          grid-template:
            "slide title title" 24px
            "slide diff diff" 1fr
            "slide preview preview-spacer" auto
            "status status status" 24px
            / auto 1fr 30px;
          align-items: stretch;
          justify-items: stretch;
        `,
        isResizing &&
          css`
            user-select: none;
            pointer-events: none;
          `,
        className
      )}
      style=${style}
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
          max-width: calc(100vw - 200px);
        `}
      >
        <${Slide}
          url="./slides.md"
          indexh=${indexh}
          separatorVertical=${"=\n"}
          options=${{
            // keyboardCondition: "focused",
            controlsLayout: "bottom-right",
            transitionSpeed: "fast",
            navigationMode: "linear",
          }}
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
          border-left: solid 1px silver;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 8px;
        `}
      >
        <button
          type="button"
          title=${renderSideBySide
            ? "インライン表示に切り替える"
            : "分割表示に切り替える"}
          onClick=${() => {
            setRenderSideBySide((v) => !v);
          }}
          className=${css`
            display: flex;
          `}
        >
          ${renderSideBySide ? iconSplitVertical : iconSplitNone}
        </button>

        <div>${title}</div>

        <div
          className=${css`
            display: flex;
            align-items: center;
            justify-content: space-between;

            > :not(:first-child) {
              margin-left: 4px;
            }
          `}
        >
          <button
            type="button"
            title="文字を小さくする"
            onClick=${() => {
              setFontSize((s) => s - 4);
            }}
            className=${css`
              display: flex;
            `}
          >
            ${iconMinus}
          </button>

          <button
            type="button"
            title="文字を大きくする"
            onClick=${() => {
              setFontSize((s) => s + 4);
            }}
            className=${css`
              display: flex;
            `}
          >
            ${iconPlus}
          </button>
        </div>
      </div>

      <${DiffEditor}
        originalSrc=${original?.src}
        originalLang=${original?.lang}
        modifiedSrc=${modified?.src}
        modifiedLang=${modified?.lang}
        options=${{
          scrollBeyondLastLine: false,
          lineNumbers: false,
          fontSize,
          renderSideBySide,
        }}
        className=${css`
          grid-area: diff;
          border: solid 1px silver;
          border-right: none;
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
          max-height: calc(100vh - 50px);
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
            max-width: calc(100% - 100px);
            border-left: solid 1px silver;
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
            border-left: solid 1px silver;
            border-right: solid 1px silver;
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

      <div
        className=${css`
          grid-area: status;
          border-top: solid 1px silver;
          padding: 0 16px;

          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 12px;
        `}
      >
        <div></div>
        <div>
          ${original?.src}${" ↔ "}${modified?.src}
        </div>
      </div>
    </div>
  `;
}

const iconMinus = html`
  <svg
    viewBox="0 0 100 100"
    style="fill: transparent; stroke: currentColor; stroke-width: 6; height: 1em;"
  >
    <polyline points="8,50 92,50" />
  </svg>
`;

const iconPlus = html`
  <svg
    viewBox="0 0 100 100"
    style="fill: transparent; stroke: currentColor; stroke-width: 6; height: 1em;"
  >
    <polyline points="8,50 92,50" />
    <polyline points="50,8 50,92" />
  </svg>
`;

const iconSplitVertical = html`
  <svg
    viewBox="0 0 100 100"
    style="fill: transparent; stroke: currentColor; stroke-width: 6; height: 1em;"
  >
    <rect x="3" y="3" width="94" height="94" />

    <polyline points="14,26 86,26" stroke-dasharray="28 16 28" />
    <polyline points="14,40 86,40" stroke-dasharray="28 16 28" />
    <polyline points="14,54 86,54" stroke-dasharray="28 16 12 8 8" />
  </svg>
`;

const iconSplitNone = html`
  <svg
    viewBox="0 0 100 100"
    style="fill: transparent; stroke: currentColor; stroke-width: 6; height: 1em;"
  >
    <rect x="3" y="3" width="94" height="94" />

    <polyline points="14,26 86,26" stroke-dasharray="36 0 36" />
    <polyline points="14,40 86,40" stroke-dasharray="36 0 36" />
    <polyline points="14,54 86,54" stroke-dasharray="36 0 20 8 8" />
  </svg>
`;
