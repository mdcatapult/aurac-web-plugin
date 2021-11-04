import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { ConverterResult, Entity, XRef } from 'src/types';
import {SettingsService} from './settings.service'

@Injectable({
  providedIn: 'root'
})
export class XRefService {

  constructor(private client: HttpClient, private settingsService: SettingsService) { }

  get(entity: Entity): Promise<XRef[]> {
    
    const identifier = entity.identifiers!.get('resolvedEntity')! // TODO remove !
    const encodedEntity = encodeURIComponent(identifier);
    return this.client.get<ConverterResult>(`${this.settingsService.APIURLs.compoundConverterURL}/${encodedEntity}?from=SMILES&to=inchikey`).toPromise()
    .then(converterResult => {
      return converterResult ?
          this.client.post<XRef[]>(
            `${this.settingsService.APIURLs.unichemURL}/x-ref/${converterResult.output}`,
            this.getTrueKeys(this.settingsService.xRefSources)
          ).toPromise() : Promise.resolve([]);
      })
  }

  private getTrueKeys(v: { [_: string]: boolean }): string[] {
    return Object.keys(v).filter(k => v[k] === true);
  }


}
