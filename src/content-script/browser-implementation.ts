import { IBrowser } from './IBrowser';
import { Message } from 'src/types/messages';

/**
 * BrowserImplementation provides implementation of functions in IBroswer interface
 */
export class BrowserImplementation implements IBrowser {

  constructor() { }

  addListener(callback: (msg: Message) => Promise<any> | undefined) {
    browser.runtime.onMessage.addListener((msg: any) => callback(msg as Message))
  }

  sendMessage(msg: Message): Promise<any> {
    return browser.runtime.sendMessage(msg)
  }

  getURL(url: string): string {
    return browser.runtime.getURL(url)
  }
}
