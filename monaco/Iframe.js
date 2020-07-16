// @ts-check
/// <reference path="./typings.d.ts" />

import { css, cx, keyframes } from "https://cdn.pika.dev/emotion";
import {
  html,
  useState,
} from "https://cdn.pika.dev/htm/preact/standalone.module.js";
import { clearStyle } from "./util.js";

/**
  * @param {{
    src?: string
    className?: string
    style?: any
  }} props
  */
export function Iframe(props) {
  const { src: loadingSrc, className, style } = props;

  const [activeSrc, setActiveSrc] = useState("");
  const loading = activeSrc !== loadingSrc;

  return html`
    <div
      className=${cx(
        loading &&
          css`
            pointer-events: none;
          `,
        className
      )}
      style=${style}
    >
      ${loading &&
      html`
        <${Progress}
          className=${css`
            color: #2a76dd;
            height: 4px;
            margin-bottom: -4px;
          `}
        />
      `}

      <iframe
        key=${activeSrc}
        ref=${// Monaco Editor が強制してくるので、レンダリングの都度打ち消す
        clearStyle("pointerEvents")}
        src=${activeSrc}
        className=${css`
          border: none;
          display: block;
          width: 100%;
          height: 100%;
          min-width: 0;
          min-height: 0;
        `}
      ></iframe>

      ${loading &&
      // display: none の状態でコンテンツを読み込み始め、完了したら古い iframe と入れ替える。
      // そうすることで、src が変わるタイミングで一瞬白く見えてしまうのを防げる。
      html`
        <iframe
          key=${loadingSrc}
          src=${loadingSrc}
          onLoad=${() => {
            setActiveSrc(loadingSrc);
          }}
          className=${css`
            display: none;
          `}
        ></iframe>
      `}
    </div>
  `;
}

/**
 * @param {{
    className?: string
    style?: any
  }} props
 */
function Progress(props) {
  const { className, style } = props;

  return html`
    <div
      className=${cx(
        css`
          height: 4px;
          overflow: hidden;

          ::after {
            content: "";
            display: block;
            width: 100%;
            height: 100%;
            background-color: currentColor;

            transform: translateX(-100%);
            animation: 1.5s ease-out 0.5s infinite ${keyframes`
                from {
                  transform: translateX(-100%);
                }
                to {
                  transform: translateX(100%);
                }`};
          }
        `,
        className
      )}
      style=${style}
    ></div>
  `;
}
