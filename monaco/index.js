// @ts-check
/// <reference path="./typings.d.ts" />

import {
  html,
  render,
  useReducer,
  useEffect,
} from "https://cdn.pika.dev/htm/preact/standalone.module.js";
import { css, cx, injectGlobal } from "https://cdn.pika.dev/emotion";
import produce from "https://cdn.pika.dev/immer";
import { DiffEditor } from "./DiffEditor.js";

/**
 * @typedef {object} DiffSrc
 * @property {string} title
 * @property {string} path
 * @property {string} preview
 */

/**
 * @typedef {object} State
 * @property {number} currentIndex
 * @property {DiffSrc[]} diffList
 */

/**
 * @typedef {object} Action
 * @property {'prev' | 'next' | 'set-diff-list'} type
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
    original,
    modified,
    prevDisabled,
    nextDisabled,
  };
};

function App() {
  const [_state, dispatch] = useReducer(reducer, {
    currentIndex: 0,
    diffList: [],
  });
  const { original, modified, prevDisabled, nextDisabled } = selector(_state);

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
      });
  }, []);

  return html`
    <div
      className=${css`
        height: 100%;
        display: grid;
        grid-template:
          "title-original title-modified title-spacer" 40px
          "diff diff diff" 45%
          "preview-original preview-modified preview-spacer" 1fr
          / 1fr 1fr 30px;
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

      <${DiffEditor}
        original=${original
          ? {
              src: original.path,
              lang: "javascript",
            }
          : undefined}
        modified=${modified
          ? {
              src: modified.path,
              lang: "javascript",
            }
          : undefined}
        className=${css`
          grid-area: diff;
          width: 100%;
          height: 100%;
        `}
      />

      <${Iframe}
        src=${original?.preview}
        className=${css`
          grid-area: preview-original;
          width: 100%;
          height: 100%;
        `}
      />

      <${Iframe}
        src=${modified?.preview}
        className=${css`
          grid-area: preview-modified;
          width: 100%;
          height: 100%;
        `}
      />
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
  }
`;

render(html`<${App} />`, document.body);
