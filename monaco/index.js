// @ts-check

import {
  html,
  render,
  useState,
  useEffect,
  useRef,
  // @ts-ignore
} from "https://cdn.pika.dev/htm/preact/standalone.module.js";
// @ts-ignore
import { css, cx, injectGlobal } from "https://cdn.pika.dev/emotion";

const monaco = globalThis.monaco;

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

function App() {
  const container$ = useRef();
  useEffect(() => {
    const container = container$.current;
    if (!container) return;

    const diffEditor = monaco.editor.createDiffEditor(container);

    Promise.all([
      fetch("./part_1/index.js").then((r) => r.text()),
      fetch("./part_2/index.js").then((r) => r.text()),
    ]).then(([originalTxt, modifiedTxt]) => {
      diffEditor.setModel({
        original: monaco.editor.createModel(originalTxt, "javascript"),
        modified: monaco.editor.createModel(modifiedTxt, "javascript"),
      });
    });
  }, []);

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
        src="./part_1"
        className=${css`
          grid-area: preview-original;
          width: 100%;
          height: 100%;
        `}
      ></iframe>

      <iframe
        src="./part_2"
        className=${css`
          grid-area: preview-modified;
          width: 100%;
          height: 100%;
        `}
      ></iframe>
    </div>
  `;
}

render(html`<${App} />`, document.body);
