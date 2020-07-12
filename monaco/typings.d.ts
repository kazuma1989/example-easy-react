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

  export function useState<S>(initial?: S): [S, (s: S | ((s: S) => S)) => void];

  export function useCallback<T>(fn: T, deps: any[]): T;

  export function useReducer<S, A>(
    reducer: (state: S, action: A) => S,
    initialState?: S
  ): [S, (action: A) => void];
}

/**
 * @see https://gist.github.com/strothj/708afcf4f01dd04de8f49c92e88093c3
 */
declare class ResizeObserver {
  constructor(callback: ResizeObserverCallback);
  disconnect: () => void;
  observe: (target: Element, options?: ResizeObserverObserveOptions) => void;
  unobserve: (target: Element) => void;
}

interface ResizeObserverObserveOptions {
  box?: "content-box" | "border-box";
}

type ResizeObserverCallback = (
  entries: ResizeObserverEntry[],
  observer: ResizeObserver
) => void;

interface ResizeObserverEntry {
  readonly borderBoxSize: ResizeObserverEntryBoxSize;
  readonly contentBoxSize: ResizeObserverEntryBoxSize;
  readonly contentRect: DOMRectReadOnly;
  readonly target: Element;
}

interface ResizeObserverEntryBoxSize {
  blockSize: number;
  inlineSize: number;
}

interface Window {
  ResizeObserver: typeof ResizeObserver;
}
