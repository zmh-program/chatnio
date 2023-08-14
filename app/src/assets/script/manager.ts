import {nextTick, reactive, ref, watch} from "vue";
import type { Ref } from "vue";
import {Conversation} from "./conversation";
import type { Message } from "./conversation";
import {loadConversation} from "./api";
import {auth} from "./auth";

function convert(message: { content: string, role: string }): Message {
  return {
    content: message.content,
    role: message.role,
    time: new Date().toLocaleTimeString(),
    stamp: new Date().getTime(),
  } as Message;
}

export class Manager {
  public current: Ref<number>;
  public title: Ref<string>;
  public state: Ref<boolean>;
  public length: Ref<number>;
  public messages: Message[];
  public refresh?: () => void;
  conversations: Record<number, Conversation>

  public constructor(refresh?: () => void) {
    this.refresh = refresh;
    this.conversations = {};
    this.current = ref(NaN);
    this.title = ref("new chat");
    this.state = ref(false);
    this.length = ref(0);
    this.messages = reactive([]);

    watch(auth, () => {
      this.init();
    })
  }

  public init(): void {
    this.conversations[-1] = new Conversation(-1, this.refresh);
    this.set(-1);
  }

  public setRefresh(refresh: () => void): void {
    this.refresh = refresh;
    for (const conversation in this.conversations) this.conversations[conversation].setRefresh(refresh);
  }

  protected refreshMessages(message: Message[]): void {
    this.messages = message;
  }

  protected refreshState(state: Ref<boolean>): void {
    this.state.value = state.value;
    watch(state, () => {
      this.state.value = this.conversations[this.current.value].getState().value;
    })
  }

  protected refreshLength(length: Ref<number>): void {
    this.length.value = length.value;
    watch(length, () => {
      this.length.value = this.conversations[this.current.value].getLength().value;
    })
  }

  protected refreshTitle(title: Ref<string>): void {
    this.title.value = title.value;
    watch(title, () => {
      this.title.value = this.conversations[this.current.value].getTitle().value;
    })
  }

  public set(id: number): void {
    if (this.current.value === id) return;
    this.current.value = id;
    if (!this.conversations[id]) this.conversations[id] = new Conversation(id, this.refresh);
    this.refreshState(this.conversations[id].getState());
    this.refreshLength(this.conversations[id].getLength());
    this.refreshTitle(this.conversations[id].getTitle());
    this.refreshMessages(this.conversations[id].getMessages());

    nextTick(() => {
      this.refresh && this.refresh();
    }).then();
  }

  public getState(): Ref<boolean> {
    return this.state;
  }

  public getLength(): Ref<number> {
    return this.length;
  }

  public getMessages(): Message[] {
    return this.messages;
  }

  public getConversations(): Record<number, Conversation> {
    return this.conversations;
  }

  public getTitle(): Ref<string> {
    return this.title;
  }

  public getCurrent(): Ref<number> {
    return this.current;
  }

  public async add(id: number): Promise<void> {
    if (this.conversations[id]) return;
    const instance = new Conversation(id, this.refresh);
    this.conversations[id] = instance;
    const res = await loadConversation(id);
    instance.setMessages(res.message?.map(convert) || []);
    instance.setTitle(res.name);
  }

  public async toggle(id: number): Promise<void> {
    if (this.current.value === id) return;
    if (!this.conversations[id]) await this.add(id);
    this.set(id);
  }

  public delete(id: number): void {
    if (this.current.value === id) this.set(-1);
    delete this.conversations[id];
  }

  public async send(content: string): Promise<void> {
    await this.conversations[this.current.value].send(content);
  }

  public get(id: number): Conversation {
    return this.conversations[id];
  }
}
