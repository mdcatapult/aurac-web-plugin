import { Component } from '@angular/core'
import { SidebarDataService } from '../sidebar-data.service'
import { SidebarCard } from '../types'
import { FormControl } from '@angular/forms'

@Component({
  selector: 'app-sidebar-card-list',
  templateUrl: './sidebar-card-list.component.html',
  styleUrls: ['./sidebar-card-list.component.scss']
})
export class SidebarCardListComponent {
  cards: Array<SidebarCard> = []
  focusedCard: SidebarCard = {} as SidebarCard
  totalHighlights?: number
  speciesControl = new FormControl()
  allSpecies = new Set<string>()
  filteredCards: SidebarCard[] = []

  constructor(private sidebarDataService: SidebarDataService) {
    this.sidebarDataService.cardsObservable.subscribe(cards => {
      this.cards = cards
      this.filteredCards = cards
    })
    this.sidebarDataService.focusedCardObservable.subscribe(card => {
      this.focusedCard = card
    })
    this.sidebarDataService.totalCountInfoObservable.subscribe(count => {
      this.totalHighlights = count
    })

    this.sidebarDataService.cardsObservable.subscribe(cards => {
      this.allSpecies = new Set<string>()
      cards.forEach(card => {
        ;(card.entity.speciesNames || []).forEach(species => {
          this.allSpecies.add(species)
        })
      })
    })

    this.speciesControl.valueChanges.subscribe(selectedSpecies => {
      this.filteredCards = this.cards.filter(card => {
        return Object.keys(card.entity.metadata).some(species => species === selectedSpecies)
      })
    })
  }
}
