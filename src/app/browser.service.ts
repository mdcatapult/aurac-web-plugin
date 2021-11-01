import {Injectable} from '@angular/core';
import {defaultSettings, Message, MessageType, Settings, StringMessage} from '../types';
import {Logger} from './logger';
import Tab = browser.tabs.Tab;

@Injectable({
  providedIn: 'root'
})
export class BrowserService {

  constructor() { }

  private makeValidMessage(msg: Message | MessageType): Message {
    let message: Message = msg as Message
    if (!message.type) {
      message = {type: msg as MessageType}
    }
    return message;
  }

  sendMessage(msg: Message | MessageType): Promise<any> {
    return browser.runtime.sendMessage<Message>(this.makeValidMessage(msg))
      .catch((e: any) => Logger.error(`Failed to send ${msg}: ${e}`));
  }

  addListener(f: (msg: Partial<Message>) => void): void  {
    browser.runtime.onMessage.addListener(f);
  }

  getActiveTab(): Promise<Tab> {
    return browser.tabs.query({active: true, windowId: browser.windows.WINDOW_ID_CURRENT})
      .then(tabs => tabs[0]);
  }

  sendMessageToTab(tabId: number, msg: Message | MessageType): Promise<any> {
    return browser.tabs.sendMessage<Message>(tabId, this.makeValidMessage(msg));
  }

  sendMessageToActiveTab(msg: Message| MessageType): Promise<any> {
    return this.getActiveTab().then(tab => this.sendMessageToTab(tab.id!, msg));
  }

  save(obj: browser.storage.StorageObject): Promise<void> {
    return browser.storage.local.set(obj)
  }

  load(key: string): Promise<void | browser.storage.StorageObject> {
    return browser.storage.local.get(key).then(
      (thing) => Promise.resolve(thing),
      (err) => Logger.error(`error loading settings', ${JSON.stringify(err)}`),
    )
  }

  loadSettings(): Promise<Settings> {
    return browser.storage.local.get('settings').then(
      (settings) => Promise.resolve(settings?.settings || defaultSettings),
      (err) => Logger.error(`error loading settings', ${JSON.stringify(err)}`)
    ) as Promise<Settings>
  }

  saveEntityCache(urlToEntityMap: string): void {
    browser.storage.local.set({urlToEntityMap}).then(
      () => {},
      (err) => Logger.error(`error saving settings for URLEntityMap', ${err}`)
    )
  }

  // loadEntityCache(): Promise<EntityCache> {
  //   return browser.storage.local.get('urlToEntityMap').then(
  //     (storage) => {
  //       function reader(key: string, value: any) {
  //         if (typeof value === 'object' && value !== null) {
  //           if (value.dataType === 'Map') {
  //             return new Map(value.value);
  //           }
  //         }
  //         return value;
  //       }
  //       const entityCache = new Map(JSON.parse(storage?.urlToEntityMap! as string, reader))
  //       return Promise.resolve(entityCache)
  //     },
  //     (err) => Logger.error(`error loading urlToEntityMap', ${JSON.stringify(err)}`)
  //   ) as Promise<EntityCache>
  // }

  getURL(asset: string): string {
    return browser.runtime.getURL(asset);
  }
}

