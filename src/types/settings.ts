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

import { environment } from '../environments/environment'
import { Recogniser } from './recognisers'
import { Species } from './species'

export type Preferences = {
  minEntityLength: number
  recogniser: Recogniser
  species: Species
}

export type XRefSources = Record<string, boolean>

export type Settings = {
  urls: APIURLs
  xRefSources: XRefSources
  preferences: Preferences
}

export type APIURLs = {
  nerURL: string
  compoundConverterURL: string
  unichemURL: string
  pdfConverterURL: string
}

const devAPIURLs: APIURLs = {
  nerURL: 'http://localhost:8080',
  unichemURL: 'http://localhost:8081',
  compoundConverterURL: 'http://localhost:8082/convert',
  pdfConverterURL: 'http://localhost:8000/html'
}

const productionAPIURLs: APIURLs = {
  nerURL: 'https://ner-api.wopr.inf.mdc',
  compoundConverterURL: 'https://compound-converter.wopr.inf.mdc/convert',
  unichemURL: 'https://unichem-plus.wopr.inf.mdc',
  pdfConverterURL: 'https://pdf-js.wopr.inf.mdc/html'
}

export const defaultSettings: Settings = {
  urls: environment.production ? productionAPIURLs : devAPIURLs,
  xRefSources: {},
  preferences: {
    minEntityLength: 3,
    recogniser: 'leadmine-proteins',
    species: 'Homo sapiens'
  }
}
