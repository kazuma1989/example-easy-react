// @ts-check

// @ts-ignore
import { css, cx } from "https://cdn.pika.dev/emotion";

document.body.innerHTML = `
  <h1>TODO list (vanilla)</h1>

  <textarea id="input" rows="2" autofocus></textarea>
  <p>
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

inputArea.addEventListener("keydown", (ev) => {
  // Command + Enter のみ処理
  if (!(ev.metaKey && ev.code === "Enter")) return;

  addButton.click();
});

addButton.addEventListener("click", () => {
  if (!inputArea.value) return;

  prependItem(todoList, { done: false, text: inputArea.value });

  inputArea.value = "";
});

fetch("/db.json")
  .then((r) => r.json())
  .then(({ todos }) => {
    todos.reverse().forEach((todo) => {
      prependItem(todoList, todo);
    });
  });

/**
 * @param {HTMLElement} list
 * @param {{ done: boolean; text: string }} _
 */
function prependItem(list, { text, done }) {
  const item = document.createElement("label");
  item.innerHTML = `<input type="checkbox" /> ${text}`;

  /** @type {HTMLInputElement} */
  const checkbox = item.querySelector("input[type=checkbox]");

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

  checkbox.checked = done;
  onChange();

  list.prepend(item);
}
