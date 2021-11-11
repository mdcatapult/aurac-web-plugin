import { Message } from 'src/types/messages'

/**
 * IBrowser interface is used to implement or mock browser functions.
 */
export interface IBrowser {
  getURL(url: string): string
  sendMessage(msg: Message): Promise<any>
  addListener(callback: (msg: Message) => Promise<any> | undefined): void
}
