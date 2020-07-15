// @ts-check
/// <reference path="./typings.d.ts" />

/**
 * @param {object} a
 * @param {object} b
 */
export function shallowEqual(a, b) {
  if (a === b) {
    return true;
  }

  if (typeof a !== "object" || typeof b !== "object") {
    return a === b;
  }

  return Object.keys(a).every((k) => a[k] === b[k]);
}

/**
 * @param {Exclude<keyof HTMLElement['style'], 'length' | 'parentRule'>} key
 * @returns {(e: HTMLElement) => void}
 */
export function clearStyle(key) {
  return (e) => {
    if (!e) return;

    e.style[key] = null;
  };
}
