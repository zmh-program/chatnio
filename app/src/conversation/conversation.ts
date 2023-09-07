import { AuthenticatedProps, Connection, StreamMessage } from "./connection.ts";
import { Message } from "./types.ts";
import { AnonymousProps, requestAnonymous } from "./anonymous.ts";

type ConversationCallback = (idx: number, message: Message[]) => void;
export type SendMessageProps = {
  message: string;
  web?: boolean;
  gpt4?: boolean;
};

export class Conversation {
  protected connection?: Connection;
  protected callback?: ConversationCallback;
  protected idx: number;
  public id: number;
  public data: Message[];
  public end: boolean;

  public constructor(id: number, callback?: ConversationCallback) {
    if (callback) this.setCallback(callback);
    this.data = [];
    this.idx = -1;
    this.id = id;
    this.end = true;
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

  public triggerCallback() {
    this.callback && this.callback(this.id, this.copyMessages());
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

  public updateMessage(idx: number, message: string, keyword?: string, quota?: number) {
    this.data[idx].content += message;
    if (keyword) this.data[idx].keyword = keyword;
    if (quota) this.data[idx].quota = quota;
    this.triggerCallback();
  }

  public useMessage(): (message: StreamMessage) => void {
    const cursor = this.addMessage({
      content: "",
      role: "assistant",
    });

    return (message: StreamMessage) => {
      this.updateMessage(cursor, message.message, message.keyword, message.quota);
      if (message.end) {
        this.end = true;
      }
    };
  }

  public sendAnonymous(t: any, props: AnonymousProps): void {
    this.end = false;
    requestAnonymous(t, props).then((response) => {
      this.addMessage({
        content: response.message,
        role: "assistant",
        keyword: response.keyword,
      });
      this.end = true;
    });
  }

  public sendAuthenticated(t: any, props: AuthenticatedProps) {
    if (!this.connection) {
      this.connection = new Connection(this.id);
    }
    this.end = false;
    this.connection.setCallback(this.useMessage()); // hook
    this.connection.sendWithRetry(t, props);
  }

  public sendMessage(t: any, auth: boolean, props: SendMessageProps): boolean {
    if (!this.end) return false;
    this.addMessage({
      content: props.message,
      role: "user",
    });

    auth
      ? this.sendAuthenticated(t, props as AuthenticatedProps)
      : this.sendAnonymous(t, props as AnonymousProps);

    return true;
  }
}
