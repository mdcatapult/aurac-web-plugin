import { Injectable } from '@angular/core';
import {Message} from '../types';
import {LogService} from './popup/log.service';

@Injectable({
  providedIn: 'root'
})
export class BrowserService {

  constructor(private log: LogService) { }
  loadSettings(): Promise<any> {
    return browser.runtime.sendMessage<Message>({type: 'load-settings'})
      .catch((e: any) => this.log.Error(`Couldn't send load-settings message to background page: ${e}`));
  }
}
