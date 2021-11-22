import { DOCUMENT } from '@angular/common'
import { Component, Inject, Input, OnChanges, OnInit, SimpleChange, SimpleChanges } from '@angular/core'
import { PageScrollService } from 'ngx-page-scroll-core'
import { BrowserService } from 'src/app/browser.service'
import { Link } from '../links'
import { LinksService } from '../links.service'
import { SidebarDataService } from '../sidebar-data.service'
import { Identifier, SidebarCard } from '../types'

@Component({
  selector: 'app-sidebar-card',
  templateUrl: './sidebar-card.component.html',
  styleUrls: ['./sidebar-card.component.scss']
})
export class SidebarCardComponent implements OnInit, OnChanges {
  @Input() card: SidebarCard = {} as SidebarCard
  @Input() inFocus: boolean = false
  @Input() nOccurrences: number = 0

  synonyms: string[] = []
  links: Link[] = []
  identifiers: Identifier[] = []
  title: string = ''
  scrollIndex: number = 0

  ngOnInit() {

    this.title = this.card.clickedSynonymName

    
    if (this.inFocus) {
      this.scrollToMe(100)
    }
  }
  
  ngOnChanges() {
    this.synonyms = Array.from(this.card.entity.synonymToXPaths.keys())
  
    this.links = this.linksService.getLinks(this.card)
  
    if (this.card.entity.identifierSourceToID) {
      const identifiers = Array.from(this.card.entity.identifierSourceToID.entries()).map(
        ([type, value]) => {
          return { type, value }
        }
      )
      this.identifiers = this.filterIdentifiers(identifiers)
    }
    
    if (this.inFocus) {
      this.scrollToMe()
    }
  }

  constructor(
    private browserService: BrowserService,
    private sidebarDataService: SidebarDataService,
    private linksService: LinksService,
    private pageScrollService: PageScrollService,
    @Inject(DOCUMENT) private document: any
  ) {}

  private scrollToMe(delayMs?: number) {
    // This still requires a timeout in order to work in ngOnInit.
    const doScroll = () => {
      this.pageScrollService.scroll({
        document: this.document,
        scrollTarget: `#${this.card.entityID}`
      })
    }

    if (delayMs) {
      setTimeout(doScroll, delayMs)
    } else {
      doScroll()
    }
  }

  filterIdentifiers(arr: Identifier[]): Identifier[] {
    return arr.filter(v => v.value)
  }

  arrowClicked(direction: 'left' | 'right'): void {
    this.scrollIndex = direction === 'left' ? this.scrollIndex - 1 : this.scrollIndex + 1
    const htmlTagIDs = this.card.entity.htmlTagIDs!

    const i = this.scrollIndex
    const n = htmlTagIDs.length

    // This modulo operation means the scroll index with circle back to zero.
    this.scrollIndex = ((i % n) + n) % n

    this.browserService.sendMessageToActiveTab({
      type: 'content_script_scroll_to_highlight',
      body: htmlTagIDs[this.scrollIndex]
    })
  }

  remove() {
    this.sidebarDataService.setCards(
      this.sidebarDataService.cards.filter(entity => entity.entityID !== this.card.entityID)
    )
  }
}
