export type EventCommitterProps = {
  name: string;
  destroyedAfterTrigger?: boolean;
};

export class EventCommitter<T> {
  name: string;
  trigger: ((data: T) => void) | undefined;
  listeners: ((data: T) => void)[] = [];
  destroyedAfterTrigger: boolean;

  constructor({ name, destroyedAfterTrigger = false }: EventCommitterProps) {
    this.name = name;
    this.destroyedAfterTrigger = destroyedAfterTrigger;
  }

  protected setTrigger(trigger: (data: T) => void) {
    this.trigger = trigger;
  }

  protected clearTrigger() {
    this.trigger = undefined;
  }

  protected triggerEvent(data: T) {
    this.trigger && this.trigger(data);
    if (this.destroyedAfterTrigger) this.clearTrigger();

    this.listeners.forEach((listener) => listener(data));
  }

  public emit(data: T) {
    this.triggerEvent(data);
  }

  public bind(trigger: (data: T) => void) {
    this.setTrigger(trigger);
  }

  public addEventListener(listener: (data: T) => void) {
    this.listeners.push(listener);
  }

  public removeEventListener(listener: (data: T) => void) {
    this.listeners = this.listeners.filter((item) => item !== listener);
  }

  public clearEventListener() {
    this.listeners = [];
  }
}
