import {Message} from 'src/types/messages'
import {IBrowser} from './IBrowser'

/**
 * BrowserMock provides mocked functions required by IBrowser interface
 */
export class BrowserMock implements IBrowser {

  sendMessage(msg: Message): Promise<any> {
      return new Promise(() => {})
  }
  getURL(url: string): string {
    return ''
  }
  addListener(callback: (msg: Message) => Promise<any> | undefined) {
  }
}
