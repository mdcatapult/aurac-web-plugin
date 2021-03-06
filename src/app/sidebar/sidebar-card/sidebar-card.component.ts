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

import { DOCUMENT } from '@angular/common'
import { Component, Inject, Input, OnChanges, OnInit } from '@angular/core'
import { PageScrollService } from 'ngx-page-scroll-core'
import { BrowserService } from 'src/app/browser.service'
import { SidebarDataService } from '../sidebar-data.service'
import { Identifier, SidebarCard } from '../types'
import { Clipboard } from '@angular/cdk/clipboard'

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
    private pageScrollService: PageScrollService,
    private clipboard: Clipboard,
    @Inject(DOCUMENT) private document: any
  ) {}

  copyText(text: string) {
    this.clipboard.copy(text)
  }

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

    // This modulo operation means the scroll index will circle back to zero.
    this.scrollIndex = ((i % n) + n) % n

    this.browserService.sendMessageToBackground({
      type: 'entity_messenger_service_scroll_to_highlight',
      body: htmlTagIDs[this.scrollIndex]
    })
  }

  remove() {
    this.sidebarDataService.setCards(
      this.sidebarDataService.cards.filter(entity => entity.entityID !== this.card.entityID)
    )
  }

  openModal() {
    this.browserService.sendMessageToActiveTab({
      type: 'content_script_open_modal',
      body: this.card.entity
    })
  }

  hasSequence(): boolean {
    return (
      this.card.selectedSpecies && this.card.entity.metadata?.[this.card.selectedSpecies]?.sequence
    )
  }

  getSwissprotMetadata(property: string): string {
    return this.card.selectedSpecies && this.card.entity.metadata[this.card.selectedSpecies]
      ? this.card.entity.metadata[this.card.selectedSpecies][property]
      : ''
  }
}
