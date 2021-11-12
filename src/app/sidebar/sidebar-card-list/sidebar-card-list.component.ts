import { DOCUMENT } from '@angular/common'
import { Component, Inject } from '@angular/core'
import { PageScrollService } from 'ngx-page-scroll-core'
import { SidebarDataService } from '../sidebar-data.service'
import { SidebarCard } from '../types'

@Component({
  selector: 'app-sidebar-card-list',
  templateUrl: './sidebar-card-list.component.html',
  styleUrls: ['./sidebar-card-list.component.scss']
})
export class SidebarCardListComponent {
  cards: Array<SidebarCard> = []

  constructor(
    private sidebarDataService: SidebarDataService,
    private pageScrollService: PageScrollService,
    @Inject(DOCUMENT) private document: any
  ) {
    this.sidebarDataService.cardsObservable.subscribe(cards => {
      this.cards = cards
      this.cards.map(card => card.inFocus && this.scrollToCard(card))
    })
  }

  private scrollToCard(card: SidebarCard) {
    // This must be on a timeout to give the child cards some time
    // to render. Running this in the cards themselves i.e. in ngOnInit
    // only works for new cards but not for existing cards (don't know why).
    setTimeout(() => {
      this.pageScrollService.scroll({
        document: this.document,
        scrollTarget: `#${card.entityID}`
      })
    }, 100)
  }
}
