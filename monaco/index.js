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
  console.log({ original, modified });

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

    setTimeout(() => {
      dispatch({
        type: "switch-diff",
        payload: {
          next: "part_3",
        },
      });
    }, 2_000);
  }, []);

  const container$ = useRef();
  useEffect(() => {
    const container = container$.current;
    if (!container) return;

    if (!original || !modified) return;

    container.innerHTML = "";
    const diffEditor = monaco.editor.createDiffEditor(container, {
      readOnly: true,
    });

    Promise.all([
      fetch(`./${original}/index.js`).then((r) => r.text()),
      fetch(`./${modified}/index.js`).then((r) => r.text()),
    ]).then(([originalTxt, modifiedTxt]) => {
      diffEditor.setModel({
        original: monaco.editor.createModel(originalTxt, "javascript"),
        modified: monaco.editor.createModel(modifiedTxt, "javascript"),
      });
    });
  }, [original, modified]);

  return html`
    <div
      className=${css`
        height: 100%;
        display: grid;
        grid-template:
          "diff diff diff" 35%
          "preview-original preview-modified spacer" 65%
          / 1fr 1fr 30px;
      `}
    >
      <div
        ref=${container$}
        className=${css`
          grid-area: diff;
          width: 100%;
          height: 100%;
        `}
      ></div>

      <iframe
        src=${`./${original}`}
        className=${css`
          grid-area: preview-original;
          width: 100%;
          height: 100%;
        `}
      ></iframe>

      <iframe
        src=${`./${modified}`}
        className=${css`
          grid-area: preview-modified;
          width: 100%;
          height: 100%;
        `}
      ></iframe>
    </div>
  `;
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
