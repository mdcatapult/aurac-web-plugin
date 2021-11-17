import { Injectable, NgZone } from '@angular/core'
import { BehaviorSubject, Observable, Subject } from 'rxjs'
import { parseWithTypes } from 'src/json'
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

  constructor(private browserService: BrowserService, private zone: NgZone) {
    this.browserService.addListener((msg: any) => {
      this.zone.run(() => {
        switch (msg.type as MessageType) {
          case 'sidebar_data_service_view_or_create_card':
            const sidebarCard = parseWithTypes(msg.body) as SidebarCard
            this.viewOrCreateCard(sidebarCard)
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
}
