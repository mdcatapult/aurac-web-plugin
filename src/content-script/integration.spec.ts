/**
 * @jest-environment jsdom
 */

import {TextHighlighter} from './textHighlighter'
import {Sidebar} from './sidebar'
import {BrowserMock} from './browser-mock'
import {CardButtons} from './cardButtons'
import * as puppeteer from 'puppeteer'
import { cardClassName } from './types'

// simulates the entities which come back from leadminer
const leadminerEntities = ['Glucans biosynthesis protein D']

beforeAll(() => {
  window.HTMLElement.prototype.scrollIntoView = jest.fn() // scrollIntoView won't work in jest context without this

  // create document
  document.implementation.createHTMLDocument()
  var fs = require('fs');
  const html = fs.readFileSync('src/ner-edge-case-tests.html');
  document.documentElement.innerHTML = html

  // highlight entities - simulates 'markup_page' message
  const leadminerResults = getLeadminerResults(leadminerEntities)
  TextHighlighter.wrapEntitiesWithHighlight({body: leadminerResults})

  document.body.appendChild(Sidebar.create(new BrowserMock()))
})

describe('highlighting', () => {

  test('text elements in leadminerResult should be highlighted', () => {

    const hasHighlights = leadminerEntities.every(entityText => {
      const highlightedElements = Array.from(document.getElementsByClassName(TextHighlighter.highlightClass))
      return highlightedElements.length && highlightedElements.some(highlightedElement => {
        return highlightedElement.textContent === entityText
      })
    })
    expect(hasHighlights).toBe(true)
  })
})

test('clicking highlighted elements should create card', () => {

  const highlightedElements = Array.from(document.getElementsByClassName(TextHighlighter.highlightClass))

  // click every highlighted element
  highlightedElements.forEach((element: HTMLElement) => element.click())

  const cards = Array.from(document.getElementsByClassName(cardClassName))

  // there should be one card per entity
  expect(cards.length).toBe(leadminerEntities.length)
})

test ('clicking clear button should remove all cards', () => {
  const numberOfCards = Array.from(document.getElementsByClassName(cardClassName)).length
  // there must be cards from a previous test for this test to be valid
  expect(numberOfCards > 0).toBe(true)

  document.getElementById(Sidebar.clearButtonId).click()
  expect(Array.from(document.getElementsByClassName(cardClassName)).length).toBe(0)
})

test('clicking remove on a card should remove that card', () => {
  const entity = leadminerEntities[0]
  clickElementForEntity(entity)

  const numOfCards = Array.from(document.getElementsByClassName(cardClassName)).length

  // get the card for the clicked entity
  const card = Array.from(document.getElementsByClassName(cardClassName)).find(cardElement => {
    return cardElement.innerHTML.includes(entity)
  })

  // get remove button
  document.getElementById(`${CardButtons.baseRemoveClass}-${entity}`).click()

  expect(Array.from(document.getElementsByClassName(cardClassName)).length).toBe(numOfCards - 1)
})

describe('occurrences', () => {
  test('occurrences count', () => {
    const entity = leadminerEntities[0]
    clickElementForEntity(entity)
    const occurrencesElement = document.getElementById(`${entity}-occurrences`)
    expect(occurrencesElement).toBeTruthy()

    let numOfOccurrences = CardButtons.entityToOccurrence.get(entity).length
    expect(numOfOccurrences).toBe(6) // there are 6 instances in the HTML doc
  })

  test('arrow buttons', () => {
    const entity = leadminerEntities[0]
    clickElementForEntity(entity)
    const rightArrow = document.getElementById(`right-${CardButtons.baseArrowClass}-${entity}`)

    for (let timesClicked = 0; timesClicked < 6; timesClicked++) {
      const oldScrollPos = window.scrollY
      rightArrow.click()
      const newScrollPos = window.scrollY
      expect(newScrollPos !== oldScrollPos)

      const occurrences = Array.from(document.getElementsByClassName(TextHighlighter.highlightClass)).forEach((occurrence, i) => {
        const font = <HTMLFontElement>occurrence.children[0]
        if (timesClicked === i) {
          // entity that has been scrolled to should be highlighted
          expect(font.color).toBe(CardButtons.highlightColor)
        } else {
          // all other entites should not have the highlight color
          expect(!font || font.color !== CardButtons.highlightColor)
        }
      })
    }
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
function getLeadminerResults(entities: string[]): Object {
  return entities.map(entity => {
    return {
      beg: 325,
      begInNormalizedDoc: 325,
      end: 355,
      endInNormalizedDoc: 355,
      entityGroup: "Gene or Protein",
      entityText: entity,
      possiblyCorrectedText: entity,
      recognisingDict: {
        enforceBracketing: false,
        entityType: "GeneOrProtein",
        htmlColor: "pink",
        maxCorrectionDistance: 0,
        minimumCorrectedEntityLength: 9,
        minimumEntityLength: 0,
        source: "/srv/config/common/leadmine/2018-11-06/dictionary/CFDictGeneAndProtein.cfx",
      },
      resolvedEntity: null,
    }
  })
}
