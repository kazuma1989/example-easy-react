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

/** @type {HTMLElement} */
const list = document.body.querySelector("#list");

[
  { done: true, text: "brake the wall" },
  { done: false, text: "fix the wall" },
].forEach((todo) => {
  addItem(list, todo);
});

/** @type {HTMLTextAreaElement} */
const inputArea = document.body.querySelector("#input");
/** @type {HTMLButtonElement} */
const addButton = document.body.querySelector("#add");

inputArea.addEventListener("keydown", (ev) => {
  // Command + Enter のみ処理
  if (!(ev.metaKey && ev.code === "Enter")) return;

  addButton.click();
});

addButton.addEventListener("click", () => {
  if (!inputArea.value) return;

  addItem(list, { done: false, text: inputArea.value });

  inputArea.value = "";
});

/**
 * @param {HTMLElement} list
 * @param {{ done: boolean; text: string }} _
 */
function addItem(list, { text, done }) {
  const item = document.createElement("div");
  item.innerHTML = `<label><input type="checkbox" /> ${text}</label>`;

  /** @type {HTMLLabelElement} */
  const label = item.querySelector("label");
  /** @type {HTMLInputElement} */
  const checkbox = item.querySelector("input[type=checkbox]");

  const onChange = () => {
    label.className = cx(
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
