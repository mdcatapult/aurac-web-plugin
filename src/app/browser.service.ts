/*
 * Copyright 2022 Medicines Discovery Catapult
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Injectable } from '@angular/core'
import { Message, MessageType } from 'src/types/messages'
import Tab = browser.tabs.Tab
import MessageSender = browser.runtime.MessageSender

@Injectable({
  providedIn: 'root'
})
export class BrowserService {
  constructor() {}

  private makeValidMessage(msg: Message | MessageType): Message {
    let message: Message = msg as Message
    if (!message.type) {
      message = { type: msg as MessageType }
    }

    return message
  }

  sendMessageToBackground(msg: Message | MessageType): Promise<any> {
    return browser.runtime.sendMessage<Message>(this.makeValidMessage(msg))
  }

  addListener(
    f: (msg: Partial<Message>, listener: MessageSender, sendResponse: any) => void
  ): void {
    browser.runtime.onMessage.addListener(f)
  }

  getActiveTab(): Promise<Tab> {
    return browser.tabs
      .query({ active: true, windowId: browser.windows.WINDOW_ID_CURRENT })
      .then(tabs => tabs[0])
  }

  sendMessageToTab(tabId: number, msg: Message | MessageType): Promise<any> {
    return browser.tabs.sendMessage<Message>(tabId, this.makeValidMessage(msg))
  }

  sendMessageToActiveTab(msg: Message | MessageType): Promise<any> {
    return this.getActiveTab().then(tab => this.sendMessageToTab(tab.id!, msg))
  }

  save(obj: browser.storage.StorageObject): Promise<void> {
    return browser.storage.local.set(obj)
  }

  load(key: string): Promise<void | browser.storage.StorageObject> {
    return browser.storage.local.get(key)
  }

  getURL(asset: string): string {
    return browser.runtime.getURL(asset)
  }
}
