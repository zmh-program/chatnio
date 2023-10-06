import { Conversation } from "./conversation";
import { ConversationMapper, Message } from "./types.ts";
import { loadConversation } from "./history.ts";
import {
  addHistory,
  removeHistory,
  setCurrent,
  setMessages,
} from "../store/chat.ts";
import { useShared } from "../utils.ts";
import { ChatProps } from "./connection.ts";
import { supportModelConvertor } from "../conf.ts";
import { AppDispatch } from "../store";

export class Manager {
  conversations: Record<number, Conversation>;
  current: number;
  dispatch?: AppDispatch;

  public constructor() {
    this.conversations = {};
    this.conversations[-1] = this.createConversation(-1);
    this.current = -1;
  }

  public setDispatch(dispatch: AppDispatch): void {
    this.dispatch = dispatch;
  }

  public callback(idx: number, message: Message[]): void {
    console.debug(
      `[manager] conversation receive message (id: ${idx}, length: ${message.length})`,
    );
    if (idx === this.current) this.dispatch?.(setMessages(message));
  }

  public getCurrent(): number {
    return this.current;
  }

  public getConversations(): ConversationMapper {
    return this.conversations;
  }

  public createConversation(id: number): Conversation {
    console.debug(`[manager] create conversation instance (id: ${id})`);
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

  public async toggle(dispatch: AppDispatch, id: number): Promise<void> {
    if (!this.conversations[id]) await this.add(id);
    this.current = id;
    dispatch(setCurrent(id));
    dispatch(setMessages(this.get(id)!.copyMessages()));
  }

  public async delete(dispatch: AppDispatch, id: number): Promise<void> {
    if (this.getCurrent() === id) await this.toggle(dispatch, -1);
    dispatch(removeHistory(id));
    if (this.conversations[id]) delete this.conversations[id];
  }

  public async send(t: any, auth: boolean, props: ChatProps): Promise<boolean> {
    props.model = supportModelConvertor[props.model.trim()];
    const id = this.getCurrent();
    if (!this.conversations[id]) return false;
    console.debug(
      `[chat] trigger send event: ${props.message} (type: ${
        auth ? "user" : "anonymous"
      }, id: ${id})`,
    );
    if (id === -1 && auth) {
      // check for raise conversation
      console.debug(
        `[manager] raise new conversation (name: ${props.message})`,
      );
      const { hook, useHook } = useShared<number>();
      this.dispatch?.(
        addHistory({
          message: props.message,
          hook,
        }),
      );
      const target = await useHook();
      this.conversations[target] = this.conversations[-1];
      delete this.conversations[-1]; // fix pointer
      this.conversations[-1] = this.createConversation(-1);
      this.current = target;
      return this.get(target)!.sendMessageWithRaise(t, target, props);
    }
    const conversation = this.get(id);
    if (!conversation) return false;
    return conversation.sendMessage(t, props);
  }

  public get(id: number): Conversation | undefined {
    if (!this.conversations[id]) return undefined;
    return this.conversations[id];
  }
}

export const manager = new Manager();
