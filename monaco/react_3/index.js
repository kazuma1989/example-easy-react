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
  /** @type {UseState<string>} */
  const [todoText, setTodoText] = useState("");
  /** @type {UseState<Todo[]>} */
  const [todoList, setTodoList] = useState([]);

  const valid = todoText.length >= 1;

  const addTodo = () => {
    setTodoList((list) => [
      {
        done: false,
        text: todoText,
        createdAt: new Date().toISOString(),
      },
      ...list,
    ]);

    setTodoText("");
  };

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

    <p>
      <textarea
        rows="2"
        autofocus
        value=${todoText}
        onInput=${(e) => setTodoText(e.currentTarget.value)}
        onKeydown=${(e) => {
          // Command + Enter のみ処理
          if (!(e.metaKey && e.code === "Enter")) return;
          if (!valid) return;

          addTodo();
        }}
      ></textarea>

      <button type="button" disabled=${!valid} onClick=${addTodo}>
        Add
      </button>
    </p>

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
