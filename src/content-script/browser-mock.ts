import { Message } from 'src/types'
import {IBrowser} from './IBrowser'

export class BrowserMock implements IBrowser {
  sendMessage(msg: Message): Promise<any> {
      return new Promise(() => {})
  }
  getURL(url: string): string {
    return ''
  }
}
