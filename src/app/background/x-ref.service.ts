import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConverterResult, Entity, XRef } from 'src/types/types';
import {SettingsService} from './settings.service'

@Injectable({
  providedIn: 'root'
})
export class XRefService {

  constructor(private client: HttpClient, private settingsService: SettingsService) { }

  get(entity: Entity): Promise<XRef[]> {
    const entityGroup = entity.metadata['entityGroup']

    if (entityGroup != 'Chemical') {
      return Promise.resolve([])
    }

    const entityType = entity.metadata['RecognisingDict']['entityType']
    const identifier = entity.identifierSourceToID?.get('resolvedEntity')

    if (!identifier) {
      return Promise.resolve([])
    }

    let inchikeyPromise: Promise<string> = new Promise(() => identifier)

    switch(entityType) {
      case 'SMILES':
      inchikeyPromise = this.SMILEStoInchi(identifier).then(converterResult => converterResult.output)
      break
      case 'DictMol':
      case 'Mol':
        const inchiKeyRegex = /^[a-zA-Z]{14}-[a-zA-Z]{10}-[a-zA-Z]$/;
        if (!identifier.match(inchiKeyRegex)) {
          inchikeyPromise = this.SMILEStoInchi(identifier).then(converterResult => converterResult.output)
        }
        break
    }

    return inchikeyPromise.then(inchikey => {
      const encodedInchiKey = encodeURIComponent(inchikey)
      const xRefURL = `${this.settingsService.APIURLs.unichemURL}/x-ref/${encodedInchiKey}`

      return this.client.post<XRef[]>(
        xRefURL,
        this.settingsService.getEnabledXrefs()
      ).toPromise()
    })
  }

  private SMILEStoInchi(entity: string): Promise<ConverterResult> {
    const encodedEntity = encodeURIComponent(entity)
    const converterURL = `${this.settingsService.APIURLs.compoundConverterURL}/${encodedEntity}?from=SMILES&to=inchikey`
    return this.client.get<ConverterResult>(converterURL).toPromise()
  }

}
