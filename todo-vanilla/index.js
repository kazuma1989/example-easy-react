// @ts-check

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
  const li = document.createElement("div");
  li.innerHTML = `<label><input type="checkbox" /> ${i.text}</label>`;

  list.appendChild(li);
});

const form = document.querySelector("#form");
const input = document.querySelector("#input");

form.addEventListener("submit", (ev) => {
  ev.preventDefault();

  if (!input.value) return;

  const li = document.createElement("div");
  li.innerHTML = `<label><input type="checkbox" /> ${input.value}</label>`;

  list.prepend(li);
  input.value = "";
});
