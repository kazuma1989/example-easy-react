// @ts-check

// @ts-ignore
import { css, cx } from "https://cdn.pika.dev/emotion";

document.body.innerHTML = `
  <h1>TODO list (vanilla)</h1>

  <div id="list"></div>
`;

/** @type {HTMLElement} */
const todoList = document.body.querySelector("#list");

// API からデータ取得
fetch("./db.json")
  .then((r) => r.json())
  .then(({ todos }) => {
    todos.reverse().forEach((todo) => {
      prependItem(todoList, todo);
    });
  });

/**
 * @param {HTMLElement} list
 * @param {object}  todo
 * @param {boolean} todo.done
 * @param {string}  todo.text
 */
function prependItem(list, { text, done }) {
  const item = document.createElement("label");
  item.innerHTML = `<input type="checkbox" /> ${text}`;

  /** @type {HTMLInputElement} */
  const checkbox = item.querySelector("input[type=checkbox]");
  checkbox.checked = done;

  const onChange = () => {
    item.className = cx(
      css`
        font-weight: normal;
        white-space: pre-wrap;
      `,
      checkbox.checked &&
        css`
          text-decoration: line-through;
          opacity: 0.5;
        `
    );
  };
  checkbox.addEventListener("change", onChange);
  onChange();

  list.prepend(item);
}
