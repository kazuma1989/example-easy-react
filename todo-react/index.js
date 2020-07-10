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

  console.log({ todoText, todoList });

  useEffect(() => {
    fetch("/db.json")
      .then((r) => r.json())
      .then(({ todos }) => {
        setTodoList(todos);
      });
  }, []);

  const addTodo = (todo) => {
    setTodoList((list) => [todo, ...list]);
  };
  const toggleDone = (index) => {
    setTodoList((list) =>
      list.map((todo, i) => {
        if (i !== index) {
          return todo;
        }

        return {
          ...todo,
          done: !todo.done,
        };
      })
    );
  };

  const valid = todoText.length >= 1;
  const submitTodo = () => {
    addTodo({ done: false, text: todoText });
    setTodoText("");
  };

  return html`
    <h1>TODO list (React)</h1>

    <textarea
      rows="2"
      autofocus
      value=${todoText}
      onInput=${(e) => setTodoText(e.currentTarget.value)}
      onKeydown=${(e) => {
        // Command + Enter のみ処理
        if (!(e.metaKey && e.code === "Enter")) return;
        if (!valid) return;

        submitTodo();
      }}
    ></textarea>
    <p>
      <button type="button" disabled=${!valid} onClick=${submitTodo}>
        Add
      </button>
    </p>

    <div>
      ${todoList.map(
        ({ done, text }, i) =>
          html`
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
