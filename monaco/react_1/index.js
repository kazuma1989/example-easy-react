// @ts-check

import {
  html,
  render,
  useState,
  useEffect,
  // @ts-ignore
} from "https://cdn.pika.dev/htm/preact/standalone.module.js";

/**
 * @template T
 * @typedef {[T, (action: T | ((v: T) => T)) => void]} UseState<T>
 */

/**
 * @typedef {object} Todo
 * @property {boolean} done
 * @property {string} text
 * @property {string} createdAt
 */

function App() {
  /** @type {UseState<Todo[]>} */
  const [todoList, setTodoList] = useState([]);

  useEffect(() => {
    fetch("./db.json")
      .then((r) => r.json())
      .then(({ todos }) => {
        setTodoList(todos);
      });
  }, []);

  return html`
    <h1>TODO list (React)</h1>

    <div>
      ${todoList.map(
        ({ done, text }) => html`
          <label><input type="checkbox" checked=${done} /> ${text}</label>
        `
      )}
    </div>
  `;
}

render(html`<${App} />`, document.body);
