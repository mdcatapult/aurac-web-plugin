import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { parseWithTypes } from 'src/json';
import { MessageType } from 'src/types/messages';
import { BrowserService } from '../browser.service';
import { SidebarCard } from './types';

@Injectable({
  providedIn: 'root'
})
export class SidebarDataService {

  private cardsBehaviorSubject: BehaviorSubject<Array<SidebarCard>> = new BehaviorSubject(new Array<SidebarCard>())
  readonly cardsObservable: Observable<Array<SidebarCard>> = this.cardsBehaviorSubject.asObservable()

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
        const highlightData = parseWithTypes(msg.body) as SidebarCard
        this.viewOrCreateCard(highlightData)
    }
  })}

  private viewOrCreateCard(card: SidebarCard): void {
    const cardExists = this.cards.some(entity => entity.entityID === card.entityID)
    if (!cardExists) {
      this.setCards(this.cards.concat([card]))
    }
  }

}
