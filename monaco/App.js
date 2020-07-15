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

      case "prev": {
        if (draft.currentIndex <= 0) {
          draft.currentIndex = 0;
          return;
        }

        draft.currentIndex -= 1;
        return;
      }

      case "next": {
        if (draft.currentIndex >= draft.diffList.length - 1) {
          draft.currentIndex = draft.diffList.length - 1;
          return;
        }

        draft.currentIndex += 1;
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

export function App() {
  const [_state, dispatch] = useReducer(reducer, {
    currentIndex: initialIndex,
    diffList: [],
  });
  const { indexh, hash, title, original, modified } = computed(_state);

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

  const titleHeight = 24;
  const rightGutter = 30;

  const [fontSize, setFontSize] = useState(16);

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
          border-left: solid 1px silver;
          display: flex;
          align-items: center;
          justify-content: center;
        `}
      >
        ${title}
      </div>

      <${DiffEditor}
        originalSrc=${original?.src}
        originalLang=${original?.lang}
        modifiedSrc=${modified?.src}
        modifiedLang=${modified?.lang}
        options=${{
          fontSize,
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
    </div>
  `;
}
