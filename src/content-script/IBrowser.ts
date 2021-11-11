import { Message } from 'src/types/types';
import { SavedCard } from './types';

/**
 * IBrowser interface is used to implement or mock browser functions.
 */
export interface IBrowser{
  getURL(url: string): string
  sendMessage(msg: Message): Promise<any>
  getStoredCards(key: string): SavedCard[]
}
