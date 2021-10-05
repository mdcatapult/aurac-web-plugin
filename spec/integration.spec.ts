import {TextHighlighter} from './../src/content-script/textHighlighter'
import {Sidebar} from './../src/content-script/sidebar'
import {CardButtons} from './../src/content-script/cardButtons'
import {Card} from './../src/content-script/card'
import {SidebarButtons} from './../src/content-script/sidebarButtons'
import {cardClassName} from './../src/content-script/types'
import {Globals} from './../src/content-script/globals'
import {LeadminerEntity, setup} from './util'

import * as jsdom from 'jsdom'
const {JSDOM} = jsdom
let document: Document = new JSDOM('').window.document

// sets global Node object to default value from JSDOM. Without this, the
// global Node object is not understood from within test context
global.Node = document.defaultView.Node

// simulates the entities which come back from leadminer
const leadminerEntities: LeadminerEntity[] = [{
  text: 'entity1',
  occurrences: 10
}]

describe('integration', () => {
  beforeAll(() => {
    document = setup(leadminerEntities)

    // highlight entities - simulates 'markup_page' message
    const leadminerResults = getLeadminerResults(leadminerEntities)
    TextHighlighter.wrapEntitiesWithHighlight({body: leadminerResults})

    document.body.appendChild(Sidebar.create())
  })

  it('text elements in leadminerResult should be highlighted', () => {
    const hasHighlights = leadminerEntities.every(entity => {
      const highlightedElements = Array.from(document.getElementsByClassName(TextHighlighter.highlightClass))

      const isExpectedHighlightedEntityText = highlightedElements.some(highlightedElement => {
        return highlightedElement.textContent === entity.text
      })

      return highlightedElements.length && isExpectedHighlightedEntityText
    })

    expect(hasHighlights).toBe(true)
  })

  it('clicking highlighted elements should create card', () => {
    const highlightedElements = Array.from(Globals.document.getElementsByClassName(TextHighlighter.highlightClass))

    // click every highlighted element
    highlightedElements.forEach((element: HTMLElement) => element.click())

    const cards = Array.from(Globals.document.getElementsByClassName(cardClassName))

    // there should be one card per entity
    expect(cards.length).toBe(leadminerEntities.length)
  })

  it('clicking clear button should remove all cards', () => {
    const numberOfCards = Array.from(document.getElementsByClassName(cardClassName)).length
    // there must be cards from a previous test for this test to be valid
    expect(numberOfCards > 0).toBe(true)

    document.getElementById(Sidebar.clearButtonId).click()
    expect(Array.from(document.getElementsByClassName(cardClassName)).length).toBe(0)
  })

  it('clicking remove on a card should remove that card', () => {
    const entity = leadminerEntities[0].text
    clickElementForEntity(entity)

    const numOfCards = Array.from(document.getElementsByClassName(cardClassName)).length

    // get the card for the clicked entity
    const card = Array.from(document.getElementsByClassName(cardClassName)).find(cardElement => {
      return cardElement.innerHTML.includes(entity)
    })

    // click remove button
    document.getElementById(`${CardButtons.baseRemoveId}-${entity}`).click()

    expect(Array.from(document.getElementsByClassName(cardClassName)).length).toBe(numOfCards - 1)
  })

  describe('occurrences', () => {
    it('occurrences count', () => {
      const entity = leadminerEntities[0]
      clickElementForEntity(entity.text)
      const occurrencesElement = document.getElementById(`${entity.text}-occurrences`)
      expect(occurrencesElement).toBeTruthy()

      let numOfOccurrences = CardButtons.entityToOccurrence.get(entity.text).length
      expect(numOfOccurrences).toBe(entity.occurrences)
    })

    it('arrow buttons', () => {
      const entity = leadminerEntities[0]
      clickElementForEntity(entity.text)

      // scroll forwards through the occurrences
      const rightArrow = document.getElementById(`right-${CardButtons.baseArrowId}-${entity.text}`)
      for (let timesClicked = 0; timesClicked < entity.occurrences; timesClicked++) {
        const expectedHighlightIndex = timesClicked
        clickArrowButton(rightArrow, timesClicked, expectedHighlightIndex)
      }

      // scroll backwards through the occurrences
      const leftArrow = document.getElementById(`left-${CardButtons.baseArrowId}-${entity.text}`)
      for (let timesClicked = 0; timesClicked < entity.occurrences; timesClicked++) {
        const expectedHighlightIndex = entity.occurrences - timesClicked - 1
        clickArrowButton(leftArrow, timesClicked, expectedHighlightIndex)
      }

      function clickArrowButton(arrowButton: HTMLElement, timesClicked: number, expectedHighlightIndex: number) {
        const window = Globals.document.defaultView.window
        const oldScrollPos = window.scrollY
        arrowButton.click()
        const newScrollPos = window.scrollY
        expect(newScrollPos !== oldScrollPos)

        const occurrence = Array.from(document.getElementsByClassName(TextHighlighter.highlightClass))[expectedHighlightIndex]

        const font = <HTMLFontElement> occurrence.children[0]
        if (timesClicked === expectedHighlightIndex) {
          // entity that has been scrolled to should be highlighted
          expect(font.color).toBe(CardButtons.highlightColor)
        } else {
          // all other entities should not have the highlight color
          expect(!font || font.color !== CardButtons.highlightColor)
        }
      }
    })
  })
})

function clickElementForEntity(entity: string): void {
  Array.from(document.getElementsByClassName(TextHighlighter.highlightClass)).forEach((element: HTMLElement) => {
    if (element.textContent === entity) {
      element.click()
      return
    }
  })
}

// returns sample leadminer results for each entityText
function getLeadminerResults(entities: LeadminerEntity[]): Object {
  return entities.map(entity => {
    return {
      beg: 325,
      begInNormalizedDoc: 325,
      end: 355,
      endInNormalizedDoc: 355,
      entityGroup: 'Gene or Protein',
      entityText: entity.text,
      possiblyCorrectedText: entity.text,
      recognisingDict: {
        enforceBracketing: false,
        entityType: 'GeneOrProtein',
        htmlColor: 'pink',
        maxCorrectionDistance: 0,
        minimumCorrectedEntityLength: 9,
        minimumEntityLength: 0,
        source: '/srv/config/common/leadmine/2018-11-06/dictionary/CFDictGeneAndProtein.cfx',
      },
      resolvedEntity: null,
    }
  })
}
