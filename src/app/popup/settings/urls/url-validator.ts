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

import { AbstractControl } from '@angular/forms'
import { APIURLs } from 'src/types/settings'

export class UrlValidator {
  constructor() {}

  static validURLs(urls: APIURLs): boolean {
    // checks if values exists while implicitly checking correct keys exist from loaded JSON
    if (!urls.nerURL || !urls.unichemURL || !urls.compoundConverterURL) {
      return false
    }

    return Object.keys(urls).every(key => UrlValidator.isValidURL(urls[key as keyof APIURLs]))
  }

  static isValidURL(url: string): boolean {
    try {
      new URL(url)

      return true
    } catch (e) {
      // TODO: This is throwing with seemingly valid urls when we open the sidebar.
      // Are they temporarily empty? Investigate.
      return false
    }
  }

  static validator(control: AbstractControl): { [key: string]: string } | null {
    return UrlValidator.isValidURL(control.value) ? null : { 'invalid URL': control.value }
  }
}
