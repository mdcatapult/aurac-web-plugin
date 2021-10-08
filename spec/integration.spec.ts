import {TextHighlighter} from './../src/content-script/textHighlighter'
import {Sidebar} from './../src/content-script/sidebar'
import {CardButtons} from './../src/content-script/cardButtons'
import {cardClassName} from './../src/content-script/types'
import {Globals} from './../src/content-script/globals'
import {LeadmineEntity, setup} from './util'

import * as jsdom from 'jsdom'

const {JSDOM} = jsdom
let document: Document = new JSDOM('').window.document

// sets global Node object to default value from JSDOM. Without this, the
// global Node object is not understood from within test context
global.Node = document.defaultView.Node

// simulates the entities which come back from leadmine
const leadmineEntities: LeadmineEntity[] = [{
  text: 'entity1',
  occurrences: 10
}]

describe('integration', () => {
  beforeAll(() => {
    document = setup(leadmineEntities)

    // highlight entities - simulates 'markup_page' message
    const leadmineResults = getLeadmineResults(leadmineEntities)
    TextHighlighter.wrapEntitiesWithHighlight({body: leadmineResults})

    document.body.appendChild(Sidebar.create())
  })

  it('text elements in leadminerResult should be highlighted', () => {
    const hasHighlights = leadmineEntities.every(entity => {
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
    expect(cards.length).toBe(leadmineEntities.length)
  })

  it('clicking clear button should remove all cards', () => {
    const numberOfCards = Array.from(document.getElementsByClassName(cardClassName)).length
    // there must be cards from a previous test for this test to be valid
    expect(numberOfCards > 0).toBe(true)

    document.getElementById(Sidebar.clearButtonId).click()
    expect(Array.from(document.getElementsByClassName(cardClassName)).length).toBe(0)
  })

  it('clicking remove on a card should remove that card', () => {
    const entity = leadmineEntities[0].text
    clickElementForEntity(entity)

    const numOfCards = Array.from(document.getElementsByClassName(cardClassName)).length

    // click remove button
    document.getElementById(`${CardButtons.baseRemoveId}-${entity}`).click()

    expect(Array.from(document.getElementsByClassName(cardClassName)).length).toBe(numOfCards - 1)
  })




  it('hovering over a highlight should add a tooltip element', () => {

    // Error: Uncaught [ReferenceError: cancelAnimationFrame is not defined]

    Globals.document.defaultView.cancelAnimationFrame = (handle: number) => {}
    const hoverEvent = new document.defaultView.MouseEvent('mouseenter');
    const highlightedElement = document.getElementsByClassName(TextHighlighter.highlightClass)[0] as HTMLElement
    highlightedElement.dispatchEvent(hoverEvent);

    expect(Array.from(highlightedElement.children).some(node => node.className.startsWith('tippy'))).toBe(true)
  })




  describe('occurrences', () => {
    it('occurrences count', () => {
      const entity = leadmineEntities[0]
      clickElementForEntity(entity.text)
      const occurrencesElement = document.getElementById(`${entity.text}-occurrences`)
      expect(occurrencesElement).toBeTruthy()

      let numOfOccurrences = CardButtons.entityToOccurrence.get(entity.text).length
      expect(numOfOccurrences).toBe(entity.occurrences)
    })

    it('arrow buttons', () => {
      const entity = leadmineEntities[0]
      clickElementForEntity(entity.text)
      const window = Globals.document.defaultView.window
      const occurrences = Array.from(document.getElementsByClassName(TextHighlighter.highlightClass))

      // scroll forwards through the occurrences
      const rightArrow = document.getElementById(`right-${CardButtons.baseArrowId}-${entity.text}`)
      for (let timesClicked = 0; timesClicked < entity.occurrences; timesClicked++) {
        const oldScrollPos = window.scrollY

        rightArrow.click()

        const newScrollPos = window.scrollY
        expect(newScrollPos !== oldScrollPos)

        const expectedHighlightIndex = timesClicked
        assertHighlighting(occurrences, expectedHighlightIndex)
      }

      // scroll backwards through the occurrences
      const leftArrow = document.getElementById(`left-${CardButtons.baseArrowId}-${entity.text}`)
      for (let timesClicked = 0; timesClicked < entity.occurrences; timesClicked++) {
        const oldScrollPos = window.scrollY

        leftArrow.click()

        const newScrollPos = window.scrollY
        expect(newScrollPos !== oldScrollPos)

        const expectedHighlightIndex = entity.occurrences - timesClicked - 1
        assertHighlighting(occurrences, expectedHighlightIndex)
      }

      function assertHighlighting(occurrences: Element[], expectedHighlightIndex: number): void {

        occurrences.forEach((occurrence, occurrenceNumber) => {
          // highlight elements are wrapped in a font tag
          const font = <HTMLFontElement> occurrence.getElementsByTagName('font')[0]
          if (!font) {
            return
          }

          if (occurrenceNumber === expectedHighlightIndex) {
            // entity that has been scrolled to should be highlighted
            expect(font.color).toBe(CardButtons.highlightColor)
          } else {
            // all other entities should not have the highlight color if they have a font element
            expect(font.color !== CardButtons.highlightColor)
          }
        })
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

// returns sample leadmine results for each entityText
function getLeadmineResults(entities: LeadmineEntity[]): Object {
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
