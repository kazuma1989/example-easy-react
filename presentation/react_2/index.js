// @ts-check

import {
  html,
  render,
  // @ts-ignore
} from "https://cdn.pika.dev/htm/preact/standalone.module.js";

function App() {
  return html`
    <h1>TODO list (React)</h1>

    <div>
      <label><input type="checkbox" checked /> 洗濯する</label>
      <label><input type="checkbox" /> Slack見る</label>
    </div>
  `;
}

render(html`<${App} />`, document.body);
