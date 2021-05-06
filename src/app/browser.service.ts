import { Injectable } from '@angular/core';
import {LeadmineMessage, Message, MessageType, Settings, StringMessage, XRefMessage} from '../types';
import {LogService} from './popup/log.service';
import Tab = browser.tabs.Tab;

@Injectable({
  providedIn: 'root'
})
export class BrowserService {

  constructor(private log: LogService) { }

  sendMessage(msg: MessageType, msgBody?: any): Promise<any> {
    return browser.runtime.sendMessage<Message>({type: msg, body: msgBody})
      .catch((e: any) => this.log.Error(`Failed to send ${msg}: ${e}`));
  }

  addListener(f: (message: Partial<Message>) => Promise<Settings> | undefined ): void  {
    browser.runtime.onMessage.addListener(f);
  }

  getActiveTab(): Promise<Tab> {
    return browser.tabs.query({active: true, windowId: browser.windows.WINDOW_ID_CURRENT})
      .then(tabs => tabs[0]);
  }

  sendMessageToTab(tabId: number, message: Message): Promise<void | StringMessage> {
    return browser.tabs.sendMessage<Message, StringMessage>(tabId, message);
  }
  sendMessageToActiveTab(msg: Message): Promise<void | StringMessage> {
    return this.getActiveTab().then(tab => this.sendMessageToTab(tab.id!, msg));
  }
}
