declare module "https://*";

declare module "https://cdn.pika.dev/immer" {
  export default function produce<T, P>(
    fn: (draft: T, ...args: P) => void
  ): (value: T, ...args: P) => T;
}

declare module "https://cdn.pika.dev/htm/preact/standalone.module.js" {
  export const html: Function;
  export const render: Function;
  export const useEffect: Function;
  export const useRef: Function;

  export function useReducer<S, A>(
    reducer: (state: S, action: A) => S,
    initialState?: S
  ): [S, (action: A) => void];
}
