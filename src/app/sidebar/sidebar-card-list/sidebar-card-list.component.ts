import { Component } from '@angular/core'
import { SidebarDataService } from '../sidebar-data.service'
import { SidebarCard } from '../types'

@Component({
  selector: 'app-sidebar-card-list',
  templateUrl: './sidebar-card-list.component.html',
  styleUrls: ['./sidebar-card-list.component.scss']
})
export class SidebarCardListComponent {
  cards: Array<SidebarCard> = []
  focusedCard: SidebarCard = {} as SidebarCard
  totalHighlights?: number
  error?: string

  constructor(private sidebarDataService: SidebarDataService) {
    this.sidebarDataService.cardsObservable.subscribe(cards => {
      this.cards = cards
    })
    this.sidebarDataService.focusedCardObservable.subscribe(card => {
      this.focusedCard = card
    })
    this.sidebarDataService.totalCountInfoObservable.subscribe(info => {
      console.log(info, 'info in sidebar card list')
      this.totalHighlights = info.totalCount
    })
  }
}
