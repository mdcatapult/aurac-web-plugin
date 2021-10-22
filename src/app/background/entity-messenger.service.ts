import { Injectable } from '@angular/core';
import { isNumber } from 'lodash';
import { BrowserService } from '../browser.service';
import { SidebarEntity } from '../sidebar/types';
import { EntitiesService } from './entities.service';

@Injectable({
  providedIn: 'root'
})
export class EntityMessengerService {
  entities: Array<SidebarEntity> = [
    {
      identifiers: [
        {
          type: "inchikey",
          value: "RDHQFKQIGNGIED-MRVPVSSYSA-N"
        }
      ],
      synonyms: [
        "Acetylcarnitine",
        "Acetyl-L-carnitine"
      ],
      occurrences: ["RDHQFKQIGNGIED-MRVPVSSYSA-N#0", "RDHQFKQIGNGIED-MRVPVSSYSA-N#1"],
    }
  ]

  constructor(private browserService: BrowserService, private entitiesService: EntitiesService) {
    this.entitiesService.changeStream$.subscribe(change => {
      console.log(change.result)
      this.browserService.sendMessageToTab(change.identifier as number, {type: 'content_script_highlight_entities', body: change.result})
    })
  }

  setSidebarEntities() {
    this.browserService.sendMessageToActiveTab('content_script_await_sidebar_readiness').then(() => {
      this.browserService.sendMessageToActiveTab({type: 'sidebar_component_set_entities', body: this.entities});
    });
  }
}
