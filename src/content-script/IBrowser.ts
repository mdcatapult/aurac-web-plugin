import { Message } from "src/types";

export interface IBrowser{
  getURL(url: string): string
  sendMessage(msg: Message): Promise<any>
}
