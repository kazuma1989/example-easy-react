// @ts-check

import {
  html,
  render,
  useReducer,
  useEffect,
  useRef,
  // @ts-ignore
} from "https://cdn.pika.dev/htm/preact/standalone.module.js";
// @ts-ignore
import { css, cx, injectGlobal } from "https://cdn.pika.dev/emotion";
// @ts-ignore
import produce from "https://cdn.pika.dev/immer";

const monaco = globalThis.monaco;

const reducer = produce((draft, action) => {
  switch (action?.type) {
    case "switch-diff": {
      const { next } = action.payload;

      draft.original = draft.modified;
      draft.modified = next;
    }
  }
});

function App() {
  const [{ original, modified }, dispatch] = useReducer(reducer, {});

  useEffect(() => {
    dispatch({
      type: "switch-diff",
      payload: {
        next: "part_1",
      },
    });

    dispatch({
      type: "switch-diff",
      payload: {
        next: "part_2",
      },
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
        className=${css`
          grid-area: title-original;
        `}
      >
        ${original}
      <//>
      <${SrcTitle}
        className=${css`
          grid-area: title-modified;
        `}
      >
        ${modified}
      <//>

      <${DiffEditor}
        original=${original
          ? {
              src: `./${original}/index.js`,
              lang: "javascript",
            }
          : undefined}
        modified=${modified
          ? {
              src: `./${modified}/index.js`,
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
        src=${original ? `./${original}` : undefined}
        className=${css`
          grid-area: preview-original;
          width: 100%;
          height: 100%;
        `}
      />

      <${Iframe}
        src=${modified ? `./${modified}` : undefined}
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
 * @param {string=} _.className
 * @param {any=} _.children
 */
function SrcTitle({ className, children }) {
  return html`
    <div
      className=${cx(
        css`
          border: solid 1px silver;
          display: flex;
          align-items: center;
          padding: 0 8px;

          justify-content: center;
        `,
        className
      )}
    >
      ${children}
    </div>
  `;
}

/**
 * @typedef {object} Model
 * @property {string} src
 * @property {string} lang
 *
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

  return html`<div ref=${container$} className=${className}></div>`;
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
