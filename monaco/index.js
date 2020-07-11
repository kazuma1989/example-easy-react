// @ts-check
/// <reference path="./typings.d.ts" />

import {
  html,
  render,
  useReducer,
  useEffect,
  useRef,
} from "https://cdn.pika.dev/htm/preact/standalone.module.js";
import { css, cx, injectGlobal } from "https://cdn.pika.dev/emotion";
import produce from "https://cdn.pika.dev/immer";
import { srcList } from "./srcList.js";

const monaco = globalThis.monaco;

/**
 * @typedef {import('./srcList.js').Src} Src
 */
/**
 * @typedef {object} State
 * @property {number} currentIndex
 * @property {Src[]} srcList
 */
/**
 * @typedef {object} Action
 * @property {'prev' | 'next'} type
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
        if (draft.currentIndex >= draft.srcList.length - 2) return;

        draft.currentIndex += 1;
        return;
      }
    }
  }
);

/** @param {State} _ */
const selector = ({ currentIndex, srcList }) => {
  const original = srcList[currentIndex];
  const modified = srcList[currentIndex + 1];

  const prevDisabled = currentIndex <= 0;
  const nextDisabled = currentIndex >= srcList.length - 2;

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
    srcList,
  });
  const { original, modified, prevDisabled, nextDisabled } = selector(_state);

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
 * @typedef {object} Model
 * @property {string} src
 * @property {string} lang
 */
/**
 * @param {object} _
 * @param {Model=} _.original
 * @param {Model=} _.modified
 * @param {string=} _.className
 */
function DiffEditor({ original, modified, className }) {
  const container$ = useRef();
  useEffect(() => {
    const container = container$.current;
    if (!container) return;

    if (!original || !modified) return;

    Promise.all([
      fetch(original.src).then((r) => r.text()),
      fetch(modified.src).then((r) => r.text()),
    ]).then(([originalTxt, modifiedTxt]) => {
      container.innerHTML = "";
      const diffEditor = monaco.editor.createDiffEditor(container, {
        readOnly: true,
      });

      diffEditor.setModel({
        original: monaco.editor.createModel(originalTxt, original.lang),
        modified: monaco.editor.createModel(modifiedTxt, original.lang),
      });
    });
  }, [original, modified]);

  return html`<div
    ref=${container$}
    className=${cx(
      css`
        border: solid 1px silver;
        border-right: none;
      `,
      className
    )}
  ></div>`;
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
