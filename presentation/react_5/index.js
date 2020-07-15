// @ts-check

import {
  html,
  render,
  useState,
  // @ts-ignore
} from "https://cdn.pika.dev/htm/preact/standalone.module.js";

function App() {
  const [todoList, setTodoList] = useState([
    { done: true, text: "洗濯する" },
    { done: false, text: "Slack見る" },
  ]);

  return html`
    <h1>TODO list (React)</h1>

    <div>
      ${todoList.map(
        ({ done, text }, i) => html`
          <label key=${i}>
            <input
              type="checkbox"
              checked=${done}
              onClick=${() => {
                setTodoList((list) => remove(list, i));
              }}
            />
            ${" "}${text}
          </label>
        `
      )}
    </div>
  `;
}

function remove(list, index) {
  return list.filter((_, i) => i !== index);
}

render(html`<${App} />`, document.body);
