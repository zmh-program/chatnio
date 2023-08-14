import {nextTick, reactive, ref} from "vue";
import type { Ref } from "vue";
import axios from "axios";
import { auth, token } from "./auth";
import { ws_api } from "./conf";
import { gpt4 } from "./shared";

export type Message = {
  content: string;
  role: string;
  time: string;
  stamp: number;
  keyword?: string;
  gpt4?: boolean;
}

type StreamMessage = {
  keyword?: string;
  message: string;
  end: boolean;
}

export class Connection {
  protected connection: WebSocket | undefined;
  protected callback?: (message: StreamMessage) => void;
  public id: number;
  public state: boolean;

  public constructor(id: number) {
    this.state = false;
    this.id = id;
    this.init();
  }

  public init(): void {
    this.connection = new WebSocket(ws_api + "/chat");
    this.state = false;
    this.connection.onopen = () => {
      this.state = true;
      this.send({
        token: token.value,
        id: this.id,
      })
    }
    this.connection.onclose = () => {
      this.state = false;
      setTimeout(() => {
        this.init();
      }, 3000);
    }
    this.connection.onmessage = (event) => {
      const message = JSON.parse(event.data);
      this.callback && this.callback(message as StreamMessage);
    }
  }

  public send(content: Record<string, any>): boolean {
    if (!this.state || !this.connection) {
      console.debug("Connection not ready");
      return false;
    }
    this.connection.send(JSON.stringify(content));
    return true;
  }

  public close(): void {
    if (!this.connection) return;
    this.connection.close();
  }

  public setCallback(callback: (message: StreamMessage) => void): void {
    this.callback = callback;
  }
}
export class Conversation {
  id: number;
  title: Ref<string>;
  messages: Message[];
  len: Ref<number>;
  state: Ref<boolean>;
  refresh?: () => void;
  connection: Connection | undefined;

  public constructor(id: number, refresh?: () => void) {
    this.id = id;
    this.messages = reactive([]);
    this.state = ref(false);
    this.len = ref(0);
    this.refresh = refresh;
    this.title = ref("new chat");
    if (auth.value) this.connection = new Connection(id);
  }

  public setRefresh(refresh: () => void): void {
    this.refresh = refresh;
  }

  public setTitle(title: string): void {
    this.title.value = title;
  }

  public notReady(): boolean {
    return Boolean(auth.value && !this.connection?.state);
  }

  public setMessages(messages: Message[]): void {
    this.messages = reactive(messages);
    this.len = ref(messages.length);
  }

  public async send(content: string): Promise<void> {
    if (this.notReady()) {
      const apply = () => {
        if (!this.notReady()) return this.send(content);
        setTimeout(apply, 100);
      };
      return apply();
    }
    return await (auth.value ? this.sendAuthenticated(content) : this.sendAnonymous(content));
  }

  public async sendAuthenticated(content: string): Promise<void> {
    this.state.value = true;
    this.addMessageFromUser(content);
    let message = ref(""), end = ref(false), keyword = ref("");
    this.connection?.setCallback((res: StreamMessage) => {
      message.value += res.message;
      res.keyword && (keyword.value = res.keyword);
      end.value = res.end;
    })
    const status = this.connection?.send({
      message: content,
    });
    if (status) {
      this.addDynamicMessageFromAI(message, keyword, end);
    } else {
      this.addMessageFromAI("网络错误，请稍后再试");
    }
  }

  public async sendAnonymous(content: string): Promise<void> {
    this.state.value = true;
    this.addMessageFromUser(content);
    try {
      const res = await axios.post("/anonymous", {
        "message": content,
      });
      if (res.data.status === true) {
        this.addMessageFromAI(res.data.message, res.data.keyword);
      }
    } catch (e) {
      console.debug(e);
      this.addMessageFromAI("网络错误，请稍后再试");
    }
  }

  public addMessage(message: Message): void {
    this.messages.push(message);
    this.len.value++;
  }

  public addMessageFromUser(content: string): void {
    this.addMessage({
      content: content,
      role: "user",
      time: new Date().toLocaleTimeString(),
      stamp: new Date().getTime(),
      gpt4: gpt4.value,
    })
    nextTick(() => {
      this.refresh && this.refresh();
    }).then(r => 0);
  }

  public addMessageFromAI(content: string, keyword?: string): void {
    this.addMessage({
      content: "",
      keyword: keyword ? keyword : "",
      role: "bot",
      time: new Date().toLocaleTimeString(),
      stamp: new Date().getTime(),
      gpt4: gpt4.value,
    })
    this.typingEffect(this.len.value - 1, content);
  }

  public addDynamicMessageFromAI(content: Ref<string>, keyword: Ref<string>, end: Ref<boolean>): void {
    this.addMessage({
      content: "",
      role: "bot",
      keyword: keyword.value || "",
      time: new Date().toLocaleTimeString(),
      stamp: new Date().getTime(),
      gpt4: gpt4.value,
    })
    this.dynamicTypingEffect(this.len.value - 1, content, keyword, end);
  }

  public typingEffect(index: number, content: string): void {
    let cursor = 0;
    const interval = setInterval(() => {
      this.messages[index].content = content.substring(0, cursor);
      cursor++;
      this.refresh && this.refresh();
      if (cursor > content.length) {
        this.state.value = false;
        clearInterval(interval);
      }
    }, 20);
  }

  public dynamicTypingEffect(index: number, content: Ref<string>, keyword: Ref<string>, end: Ref<boolean>): void {
    let cursor = 0;
    const interval = setInterval(() => {
      if (keyword.value && keyword.value !== "image") this.messages[index].keyword = keyword.value;
      if (end.value && cursor >= content.value.length) {
        this.messages[index].content = content.value;
        this.state.value = false;
        clearInterval(interval);
        return;
      }
      if (cursor >= content.value.length) return;
      cursor++;
      if (keyword.value === "image") {
        cursor = content.value.length;
      }
      this.messages[index].content = content.value.substring(0, cursor);
      this.refresh && this.refresh();
    }, 20);
  }

  public getTitle(): Ref<string> {
    return this.title;
  }

  public getMessages(): Message[] {
    return this.messages;
  }

  public getMessagesByRole(role: string): Message[] {
    return this.messages.filter(message => message.role === role);
  }

  public getLength(): Ref<number> {
    return this.len;
  }

  public getState(): Ref<boolean> {
    return this.state;
  }
}
