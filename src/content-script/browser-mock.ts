import { Message } from 'src/types'
import {IBrowser} from './IBrowser'
import { SavedCard } from './types'

export class BrowserMock implements IBrowser {

  getStoredCards(key: string): SavedCard[] {
      return []
  }

  sendMessage(msg: Message): Promise<any> {
      return new Promise(() => {})
  }
  getURL(url: string): string {
    return ''
  }
}
