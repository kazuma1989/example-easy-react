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
      <${InputArea}
        value=${todoText}
        valid=${valid}
        onInput=${setTodoText}
        onSubmit=${addTodo}
      />
    </p>

    <p>
      ${todoList.map(
        ({ done, text }, i) => html`
          <${TodoItem}
            key=${i}
            done=${done}
            text=${text}
            onChange=${() => {
              toggleDone(i);
            }}
          />
        `
      )}
    </p>
  `;
}

function InputArea({ value, valid, onInput, onSubmit }) {
  return html`
    <textarea
      rows="2"
      value=${value}
      onInput=${(e) => onInput?.(e.currentTarget.value)}
      onKeydown=${(e) => {
        // Command + Enter のみ処理
        if (!(e.metaKey && e.code === "Enter")) return;
        if (!valid) return;

        onSubmit?.();
      }}
    ></textarea>

    <button type="button" disabled=${!valid} onClick=${onSubmit}>
      Add
    </button>
  `;
}

function TodoItem({ done, text, onChange }) {
  return html`
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
      <input type="checkbox" checked=${done} onChange=${onChange} />
      ${" "}${text}
    </label>
  `;
}

render(html`<${App} />`, document.body);
