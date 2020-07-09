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
  const item = document.createElement("div");
  item.innerHTML = `<label style="white-space: pre-wrap;"><input type="checkbox" /> ${i.text}</label>`;

  list.appendChild(item);
});

/** @type {HTMLTextAreaElement} */
const input = document.querySelector("#input");

input.addEventListener("keydown", (ev) => {
  // Command + Enter のみ処理
  if (!(ev.metaKey && ev.code === "Enter")) return;

  if (!input.value) return;

  const item = document.createElement("div");
  item.innerHTML = `<label style="white-space: pre-wrap;"><input type="checkbox" /> ${input.value}</label>`;

  list.prepend(item);
  input.value = "";
});
