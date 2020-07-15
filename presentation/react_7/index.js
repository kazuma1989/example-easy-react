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

  const toggleDone = (index) => {
    setTodoList((list) =>
      list.map((todo, i) =>
        i === index ? { ...todo, done: !todo.done } : todo
      )
    );
  };

  const addTodo = () => {
    setTodoList((list) => [
      {
        done: false,
        text: "新しいTODO",
      },
      ...list,
    ]);
  };

  return html`
    <h1>TODO list</h1>

    <p>
      <button type="button" onClick=${addTodo}>
        Add
      </button>
    </p>

    <p>
      ${todoList.map(
        ({ done, text }, i) => html`
          <label key=${i}>
            <input
              type="checkbox"
              checked=${done}
              onChange=${() => {
                toggleDone(i);
              }}
            />
            ${" "}${text}
          </label>
        `
      )}
    </p>
  `;
}

render(html`<${App} />`, document.body);
