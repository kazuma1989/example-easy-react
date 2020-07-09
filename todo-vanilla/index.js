// @ts-check

const list = document.getElementById("list");

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
