// @ts-check

import {
  html,
  render,
  useState,
  useEffect,
  // @ts-ignore
} from "https://cdn.pika.dev/htm/preact/standalone.module.js";
// @ts-ignore
import { css, cx } from "https://cdn.pika.dev/emotion";

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

  /** @param {number} index */
  const toggleDone = (index) => {
    setTodoList((list) =>
      list.map((todo, i) =>
        i === index ? { ...todo, done: !todo.done } : todo
      )
    );
  };

  return html`
    <h1>TODO list (React)</h1>

    <div>
      ${todoList.map(
        ({ done, text }, i) => html`
          <label
            className=${cx(
              css`
                font-weight: normal;
                white-space: pre-wrap;
              `,
              done &&
                css`
                  text-decoration: line-through;
                  opacity: 0.5;
                `
            )}
          >
            <input
              type="checkbox"
              checked=${done}
              onChange=${() => {
                toggleDone(i);
              }}
            />${" "}${text}
          </label>
        `
      )}
    </div>
  `;
}

render(html`<${App} />`, document.body);
