import React from "react";
import {
  closeSpinnerType,
  openSpinnerType,
  spinnerEvent,
} from "@/events/spinner.ts";
import { generateListNumber } from "@/utils/base.ts";

export function lazyFactor<T extends React.ComponentType<any>>(
  factor: () => Promise<{ default: T }>,
): React.LazyExoticComponent<T> {
  /**
   * Lazy load factor
   * @see https://reactjs.org/docs/code-splitting.html#reactlazy
   *
   * @example
   * lazyFactor(() => import("./factor.tsx"));
   */

  return React.lazy(() => {
    return new Promise((resolve, reject) => {
      const task = generateListNumber(6);
      const id = setTimeout(
        () =>
          spinnerEvent.emit({
            id: task,
            type: openSpinnerType,
          }),
        1000,
      );

      factor()
        .then((module) => {
          clearTimeout(id);
          spinnerEvent.emit({
            id: task,
            type: closeSpinnerType,
          });
          resolve(module);
        })
        .catch((error) => {
          console.warn(`[factor] cannot load factor: ${error}`);
          reject(error);
        });
    });
  });
}
