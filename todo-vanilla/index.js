// @ts-check

/** @type {HTMLDivElement} */
const list = document.querySelector("#list");

[
  {
    done: false,
    text: "fix the wall",
  },
  {
    done: false,
    text: "fix the wall",
  },
].forEach((i) => {
  addItem(list, i.text);
});

/** @type {HTMLTextAreaElement} */
const input = document.querySelector("#input");

input.addEventListener("keydown", (ev) => {
  // Command + Enter のみ処理
  if (!(ev.metaKey && ev.code === "Enter")) return;

  if (!input.value) return;

  addItem(list, input.value);

  input.value = "";
});

/**
 * @param {HTMLElement} list
 * @param {string} text
 */
function addItem(list, text) {
  const item = document.createElement("div");
  item.innerHTML = `<label style="font-weight: normal; white-space: pre-wrap;"><input type="checkbox" /> ${text}</label>`;

  const label = item.querySelector("label");
  const checkbox = item.querySelector("input");
  checkbox.addEventListener("change", () => {
    label.style.textDecoration = checkbox.checked ? "line-through" : "";
    label.style.opacity = checkbox.checked ? "0.5" : "";
  });

  list.prepend(item);
}
