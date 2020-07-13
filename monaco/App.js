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

/**
 * @typedef {object} State
 * @property {number} currentIndex
 * @property {DiffSrc[]} diffList
 *
 * @typedef {object} DiffSrc
 * @property {string} title
 * @property {string} path
 * @property {string} lang
 * @property {string} preview
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

export function App() {
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

    window.addEventListener("hashchange", listener);
    return () => {
      window.removeEventListener("hashchange", listener);
    };
  }, []);

  const titleHeight = 32;

  return html`
    <div
      className=${cx(
        css`
          height: 100%;
          display: grid;
          grid-template:
            "title-original title-modified title-spacer" ${titleHeight}px
            "diff diff diff" auto
            "preview-original preview-modified preview-spacer" 1fr
            / 1fr 1fr 30px;
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
          grid-area: title-modified;
        `}
      >
        <span></span> ${modified?.title} ${arrowRight}
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
          height: 70vh;
          min-height: 16px;
          max-height: calc(100vh - ${titleHeight}px - 16px);
        `}
      >
        <${DiffEditor}
          originalSrc=${original?.path}
          originalLang=${original?.lang}
          modifiedSrc=${modified?.path}
          modifiedLang=${modified?.lang}
          className=${css`
            height: 100%;
          `}
        />
      <//>

      <${Iframe}
        src=${original?.preview}
        className=${css`
          grid-area: preview-original;
          min-height: 0;
        `}
      />

      <${Iframe}
        src=${modified?.preview}
        className=${css`
          grid-area: preview-modified;
          min-height: 0;
        `}
      />
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
