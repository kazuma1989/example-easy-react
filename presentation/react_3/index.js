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
      <label>
        <input type="checkbox" checked=${todoList[0].done} />
        ${" "}${todoList[0].text}
      </label>

      <label>
        <input type="checkbox" checked=${todoList[1].done} />
        ${" "}${todoList[1].text}
      </label>
    </p>
  `;
}

render(html`<${App} />`, document.body);
