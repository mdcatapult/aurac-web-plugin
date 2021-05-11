import { Injectable } from '@angular/core';
import {BrowserService} from './browser.service';
import {Message, DictionaryURLs, StringMessage} from '../types';
import Tab = browser.tabs.Tab;

@Injectable({
  providedIn: 'root'
})
export class TestBrowserService extends BrowserService {
  loadSettings(): Promise<any> {
    return new Promise(() => {});
  }

  addListener(f: (message: Partial<Message>) => (Promise<DictionaryURLs> | undefined)): void {}

  getActiveTab(): Promise<Tab> {
    return new Promise(() => {});
  }

  sendMessageToTab<T>(tabId: number, message: Message): Promise<void | StringMessage> {
    return new Promise(() => {});
  }
}
