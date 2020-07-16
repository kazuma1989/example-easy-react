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

function App() {
  const [todoText, setTodoText] = useState("");
  const [todoList, setTodoList] = useState([]);

  useEffect(() => {
    fetch("./db.json")
      .then((r) => r.json())
      .then((data) => {
        setTodoList(data);
      });
  }, []);

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
        text: todoText,
      },
      ...list,
    ]);

    setTodoText("");
  };

  const valid = todoText.length >= 1;

  return html`
    <h1>TODO list</h1>

    <p>
      <textarea
        rows="2"
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

    <p>
      ${todoList.map(
        ({ done, text }, i) => html`
          <label
            key=${i}
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
            />
            ${" "}${text}
          </label>
        `
      )}
    </p>
  `;
}

render(html`<${App} />`, document.body);
