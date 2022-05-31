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

import { Injectable, NgZone } from '@angular/core'
import { BehaviorSubject, Observable, Subject } from 'rxjs'
import { parseWithTypes } from 'src/json'
import { RecogniserEntities, TabEntities } from 'src/types/entity'
import { MessageType } from 'src/types/messages'
import { BrowserService } from '../browser.service'
import { SidebarCard } from './types'

@Injectable({
  providedIn: 'root'
})
export class SidebarDataService {
  private cardsBehaviorSubject: BehaviorSubject<Array<SidebarCard>> = new BehaviorSubject(
    new Array<SidebarCard>()
  )
  readonly cardsObservable: Observable<Array<SidebarCard>> =
    this.cardsBehaviorSubject.asObservable()

  get cards(): Array<SidebarCard> {
    return this.cardsBehaviorSubject.getValue()
  }
  setCards(cards: Array<SidebarCard>) {
    this.cardsBehaviorSubject.next(cards)
  }

  private focusedCardSubject: Subject<SidebarCard> = new Subject()
  readonly focusedCardObservable: Observable<SidebarCard> = this.focusedCardSubject.asObservable()

  private totalCountInfoSubject: Subject<number> = new Subject()
  readonly totalCountInfoObservable: Observable<number> = this.totalCountInfoSubject.asObservable()

  constructor(private browserService: BrowserService, private zone: NgZone) {
    this.browserService.addListener((msg: any) => {
      this.zone.run(() => {
        switch (msg.type as MessageType) {
          case 'sidebar_data_service_view_or_create_card':
            const sidebarCard = parseWithTypes(msg.body) as SidebarCard
            this.viewOrCreateCard(sidebarCard)
            break
          case 'sidebar_data_update_cards':
            this.updateCards(parseWithTypes(msg.body) as TabEntities)
            break
          case 'sidebar_data_total_count':
            this.totalCountInfoSubject.next(msg.body)
            break
          case 'sidebar_data_remove_cards':
            this.cards.length = 0
            break
        }
      })
    })
  }

  private viewOrCreateCard(clickedCard: SidebarCard): void {
    const cardExists = this.cards.some(card => card.entityID === clickedCard.entityID)

    if (!cardExists) {
      this.setCards(this.cards.concat([clickedCard]))
    }

    this.focusedCardSubject.next(clickedCard)
  }

  private updateCards(updatedEntities: TabEntities): void {
    const updatedEntitiesKeys = Object.keys(updatedEntities) as Array<keyof TabEntities>

    updatedEntitiesKeys.forEach(recogniser => {
      const recogniserEntities = updatedEntities[recogniser] as RecogniserEntities

      recogniserEntities.entities.forEach((entity, entityName) => {
        const cardToUpdate = this.cards.find(card => card.entityID === entityName)

        if (cardToUpdate) {
          cardToUpdate.entity.htmlTagIDs = entity.htmlTagIDs
        }
      })
    })

    this.cardsBehaviorSubject.next([...this.cards])
  }
}
