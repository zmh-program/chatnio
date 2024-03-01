import { tokenField, websocketEndpoint } from "@/conf/bootstrap.ts";
import { getMemory } from "@/utils/memory.ts";
import { getErrorMessage } from "@/utils/base.ts";
import { Mask } from "@/masks/types.ts";

export const endpoint = `${websocketEndpoint}/chat`;
export const maxRetry = 60; // 30s max websocket retry

export type StreamMessage = {
  conversation?: number;
  keyword?: string;
  quota?: number;
  message: string;
  end: boolean;
  plan?: boolean;
};

export type ChatProps = {
  type?: string;
  message: string;
  model: string;
  web?: boolean;
  context?: number;
  ignore_context?: boolean;

  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  top_k?: number;
  presence_penalty?: number;
  frequency_penalty?: number;
  repetition_penalty?: number;
};

type StreamCallback = (id: number, message: StreamMessage) => void;

export class Connection {
  protected connection?: WebSocket;
  protected callback?: StreamCallback;
  protected stack?: string;
  public id: number;
  public state: boolean;

  public constructor(id: number, callback?: StreamCallback) {
    this.state = false;
    this.id = id;
    this.callback && this.setCallback(callback);
  }

  public init(): void {
    this.connection = new WebSocket(endpoint);
    this.state = false;
    this.connection.onopen = () => {
      this.state = true;
      this.send({
        token: getMemory(tokenField) || "anonymous",
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

    this.connection.onclose = (event) => {
      this.stack = `websocket connection failed (code: ${event.code}, reason: ${event.reason}, endpoint: ${endpoint})`;
    };
  }

  public reconnect(): void {
    this.init();
  }

  public send(data: Record<string, string | boolean | number>): boolean {
    if (!this.state || !this.connection) {
      if (this.connection === undefined) this.init();
      console.debug("[connection] connection not ready, retrying in 500ms...");
      return false;
    }
    this.connection.send(JSON.stringify(data));
    return true;
  }

  public sendWithRetry(t: any, data: ChatProps, times?: number): void {
    try {
      if (!times || times < maxRetry) {
        if (!this.send(data)) {
          setTimeout(() => {
            this.sendWithRetry(t, data, (times ?? 0) + 1);
          }, 500);
        }

        return;
      }
    } catch (e) {
      console.warn(
        `[connection] failed to send message: ${getErrorMessage(e)}`,
      );
    }

    const trace =
      this.stack ||
      JSON.stringify(
        {
          message: data.message,
          endpoint: endpoint,
        },
        null,
        2,
      );

    t &&
      this.triggerCallback({
        message: `${t("request-failed")}\n\`\`\`json\n${trace}\n\`\`\`\n`,
        end: true,
      });
  }

  public sendEvent(t: any, event: string, data?: string) {
    this.sendWithRetry(t, {
      type: event,
      message: data || "",
      model: "event",
    });
  }

  public sendStopEvent(t: any) {
    this.sendEvent(t, "stop");
  }

  public sendRestartEvent(t: any) {
    this.sendEvent(t, "restart");
  }

  public sendMaskEvent(t: any, mask: Mask) {
    this.sendEvent(t, "mask", JSON.stringify(mask.context));
  }

  public sendEditEvent(t: any, id: number, message: string) {
    this.sendEvent(t, "edit", `${id}:${message}`);
  }

  public sendRemoveEvent(t: any, id: number) {
    this.sendEvent(t, "remove", id.toString());
  }

  public sendShareEvent(t: any, refer: string) {
    this.sendEvent(t, "share", refer);
  }

  public close(): void {
    if (!this.connection) return;
    this.connection.close();
  }

  public setCallback(callback?: StreamCallback): void {
    this.callback = callback;
  }

  protected triggerCallback(message: StreamMessage): void {
    this.callback && this.callback(this.id, message);
  }

  public setId(id: number): void {
    this.id = id;
  }
}

export class ConnectionStack {
  protected connections: Connection[];
  protected callback?: StreamCallback;

  public constructor(callback?: StreamCallback) {
    this.connections = [];
    this.callback = callback;
  }

  public getConnection(id: number): Connection | undefined {
    return this.connections.find((conn) => conn.id === id);
  }

  public addConnection(id: number): Connection {
    const conn = new Connection(id, this.triggerCallback.bind(this));
    this.connections.push(conn);
    return conn;
  }

  public setCallback(callback?: StreamCallback): void {
    this.callback = callback;
  }

  public sendEvent(id: number, t: any, event: string, data?: string) {
    const conn = this.getConnection(id);
    conn && conn.sendEvent(t, event, data);
  }

  public sendStopEvent(id: number, t: any) {
    const conn = this.getConnection(id);
    conn && conn.sendStopEvent(t);
  }

  public sendRestartEvent(id: number, t: any) {
    const conn = this.getConnection(id);
    conn && conn.sendRestartEvent(t);
  }

  public sendMaskEvent(id: number, t: any, mask: Mask) {
    const conn = this.getConnection(id);
    conn && conn.sendMaskEvent(t, mask);
  }

  public sendEditEvent(id: number, t: any, message: string) {
    const conn = this.getConnection(id);
    conn && conn.sendEditEvent(t, id, message);
  }

  public sendRemoveEvent(id: number, t: any, messageId: number) {
    const conn = this.getConnection(id);
    conn && conn.sendRemoveEvent(t, messageId);
  }

  public sendShareEvent(id: number, t: any, refer: string) {
    const conn = this.getConnection(id);
    conn && conn.sendShareEvent(t, refer);
  }

  public close(id: number): void {
    const conn = this.getConnection(id);
    conn && conn.close();
  }

  public closeAll(): void {
    this.connections.forEach((conn) => conn.close());
  }

  public reconnect(id: number): void {
    const conn = this.getConnection(id);
    conn && conn.reconnect();
  }

  public reconnectAll(): void {
    this.connections.forEach((conn) => conn.reconnect());
  }

  public triggerCallback(id: number, message: StreamMessage): void {
    this.callback && this.callback(id, message);
  }
}
