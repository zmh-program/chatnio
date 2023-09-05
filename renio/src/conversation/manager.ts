import {Conversation, SendMessageProps} from "./conversation";
import {ConversationMapper, Message} from "./types.ts";
import {loadConversation} from "./history.ts";
import {useSelector} from "react-redux";
import {removeHistory, selectGPT4, selectWeb, setCurrent, setMessages} from "../store/chat.ts";
import {selectAuthenticated} from "../store/auth.ts";

export class Manager {
  conversations: Record<number, Conversation>;
  current: number;

  public constructor() {
    this.conversations = {};
    this.conversations[-1] = this.createConversation(-1);
    this.current = -1;
  }

  public callback(idx: number, message: Message[]): void {
    console.debug(`[manager] conversation migrated (id: ${idx}, length: ${message.length})`);
  }

  public getCurrent(): number {
    return this.current;
  }

  public getConversations(): ConversationMapper {
    return this.conversations;
  }

  public createConversation(id: number): Conversation {
    console.debug(`[manager] create conversation instance (id: ${id})`);
    if (this.conversations[id]) return this.conversations[id];
    const _this = this;
    return new Conversation(id, function (idx: number, message: Message[]) {
      _this.callback(idx, message);
    });
  }

  public async add(id: number): Promise<void> {
    if (this.conversations[id]) return;
    const instance = this.createConversation(id);
    this.conversations[id] = instance;
    const res = await loadConversation(id);
    instance.load(res.message);
  }

  public async toggle(dispatch: any, id: number): Promise<void> {
    if (!this.conversations[id]) await this.add(id);
    this.current = id;
    dispatch(setCurrent(id));
    dispatch(setMessages(this.get(id)!.data));
  }

  public async delete(dispatch: any, id: number): Promise<void> {
    if (this.getCurrent() === id) await this.toggle(dispatch, -1);
    dispatch(removeHistory(id));
    if (this.conversations[id]) delete this.conversations[id];
  }

  public async send(auth: boolean, props: SendMessageProps): Promise<void> {
    const id = this.getCurrent();
    if (!this.conversations[id]) return;

    const conversation = this.get(id);
    if (!conversation) return;
    conversation.sendMessage(auth, props);
  }

  public get(id: number): Conversation | undefined {
    if (!this.conversations[id]) return undefined;
    return this.conversations[id];
  }
}

export const manager = new Manager();
