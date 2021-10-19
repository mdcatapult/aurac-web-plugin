import {Injectable} from '@angular/core';
import {defaultSettings, LeadmineMessage, LeadminerEntity, LeadmineResult, Message, MessageType, Settings, StringMessage} from '../types';
import {LogService} from './popup/log.service';
import Tab = browser.tabs.Tab;
import {EntityCache} from '../types';

@Injectable({
  providedIn: 'root'
})
export class BrowserService {

  constructor(private log: LogService) { }

  private makeValidMessage(msg: Message | MessageType): Message {
    let message: Message = msg as Message
    if (!message.type) {
      message = {type: msg as MessageType}
    }
    return message;
  }

  sendMessage(msg: Message | MessageType): Promise<any> {
    return browser.runtime.sendMessage<Message>(this.makeValidMessage(msg))
      .catch((e: any) => this.log.Error(`Failed to send ${msg}: ${e}`));
  }

  addListener(f: (msg: Partial<Message>) => void): void  {
    browser.runtime.onMessage.addListener(f);
  }

  getActiveTab(): Promise<Tab> {
    return browser.tabs.query({active: true, windowId: browser.windows.WINDOW_ID_CURRENT})
      .then(tabs => tabs[0]);
  }

  sendMessageToTab(tabId: number, msg: Message | MessageType): Promise<any> {
    return browser.tabs.sendMessage<Message, StringMessage>(tabId, this.makeValidMessage(msg));
  }

  sendMessageToActiveTab(msg: Message| MessageType): Promise<any> {
    return this.getActiveTab().then(tab => this.sendMessageToTab(tab.id!, msg));
  }

  saveSettings(settings: Settings): void {
    browser.storage.local.set({settings}).then(
      () => {},
      (err) => this.log.Log(`error saving settings', ${err}`)
    )
  }

  loadSettings(): Promise<Settings> {
    return browser.storage.local.get('settings').then(
      (settings) => Promise.resolve(settings?.settings || defaultSettings),
      (err) => this.log.Log(`error loading settings', ${JSON.stringify(err)}`)
    ) as Promise<Settings>
  }

  saveEntityCache(urlToEntityMap: string): void {
    browser.storage.local.set({urlToEntityMap}).then(
      () => {},
      (err) => this.log.Log(`error saving settings for URLEntityMap', ${err}`)
    )
  }

  loadEntityCache(): Promise<EntityCache> {
    return browser.storage.local.get('urlToEntityMap').then(
      (storage) => {
        function reader(key: string, value: any) {
          if (typeof value === 'object' && value !== null) {
            if (value.dataType === 'Map') {
              return new Map(value.value);
            }
          }
          return value;
        }
        const entityCache = new Map(JSON.parse(storage?.urlToEntityMap! as string, reader))
        return Promise.resolve(entityCache)
      },
      (err) => this.log.Log(`error loading urlToEntityMap', ${JSON.stringify(err)}`)
    ) as Promise<EntityCache>
  }

  getURL(asset: string): string {
    return browser.runtime.getURL(asset);
  }
}

