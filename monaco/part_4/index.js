// @ts-check

// @ts-ignore
import { css, cx } from "https://cdn.pika.dev/emotion";

document.body.innerHTML = `
  <h1>TODO list (vanilla)</h1>

  <p>
    <textarea id="input" rows="2" autofocus></textarea>
    <button id="add" type="button">Add</button>
  </p>

  <p>
    Order by: <a id="order-by-created" href="#">Created</a> |
    <a id="order-by-text" href="#">Text</a>
  </p>

  <div id="list"></div>
`;

/** @type {HTMLTextAreaElement} */
const inputArea = document.body.querySelector("#input");
/** @type {HTMLButtonElement} */
const addButton = document.body.querySelector("#add");
/** @type {HTMLAnchorElement} */
const orderByCreated = document.body.querySelector("#order-by-created");
/** @type {HTMLAnchorElement} */
const orderByText = document.body.querySelector("#order-by-text");
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
    createdAt: new Date().toISOString(),
  });

  inputArea.value = "";
  addButton.disabled = true;
};
addButton.addEventListener("click", submitTodo);

orderByCreated.addEventListener("click", (e) => {
  e.preventDefault();

  sortList(
    todoList,
    (t1, t2) => -t1.dataset.createdAt?.localeCompare(t2.dataset.createdAt)
  );
});

orderByText.addEventListener("click", (e) => {
  e.preventDefault();

  sortList(todoList, (t1, t2) => t1.textContent.localeCompare(t2.textContent));
});

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
 * @param {string}  todo.createdAt
 */
function prependItem(list, { text, done, createdAt }) {
  const item = document.createElement("label");
  item.innerHTML = `<input type="checkbox" /> ${text}`;
  item.dataset.createdAt = createdAt;

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

/**
 * @param {HTMLElement} list
 * @param {(e1: HTMLElement, e2: HTMLElement) => number} compareFn
 */
function sortList(list, compareFn) {
  [...list.children].sort(compareFn).forEach((e) => {
    list.appendChild(e);
  });
}
