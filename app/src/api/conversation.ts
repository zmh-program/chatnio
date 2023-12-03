import { ChatProps, Connection, StreamMessage } from "./connection.ts";
import { Message } from "./types.ts";
import { sharingEvent } from "@/events/sharing.ts";
import { connectionEvent } from "@/events/connection.ts";
import { AppDispatch } from "@/store";
import { setMessages } from "@/store/chat.ts";
import { modelEvent } from "@/events/model.ts";
import { Mask } from "@/masks/types.ts";

type ConversationCallback = (idx: number, message: Message[]) => boolean;

export class Conversation {
  protected connection?: Connection;
  protected callback?: ConversationCallback;
  protected idx: number;
  public id: number;
  public model: string;
  public data: Message[];
  public end: boolean;
  public mask: Mask | null;

  public constructor(id: number, callback?: ConversationCallback) {
    if (callback) this.setCallback(callback);
    this.data = [];
    this.idx = -1;
    this.id = id;
    this.model = "";
    this.end = true;
    this.mask = null;
    this.connection = new Connection(this.id);

    if (id === -1 && this.idx === -1) {
      sharingEvent.bind(({ refer, data }) => {
        console.debug(
          `[conversation] load from sharing event (ref: ${refer}, length: ${data.length})`,
        );

        this.load(data);
        this.sendShareEvent(refer);
      });
    }

    connectionEvent.addEventListener((ev) => {
      if (ev.id === this.id) {
        console.debug(
          `[conversation] connection event (id: ${this.id}, event: ${ev.event})`,
        );

        switch (ev.event) {
          case "stop":
            this.end = true;
            this.data[this.data.length - 1].end = true;
            this.sendStopEvent();
            this.triggerCallback();
            break;

          case "restart":
            this.end = false;
            delete this.data[this.data.length - 1];
            this.connection?.setCallback(this.useMessage());
            this.sendRestartEvent();
            break;

          default:
            console.debug(
              `[conversation] unknown event: ${ev.event} (from: ${ev.id})`,
            );
        }
      }
    });
  }

  protected sendEvent(event: string, data?: string) {
    this.connection?.sendWithRetry(null, {
      type: event,
      message: data || "",
      model: "event",
    });
  }

  public sendStopEvent() {
    this.sendEvent("stop");
  }

  public sendRestartEvent() {
    this.sendEvent("restart");
  }

  public sendMaskEvent(mask: Mask) {
    this.sendEvent("mask", JSON.stringify(mask.context));
  }

  public sendShareEvent(refer: string) {
    this.sendEvent("share", refer);
  }

  public preflightMask(mask: Mask) {
    this.mask = mask;
  }

  public presentMask() {
    if (this.mask) {
      this.sendMaskEvent(this.mask);
      this.mask = null;
    }
  }

  public setId(id: number): void {
    this.id = id;
  }

  public copyMessages(): Message[] {
    // deep copy: cannot use return [...this.data];
    return this.data.map((item) => {
      return {
        ...item,
      };
    });
  }

  public load(data: Message[]): void {
    this.data = data;
    this.idx = data.length - 1;
    this.triggerCallback();
  }

  public getLength(): number {
    return this.data.length;
  }

  public getIndex(): number {
    return this.idx;
  }

  public getMessage(idx: number): Message {
    if (idx < 0 || idx >= this.getLength()) {
      throw new Error("Index out of range");
    }
    return this.data[idx];
  }

  public setCallback(callback: ConversationCallback) {
    this.callback = callback;
  }

  public setModel(model?: string) {
    if (!model) return;
    this.model = model;
  }

  public getModel(): string {
    return this.model;
  }

  public isEmpty(): boolean {
    return this.getLength() === 0;
  }

  public toggle(dispatch: AppDispatch): void {
    dispatch(setMessages(this.copyMessages()));
    modelEvent.emit(this.getModel());
  }

  public triggerCallback() {
    if (!this.callback) return;
    const interval = setInterval(() => {
      const state =
        this.callback && this.callback(this.id, this.copyMessages());
      if (state) clearInterval(interval);
    }, 100);
  }

  public addMessage(message: Message): number {
    this.idx++;
    this.data.push(message);
    this.triggerCallback();
    return this.idx;
  }

  public setMessage(idx: number, message: Message) {
    this.data[idx] = message;
    this.triggerCallback();
  }

  public updateMessage(
    idx: number,
    message: string,
    keyword?: string,
    quota?: number,
    end?: boolean,
    plan?: boolean,
  ) {
    this.data[idx].content += message;
    if (keyword) this.data[idx].keyword = keyword;
    if (quota) this.data[idx].quota = quota;
    this.data[idx].end = end;
    this.data[idx].plan = plan;
    this.triggerCallback();
  }

  public useMessage(): (message: StreamMessage) => void {
    const cursor = this.addMessage({
      content: "",
      role: "assistant",
    });

    return (message: StreamMessage) => {
      this.updateMessage(
        cursor,
        message.message,
        message.keyword,
        message.quota,
        message.end,
        message.plan,
      );
      if (message.end) {
        this.end = true;
      }
    };
  }

  public getSegmentData(length: number): Message[] {
    return this.data.slice(this.data.length - length - 1, this.data.length - 1);
  }

  public send(t: any, props: ChatProps) {
    if (!this.connection) {
      this.connection = new Connection(this.id);
    }
    this.end = false;
    this.connection.setCallback(this.useMessage()); // hook
    this.connection.sendWithRetry(t, props);
  }

  public sendMessage(t: any, props: ChatProps): boolean {
    if (!this.end) return false;

    this.presentMask();
    this.addMessage({
      content: props.message,
      role: "user",
    });

    this.send(t, props);

    return true;
  }

  public sendMessageWithRaise(t: any, id: number, props: ChatProps): boolean {
    if (!this.end) return false;

    this.presentMask();
    this.addMessage({
      content: props.message,
      role: "user",
    });

    this.send(t, props);
    this.setId(id);

    return true;
  }
}
