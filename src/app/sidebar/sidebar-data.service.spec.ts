import { TestBed } from '@angular/core/testing'
import { BrowserService } from '../browser.service'
import { TestBrowserService } from '../test-browser.service'

import { SidebarDataService } from './sidebar-data.service'
import { SidebarCard } from './types'

describe('SidebarDataService', () => {
  let service: SidebarDataService
  let cards: SidebarCard[] = []
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: BrowserService, useClass: TestBrowserService }]
    })
    service = TestBed.inject(SidebarDataService)

    cards = [
      {
        inFocus: true,
        clickedSynonymName: '1',
        clickedSynonymOccurrence: 1,
        clickedEntityOccurrence: 1,
        entityID: '1',
        entity: { synonymToXPaths: new Map() },
        recogniser: 'leadmine-proteins'
      },
      {
        inFocus: false,
        clickedSynonymName: '2',
        clickedSynonymOccurrence: 2,
        clickedEntityOccurrence: 2,
        entityID: '2',
        entity: { synonymToXPaths: new Map() },
        recogniser: 'leadmine-proteins'
      },
      {
        inFocus: false,
        clickedSynonymName: '3',
        clickedSynonymOccurrence: 3,
        clickedEntityOccurrence: 3,
        entityID: '3',
        entity: { synonymToXPaths: new Map() },
        recogniser: 'leadmine-proteins'
      },
      {
        inFocus: false,
        clickedSynonymName: '4',
        clickedSynonymOccurrence: 4,
        clickedEntityOccurrence: 4,
        entityID: '4',
        entity: { synonymToXPaths: new Map() },
        recogniser: 'leadmine-proteins'
      }
    ]

    service['cardsBehaviorSubject'].next(cards)
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  it('should return a list of cards with none in focus', () => {
    const unfocusedCards = service['unfocusAllCards']()
    unfocusedCards.map(card => expect(card.inFocus).toBeFalse())
  })

  it('should return a list of cards with the given card in focus', () => {
    const newFocusedCard: SidebarCard = {
      inFocus: true,
      clickedSynonymName: '4',
      clickedSynonymOccurrence: 4,
      clickedEntityOccurrence: 4,
      entityID: '4',
      entity: { synonymToXPaths: new Map() },
      recogniser: 'leadmine-proteins'
    }

    const newCards = service['changeFocusedCard'](newFocusedCard)
    newCards.map(card => {
      if (card.inFocus) {
        expect(card.entityID === newFocusedCard.entityID).toBeTrue()
      } else {
        expect(card.entityID === newFocusedCard.entityID).toBeFalse()
      }
    })
  })

  describe('viewOrCreateCard', () => {
    it('should add a new card when it is not already in the list and set it to be in focus', () => {
      const newCard: SidebarCard = {
        inFocus: false,
        clickedSynonymName: '5',
        clickedSynonymOccurrence: 5,
        clickedEntityOccurrence: 5,
        entityID: '5',
        entity: { synonymToXPaths: new Map() },
        recogniser: 'leadmine-proteins'
      }
      service['viewOrCreateCard'](newCard)
      expect(service.cards.length).toEqual(5)
      expect(service.cards.some(card => card.entityID === newCard.entityID)).toBeTrue()

      service.cards.map(card => {
        if (card.entityID !== newCard.entityID) {
          expect(card.inFocus).toBeFalse()
        } else {
          expect(card.inFocus).toBeTrue()
        }
      })
    })
  })

  it('should set existing cards to be in focus', () => {
    const existingCard: SidebarCard = {
      inFocus: false,
      clickedSynonymName: '4',
      clickedSynonymOccurrence: 4,
      clickedEntityOccurrence: 4,
      entityID: '4',
      entity: { synonymToXPaths: new Map() },
      recogniser: 'leadmine-proteins'
    }

    service['viewOrCreateCard'](existingCard)
    expect(service.cards.length).toEqual(4)
    expect(service.cards.some(card => card.entityID === existingCard.entityID)).toBeTrue()

    service.cards.map(card => {
      if (card.entityID !== existingCard.entityID) {
        expect(card.inFocus).toBeFalse()
      } else {
        expect(card.inFocus).toBeTrue()
      }
    })
  })
})
