import { tokenField, websocketEndpoint } from "@/conf";
import { getMemory } from "@/utils/memory.ts";
import { getErrorMessage } from "@/utils/base.ts";

export const endpoint = `${websocketEndpoint}/chat`;
export const maxRetry = 30; // 15s max websocket retry

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

    const trace = {
      message: data.message,
      endpoint: endpoint,
    };

    t &&
      this.triggerCallback({
        message: `
${t("request-failed")}
\`\`\`json
${JSON.stringify(trace, null, 2)}
\`\`\`
          `,
        end: true,
      });
  }

  public close(): void {
    if (!this.connection) return;
    this.connection.close();
  }

  public setCallback(callback?: StreamCallback): void {
    this.callback = callback;
  }

  protected triggerCallback(message: StreamMessage): void {
    if (this.id === -1 && message.conversation) {
      this.setId(message.conversation);
    }
    this.callback && this.callback(message);
  }

  public setId(id: number): void {
    this.id = id;
  }
}
