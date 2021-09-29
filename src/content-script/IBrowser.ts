import { Message } from "src/types";
import { SavedCard } from "./types";

export interface IBrowser{
  getURL(url: string): string
  sendMessage(msg: Message): Promise<any>
  getStoredCards(key: string): SavedCard[]
}
