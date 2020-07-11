// @ts-check

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

  list.prepend(item);
}
