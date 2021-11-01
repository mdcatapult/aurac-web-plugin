import { Injectable } from '@angular/core';
import {BrowserService} from './browser.service';
import {Message, StringMessage, Settings, MessageType} from '../types';
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

  sendMessageToTab<T>(tabId: number, message: Message): Promise<void | StringMessage> {
    return new Promise(() => {});
  }

  sendMessageToActiveTab(msg: Message | MessageType): Promise<any> {
    return Promise.resolve();
  }

  saveSettings(settings: Settings): void {}

  getURL(thing: string): string {
    return ""
  }

  sendMessage(msg: Message | MessageType): Promise<any> {
    return Promise.resolve()
  }

  save(obj: browser.storage.StorageObject): Promise<void> {
    return Promise.resolve()
  }


  load(key: string): Promise<void | browser.storage.StorageObject> {
    return Promise.resolve()
  }

  saveEntityCache(urlToEntityMap: string): void {}

  // loadEntityCache(): Promise<EntityCache> {
  //   return Promise.resolve(new Map())
  // }
}
