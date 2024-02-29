import { tokenField, websocketEndpoint } from "@/conf/bootstrap.ts";
import { getMemory } from "@/utils/memory.ts";

export const endpoint = `${websocketEndpoint}/generation/create`;

export type GenerationForm = {
  token: string;
  prompt: string;
  model: string;
};

export type GenerationSegmentResponse = {
  message: string;
  quota: number;
  end: boolean;
  error: string;
  hash: string;
};

export type MessageEvent = {
  message: string;
  quota: number;
};

export class GenerationManager {
  protected processing: boolean;
  protected connection: WebSocket | null;
  protected message: string;
  protected onProcessingChange?: (processing: boolean) => void;
  protected onMessage?: (message: MessageEvent) => void;
  protected onError?: (error: string) => void;
  protected onFinished?: (hash: string) => void;

  constructor() {
    this.processing = false;
    this.connection = null;
    this.message = "";
  }

  public setProcessingChangeHandler(
    handler: (processing: boolean) => void,
  ): void {
    this.onProcessingChange = handler;
  }

  public setMessageHandler(handler: (message: MessageEvent) => void): void {
    this.onMessage = handler;
  }

  public setErrorHandler(handler: (error: string) => void): void {
    this.onError = handler;
  }

  public setFinishedHandler(handler: (hash: string) => void): void {
    this.onFinished = handler;
  }

  public isProcessing(): boolean {
    return this.processing;
  }

  protected setProcessing(processing: boolean): boolean {
    this.processing = processing;
    if (!processing) {
      this.connection = null;
      this.message = "";
    }
    this.onProcessingChange?.(processing);
    return processing;
  }

  public getConnection(): WebSocket | null {
    return this.connection;
  }

  protected handleMessage(message: GenerationSegmentResponse): void {
    if (message.error && message.end) {
      this.onError?.(message.error);
      this.setProcessing(false);
      return;
    }

    this.message += message.message;
    this.onMessage?.({
      message: this.message,
      quota: message.quota,
    });

    if (message.end) {
      this.onFinished?.(message.hash);
      this.setProcessing(false);
    }
  }

  public generate(prompt: string, model: string) {
    this.setProcessing(true);
    const token = getMemory(tokenField) || "anonymous";
    if (token) {
      this.connection = new WebSocket(endpoint);
      this.connection.onopen = () => {
        this.connection?.send(
          JSON.stringify({ token, prompt, model } as GenerationForm),
        );
      };
      this.connection.onmessage = (event) => {
        this.handleMessage(JSON.parse(event.data) as GenerationSegmentResponse);
      };
      this.connection.onclose = () => {
        this.setProcessing(false);
      };
    }
  }

  public generateWithBlock(prompt: string, model: string): boolean {
    if (this.isProcessing()) {
      return false;
    }
    this.generate(prompt, model);
    return true;
  }
}

export const manager = new GenerationManager();
