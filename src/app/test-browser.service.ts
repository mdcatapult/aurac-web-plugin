import { Injectable } from '@angular/core';
import {BrowserService} from './browser.service';
import {Message, MessageType} from '../types/messages';
import { Settings } from '../types/settings';
import Tab = browser.tabs.Tab;
import MessageSender = browser.runtime.MessageSender;

@Injectable({
  providedIn: 'root'
})
export class TestBrowserService extends BrowserService {
  loadSettings(): Promise<Settings> {
    return new Promise(() => {});
  }

  addListener(f: (msg: Partial<Message>, listener: MessageSender, sendResponse: (response: object) => {}) => void): void {}

  getActiveTab(): Promise<Tab> {
    return new Promise(() => {});
  }

  sendMessageToBackground(msg: Message | MessageType): Promise<any> {
    return Promise.resolve()
  }

  sendMessageToTab<T>(tabId: number, message: Message): Promise<void> {
    return new Promise(() => {});
  }

  sendMessageToActiveTab(msg: Message | MessageType): Promise<any> {
    return Promise.resolve();
  }

  getURL(thing: string): string {
    return ""
  }

  save(obj: browser.storage.StorageObject): Promise<void> {
    return Promise.resolve()
  }


  load(key: string): Promise<void | browser.storage.StorageObject> {
    return Promise.resolve()
  }

}
