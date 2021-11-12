import { DOCUMENT } from '@angular/common'
import { Component, Inject } from '@angular/core'
import { PageScrollService } from 'ngx-page-scroll-core'
import { Touchscreen } from 'puppeteer'
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

  constructor(private sidebarDataService: SidebarDataService) {
    this.sidebarDataService.cardsObservable.subscribe(cards => {
      this.cards = cards
    })
    this.sidebarDataService.focusedCardObservable.subscribe(card => {
      this.focusedCard = card
    })
  }
}
