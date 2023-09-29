import { tokenField, ws_api } from "../conf.ts";

export const endpoint = `${ws_api}/chat`;

export type StreamMessage = {
  keyword?: string;
  quota?: number;
  message: string;
  end: boolean;
};

export type ChatProps = {
  message: string;
  model: string;
  web?: boolean;
};

type StreamCallback = (message: StreamMessage) => void;

export class Connection {
  protected connection?: WebSocket;
  protected callback?: StreamCallback;
  public id: number;
  public state: boolean;

  public constructor(id: number, callback?: StreamCallback) {
    this.state = false;
    this.id = id;
    this.init();
    this.callback && this.setCallback(callback);
  }

  public init(): void {
    this.connection = new WebSocket(endpoint);
    this.state = false;
    this.connection.onopen = () => {
      this.state = true;
      this.send({
        token: localStorage.getItem(tokenField) || "anonymous",
        id: this.id,
      });
    };
    this.connection.onclose = () => {
      this.state = false;
      setTimeout(() => {
        console.debug(`[connection] reconnecting... (id: ${this.id})`);
        this.init();
      }, 3000);
    };
    this.connection.onmessage = (event) => {
      const message = JSON.parse(event.data);
      this.triggerCallback(message as StreamMessage);
    };
  }

  public send(data: Record<string, string | boolean | number>): boolean {
    if (!this.state || !this.connection) {
      console.debug("[connection] connection not ready, retrying in 500ms...");
      return false;
    }
    this.connection.send(JSON.stringify(data));
    return true;
  }

  public sendWithRetry(t: any, data: ChatProps): void {
    try {
      if (!this.send(data)) {
        setTimeout(() => {
          this.sendWithRetry(t, data);
        }, 500);
      }
    } catch {
      this.triggerCallback({
        message: t("request-failed"),
        end: true,
      });
    }
  }

  public close(): void {
    if (!this.connection) return;
    this.connection.close();
  }

  public setCallback(callback?: StreamCallback): void {
    this.callback = callback;
  }

  protected triggerCallback(message: StreamMessage): void {
    this.callback && this.callback(message);
  }

  public setId(id: number): void {
    this.id = id;
  }
}
