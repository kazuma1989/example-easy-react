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
  item.innerHTML = `<label><input type="checkbox" /> ${i.text}</label>`;

  list.appendChild(item);
});

/** @type {HTMLTextAreaElement} */
const input = document.querySelector("#input");

input.addEventListener(
  "keydown",
  /** @param {KeyboardEvent} ev */
  (ev) => {
    if (!(ev.metaKey && ev.code === "Enter")) return;

    // Command + Enter
    if (!input.value) return;

    const item = document.createElement("div");
    item.innerHTML = `<label style="white-space: pre-wrap;"><input type="checkbox" /> ${input.value}</label>`;

    list.prepend(item);
    input.value = "";
  }
);
