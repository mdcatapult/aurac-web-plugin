/**
 * @jest-environment jsdom
 */

import {TextHighlighter} from './textHighlighter'
import {Sidebar} from './sidebar'
import {BrowserMock} from './browser-mock'
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

  test('text elements in leadminerResult should be highlighted', async () => {

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
