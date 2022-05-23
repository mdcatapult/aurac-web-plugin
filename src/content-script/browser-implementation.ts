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

import { IBrowser } from './IBrowser'
import { Message } from 'src/types/messages'

/**
 * BrowserImplementation provides implementation of functions in IBroswer interface
 */
export class BrowserImplementation implements IBrowser {
  constructor() {}

  addListener(callback: (msg: Message) => Promise<any> | undefined) {
    browser.runtime.onMessage.addListener((msg: any) => callback(msg as Message))
  }

  sendMessage(msg: Message): Promise<any> {
    return browser.runtime.sendMessage(msg)
  }

  getURL(url: string): string {
    return browser.runtime.getURL(url)
  }
}
