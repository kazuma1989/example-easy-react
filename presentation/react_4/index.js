// @ts-check

import {
  html,
  render,
  // @ts-ignore
} from "https://cdn.pika.dev/htm/preact/standalone.module.js";

function App() {
  const todoList = [
    { done: true, text: "洗濯する" },
    { done: false, text: "Slack見る" },
  ];

  return html`
    <h1>TODO list</h1>

    <p>
      ${todoList.map(
        ({ done, text }, i) => html`
          <label key=${i}>
            <input type="checkbox" checked=${done} />
            ${" "}${text}
          </label>
        `
      )}
    </p>
  `;
}

render(html`<${App} />`, document.body);
