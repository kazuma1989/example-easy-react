// @ts-check

// @ts-ignore
import { css, cx } from "https://cdn.pika.dev/emotion";

document.body.innerHTML = `
  <h1>TODO list (vanilla)</h1>

  <p>
    <textarea id="input" rows="2" autofocus></textarea>
    <button id="add" type="button">Add</button>
  </p>

  <div id="list"></div>
`;

/** @type {HTMLTextAreaElement} */
const inputArea = document.body.querySelector("#input");
/** @type {HTMLButtonElement} */
const addButton = document.body.querySelector("#add");
/** @type {HTMLElement} */
const todoList = document.body.querySelector("#list");

inputArea.addEventListener("input", () => {
  addButton.disabled = inputArea.value?.length === 0;
});

inputArea.addEventListener("keydown", (e) => {
  // Command + Enter のみ処理
  if (!(e.metaKey && e.code === "Enter")) return;
  if (inputArea.value?.length === 0) return;

  submitTodo();
});

addButton.disabled = true;

const submitTodo = () => {
  prependItem(todoList, {
    done: false,
    text: inputArea.value,
  });

  inputArea.value = "";
  addButton.disabled = true;
};
addButton.addEventListener("click", submitTodo);

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
