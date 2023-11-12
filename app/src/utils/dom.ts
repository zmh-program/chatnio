export async function copyClipboard(text: string) {
  /**
   * Copy text to clipboard
   * @param text Text to copy
   * @example
   * await copyClipboard("Hello world!");
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Clipboard/writeText
   */

  if (!navigator.clipboard) {
    const input = document.createElement("input");
    input.value = text;
    input.style.position = "absolute";
    input.style.left = "-9999px";
    document.body.appendChild(input);
    input.select();
    document.execCommand("copy");
    document.body.removeChild(input);
    return;
  }

  await navigator.clipboard.writeText(text);
}

export function saveAsFile(filename: string, content: string) {
  /**
   * Save text as file
   * @param filename Filename
   * @param content File content
   * @example
   * saveAsFile("hello.txt", "Hello world!");
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Blob
   */

  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([content]));
  a.download = filename;
  a.click();
}

export function getSelectionText(): string {
  /**
   * Get selected text
   * @example
   * const text = getSelectionText();
   * console.log(text);
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Window/getSelection
   */

  if (window.getSelection) {
    return window.getSelection()?.toString() || "";
  } else if (document.getSelection && document.getSelection()?.toString()) {
    return document.getSelection()?.toString() || "";
  }
  return "";
}

export function getSelectionTextInArea(el: HTMLElement): string {
  /**
   * Get selected text in element
   * @param el Element
   * @example
   * const text = getSelectionTextInArea(document.getElementById("textarea"));
   * console.log(text);
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Window/getSelection
   */

  const selection = window.getSelection();
  if (!selection) return "";
  const range = selection.getRangeAt(0);
  const preSelectionRange = range.cloneRange();
  preSelectionRange.selectNodeContents(el);
  preSelectionRange.setEnd(range.startContainer, range.startOffset);
  const start = preSelectionRange.toString().length;
  return el.innerText.slice(start, start + range.toString().length);
}

export function useDraggableInput(
  target: HTMLLabelElement,
  handleChange: (files: File[]) => void,
) {
  /**
   * Make input element draggable
   * @param t i18n function
   * @param toast Toast function
   * @param target Input element
   * @param handleChange Handle change function
   * @example
   * const input = document.getElementById("input") as HTMLLabelElement;
   * useDraggableInput(t, toast, input, handleChange);
   */

  target.addEventListener("dragover", (e) => {
    e.preventDefault();
    e.stopPropagation();
  });
  target.addEventListener("drop", (e) => {
    e.preventDefault();
    e.stopPropagation();

    const files = e.dataTransfer?.files || ([] as File[]);
    if (!files.length) return;
    handleChange(Array.from(files));
  });
}

export function testNumberInputEvent(e: any): boolean {
  /**
   * Test if input event is valid for number input
   * @param e Input event
   * @example
   * const handler = (e: any) => {
   *    if (testNumberInputEvent(e)) {
   *      // do something
   *    }
   *    return;
   *  }
   * @see https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key
   */

  if (
    /^[0-9]+$/.test(e.key) ||
    ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"].includes(e.key)
  ) {
    return true;
  }
  e.preventDefault();
  return false;
}

export function replaceInputValue(
  input: HTMLInputElement | undefined,
  value: string,
) {
  /**
   * Replace input value and focus
   * @param input Input element
   * @param value New value
   * @example
   * const input = document.getElementById("input") as HTMLInputElement;
   * replaceInputValue(input, "Hello world!");
   */

  return input && (input.value = value);
}

export function useInputValue(id: string, value: string) {
  /**
   * Replace input value and focus
   * @param id Input element id
   * @param value New value
   * @example
   * const input = document.getElementById("input") as HTMLInputElement;
   * useInputValue("input", "Hello world!");
   */

  const input = document.getElementById(id) as HTMLInputElement | undefined;
  return input && replaceInputValue(input, value) && input.focus();
}

export function addEventListener(
  el: HTMLElement,
  event: string,
  handler: EventListenerOrEventListenerObject,
): () => void {
  /**
   * Add event listener to element
   * @param el Element
   * @param event Event name
   * @param handler Event handler
   * @example
   * const el = document.getElementById("el");
   * const handler = () => console.log("Hello world!");
   * const remove = addEventListener(el, "click", handler);
   * remove();
   */

  el.addEventListener(event, handler);
  return () => el.removeEventListener(event, handler);
}


export function addEventListeners(
  el: HTMLElement,
  events: string[],
  handler: EventListenerOrEventListenerObject,
): () => void {
  /**
   * Add event listeners to element
   * @param el Element
   * @param events Event names
   * @param handler Event handler
   * @example
   * const el = document.getElementById("el");
   * const handler = () => console.log("Hello world!");
   * const remove = addEventListeners(el, ["click", "touchstart"], handler);
   * remove();
   */

  events.forEach((event) => el.addEventListener(event, handler));
  return () => events.forEach((event) => el.removeEventListener(event, handler));
}
