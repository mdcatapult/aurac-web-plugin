import {Message} from 'src/types'
import {IBrowser} from './IBrowser'
import {SavedCard} from './types'

/**
 * BrowserMock provides mocked functions required by IBrowser interface
 */
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
