import { Injectable } from '@angular/core'
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

  constructor(private browserService: BrowserService) {
    this.browserService.addListener((msg: any) => {
      switch (msg.type as MessageType) {
        case 'sidebar_data_service_view_or_create_card':
          const sidebarCard = parseWithTypes(msg.body) as SidebarCard
          this.viewOrCreateCard(sidebarCard)
      }
    })
  }

  private changeFocusedCard(newFocusedCard: SidebarCard): SidebarCard[] {
    return this.cards.map(card => {
      card.entityID === newFocusedCard.entityID ? (card.inFocus = true) : (card.inFocus = false)

      return card
    })
  }

  private unfocusAllCards(): SidebarCard[] {
    return this.cards.map(card => {
      card.inFocus = false

      return card
    })
  }

  private viewOrCreateCard(clickedCard: SidebarCard): void {
    // convert inspected highlight data into sidebar entity (check if it's already in the array etc.)
    // and manipulate the entities array to render the cards

    const cardExists = this.cards.some(card => card.entityID === clickedCard.entityID)
    if (cardExists) {
      this.setCards(this.changeFocusedCard(clickedCard))
    } else {
      clickedCard.inFocus = true
      this.setCards(this.unfocusAllCards().concat([clickedCard]))
    }
  }
}
