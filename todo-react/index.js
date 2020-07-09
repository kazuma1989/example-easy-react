// @ts-check

import {
  html,
  render,
  useState,
  useEffect,
  // @ts-ignore
} from "https://unpkg.com/htm/preact/standalone.module.js";

function App() {
  const [todoText, setTodoText] = useState("");
  const [todoList, setTodoList] = useState([
    {
      done: false,
      text: "fix the wall",
    },
    {
      done: true,
      text: "broke the wall",
    },
  ]);

  console.log({ todoText, todoList });

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

  const submitTodo = () => {
    if (!todoText) return;

    addTodo({ done: false, text: todoText });
    setTodoText("");
  };

  return html`
    <h1>TODO list (React)</h1>

    <textarea
      rows="3"
      autofocus
      value=${todoText}
      onInput=${(e) => setTodoText(e.currentTarget.value)}
      onKeydown=${(e) => {
        // Command + Enter のみ処理
        if (!(e.metaKey && e.code === "Enter")) return;

        submitTodo();
      }}
    ></textarea>
    <p>
      <button type="button" onClick=${submitTodo}>
        Add
      </button>
    </p>

    <div>
      ${todoList.map(
        ({ done, text }, i) =>
          html`
            <label
              style=${{
                fontWeight: "normal",
                whiteSpace: "pre-wrap",
                textDecoration: done ? "line-through" : undefined,
                opacity: done ? 0.5 : undefined,
              }}
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
