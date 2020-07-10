// @ts-check

/** @type {HTMLElement} */
const list = document.querySelector("#list");

[
  {
    done: true,
    text: "brake the wall",
  },
  {
    done: false,
    text: "fix the wall",
  },
].forEach((todo) => {
  addItem(list, todo);
});

/** @type {HTMLTextAreaElement} */
const input = document.querySelector("#input");
/** @type {HTMLButtonElement} */
const submit = document.querySelector("#button");

input.addEventListener("keydown", (ev) => {
  // Command + Enter のみ処理
  if (!(ev.metaKey && ev.code === "Enter")) return;

  submit.click();
});

submit.addEventListener("click", () => {
  if (!input.value) return;

  addItem(list, { done: false, text: input.value });

  input.value = "";
});

/**
 * @param {HTMLElement} list
 * @param {{ done: boolean; text: string }} _
 */
function addItem(list, { text, done }) {
  const item = document.createElement("div");
  item.innerHTML = `<label style="font-weight: normal; white-space: pre-wrap;"><input type="checkbox" /> ${text}</label>`;

  /** @type {HTMLLabelElement} */
  const label = item.querySelector("label");
  /** @type {HTMLInputElement} */
  const checkbox = item.querySelector("input[type=checkbox]");

  const onChange = () => {
    label.style.textDecoration = checkbox.checked ? "line-through" : "";
    label.style.opacity = checkbox.checked ? "0.5" : "";
  };
  checkbox.addEventListener("change", onChange);

  checkbox.checked = done;
  onChange();

  list.prepend(item);
}
