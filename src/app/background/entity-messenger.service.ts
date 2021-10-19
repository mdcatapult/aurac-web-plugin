import { Injectable } from '@angular/core';
import { ReadinessService } from '../readiness.service';
import { BrowserService } from '../browser.service';
import { SidebarEntity } from '../sidebar/types';
import { first } from 'rxjs/operators';

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

  constructor(private browserService: BrowserService, private readinessService: ReadinessService) {}

  setSidebarEntities() {
    console.log("setting sidebar entities")
    const send = () => this.browserService.sendMessageToActiveTab({type: 'sidebar_component_set_entities', body: this.entities})
    this.readinessService.sidebarIsReady ? send() : this.readinessService.sidebarIsReady$.pipe(first()).subscribe(send)
  }
}
