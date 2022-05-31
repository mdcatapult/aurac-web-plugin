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

import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { Entity, XRef } from 'src/types/entity'
import { SettingsService } from './settings.service'

export type ConverterResult = {
  input: string
  output: string
}

@Injectable({
  providedIn: 'root'
})
export class XRefService {
  constructor(private client: HttpClient, private settingsService: SettingsService) {}

  get(entity: Entity): Promise<XRef[]> {
    try {
      const entityGroup = entity.metadata['entityGroup']

      if (entityGroup != 'Chemical') {
        return Promise.resolve([])
      }

      const entityType = entity.metadata['RecognisingDict']['entityType']
      const identifier = entity.identifierSourceToID?.get('resolvedEntity')

      if (!identifier) {
        return Promise.resolve([])
      }

      let inchikeyPromise: Promise<string> = new Promise(resolve => resolve(identifier))

      switch (entityType) {
        case 'SMILES':
          inchikeyPromise = this.SMILEStoInchi(identifier).then(
            converterResult => converterResult.output
          )
          break
        case 'DictMol':
        case 'Mol':
          const inchiKeyRegex = /^[a-zA-Z]{14}-[a-zA-Z]{10}-[a-zA-Z]$/
          if (!identifier.match(inchiKeyRegex)) {
            inchikeyPromise = this.SMILEStoInchi(identifier).then(
              converterResult => converterResult.output
            )
          }
          break
      }

      return inchikeyPromise.then(inchikey => {
        const encodedInchiKey = encodeURIComponent(inchikey)
        const xRefURL = `${this.settingsService.APIURLs.unichemURL}/x-ref/${encodedInchiKey}`

        return this.client.post<XRef[]>(xRefURL, this.settingsService.getEnabledXrefs()).toPromise()
      })
    } catch (err) {
      console.info(`Could not get x-refs: ${err}`)

      return Promise.resolve([])
    }
  }

  private SMILEStoInchi(entity: string): Promise<ConverterResult> {
    const encodedEntity = encodeURIComponent(entity)
    const converterURL = `${this.settingsService.APIURLs.compoundConverterURL}?entity=${encodedEntity}&from=SMILES&to=inchikey`

    return this.client.get<ConverterResult>(converterURL).toPromise()
  }
}
