export async function copyClipboard(text: string) {
  /**
   * Copy text to clipboard
   * @param text Text to copy
   * @example
   * await copyClipboard("Hello world!");
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Clipboard/writeText
   */

  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return await navigator.clipboard.writeText(text);
    }

    const el = document.createElement("textarea");
    el.value = text;
    // android may require editable
    el.style.position = "absolute";
    el.style.left = "-9999px";
    document.body.appendChild(el);
    el.focus();
    el.select();
    el.setSelectionRange(0, text.length);
    document.execCommand("copy");
    document.body.removeChild(el);
  } catch (e) {
    console.warn(e);
  }
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

export function saveBlobAsFile(filename: string, blob: Blob) {
  /**
   * Save blob as file
   * @param filename Filename
   * @param blob Blob
   * @example
   * saveBlobAsFile("hello.txt", new Blob(["Hello world!"]));
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Blob
   */

  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
}

export function saveImageAsFile(filename: string, data_url: string) {
  /**
   * Save data url as image file
   * @param filename Filename
   * @param data_url Data url
   * @example
   * saveImageAsFile("hello.png", "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAABwElEQVRIS+2VwQ3CMBBF/4f7B0Qf4B9
   */

  const a = document.createElement("a");
  a.href = data_url;
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
  target: HTMLElement,
  handleChange: (files: File[]) => void,
) {
  /**
   * Make input element draggable
   */

  const dragOver = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const drop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const files = e.dataTransfer?.files || ([] as File[]);
    if (!files.length) return;
    handleChange(Array.from(files));
  };

  target.addEventListener("dragover", dragOver);
  target.addEventListener("drop", drop);

  return () => {
    target.removeEventListener("dragover", dragOver);
    target.removeEventListener("drop", drop);
  };
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
  el: Window | HTMLElement,
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
  return () =>
    events.forEach((event) => el.removeEventListener(event, handler));
}

export function scrollDown(el: HTMLElement | null) {
  /**
   * Scroll to bottom
   * @param el Element
   * @example
   * const el = document.getElementById("el");
   * scrollDown(el);
   */

  el &&
    el.scrollTo({
      top: el.scrollHeight,
      behavior: "smooth",
    });
}

export function scrollUp(el: HTMLElement | null) {
  /**
   * Scroll to top
   * @param el Element
   * @example
   * const el = document.getElementById("el");
   * scrollUp(el);
   */

  el &&
    el.scrollTo({
      top: 0,
      behavior: "smooth",
    });
}

export function updateFavicon(url: string) {
  /**
   * Update favicon in the link element from head
   * @param url Favicon url
   * @example
   * updateFavicon("https://example.com/favicon.ico");
   */

  const link = document.querySelector("link[rel*='icon']");
  return link && link.setAttribute("href", url);
}

export function updateDocumentTitle(title: string) {
  /**
   * Update document title
   * @param title Document title
   * @example
   * updateDocumentTitle("Hello world!");
   */

  document.title = title;
}

export function getQuerySelector(query: string): HTMLElement | null {
  /**
   * Get element by query selector
   * @param query Query selector
   * @example
   * const el = getQuerySelector("#el");
   * console.log(el);
   */

  return document.body.querySelector(query);
}

export function isContainDom(
  el: HTMLElement | undefined | null,
  target: HTMLElement | undefined | null,
  notIncludeSelf = false,
) {
  /**
   * Test if element contains target
   * @param el Element
   * @param target Target
   * @example
   * const el = document.getElementById("el");
   * const target = document.getElementById("target");
   * console.log(isContain(el, target));
   */

  if (!el || !target) return false;
  if (!notIncludeSelf) {
    return el.contains(target);
  }
  return el === target || el.contains(target);
}
