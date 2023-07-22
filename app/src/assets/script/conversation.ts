import {nextTick, reactive, ref} from "vue";
import type { Ref } from "vue";
import axios from "axios";

type Message = {
  content: string;
  role: string;
  time: string;
  stamp: number;
}

export class Conversation {
  id: number;
  messages: Message[];
  len: Ref<number>;
  state: Ref<boolean>;
  refresh: () => void;

  public constructor(id: number, refresh: () => void) {
    this.id = id;
    this.messages = reactive([]);
    this.state = ref(false);
    this.len = ref(0);
    this.refresh = refresh;
  }

  public async send(content: string): Promise<void> {
    this.state.value = true;
    this.addMessageFromUser(content);
    try {
      const res = await axios.post("https://api.fystart.cn/gpt", {
        "id": this.id,
        "message": content,
      }, {
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      if (res.data.status === true) {
        this.addMessageFromAI(res.data.message);
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
    })
    nextTick(() => {
      this.refresh();
    }).then(r => 0);
  }

  public addMessageFromAI(content: string): void {
    this.addMessage({
      content: "",
      role: "bot",
      time: new Date().toLocaleTimeString(),
      stamp: new Date().getTime(),
    })
    this.typingEffect(this.len.value - 1, content);
  }

  public typingEffect(index: number, content: string): void {
    let cursor = 0;
    const interval = setInterval(() => {
      this.messages[index].content = content.substring(0, cursor);
      cursor++;
      this.refresh();
      if (cursor > content.length) {
        this.state.value = false;
        clearInterval(interval);
      }
    }, 35);
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
