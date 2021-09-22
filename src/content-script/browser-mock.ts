import {IBrowser} from './IBrowser'

export class BrowserMock implements IBrowser {
  getURL(url: string): string {
    return ''
  }
}
