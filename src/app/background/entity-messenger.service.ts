import { Injectable } from '@angular/core';
import { BrowserService } from '../browser.service';
import { SidebarEntity } from '../sidebar/types';

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

  constructor(private browserService: BrowserService) {}

  setSidebarEntities() {
    this.browserService.sendMessageToActiveTab('content_script_await_sidebar_readiness').then(() => {
      this.browserService.sendMessageToActiveTab({type: 'sidebar_component_set_entities', body: this.entities});
    });
  }
}
