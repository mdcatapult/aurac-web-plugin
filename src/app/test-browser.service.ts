import { Injectable } from '@angular/core';
import {BrowserService} from './browser.service';
import {Message, DictionaryURLs, StringMessage, Settings} from '../types';
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

  saveSettings(settings: Settings): void {}

}
