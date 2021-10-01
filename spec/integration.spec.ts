import {TextHighlighter} from './../src/content-script/textHighlighter'
import {Sidebar} from './../src/content-script/sidebar'
import {BrowserMock} from './../src/content-script/browser-mock'
import {CardButtons} from './../src/content-script/cardButtons'
import {Card} from './../src/content-script/card'
import {SidebarButtons} from './../src/content-script/sidebarButtons'
import {cardClassName} from './../src/content-script/types'
import {Globals} from './../src/content-script/globals'

const jsdom = require("jsdom");
const {JSDOM} = jsdom;
const document: Document = new JSDOM('').window.document;

global.Node = document.defaultView.Node




// //@ts-ignore
// global.SVGElement = global.Element;

// document.registerElement

// LeadminerEntity represents an entity which has come back from leadminer, and the number
// of occurrences it has on the page.
type LeadminerEntity = {
  text: string,
  occurrences: number
}

// simulates the entities which come back from leadminer
const leadminerEntities: LeadminerEntity[] = [{
  text: 'entity1',
  occurrences: 10
}]
// require('jsdom-global')()

beforeAll(() => {

  // window.HTMLElement.prototype.scrollIntoView = jest.fn() // scrollIntoView won't work in jest context without this

  Globals.document = document
  Globals.browser = new BrowserMock()

  // scrollIntoView will not work in test contents without this
  Globals.document.defaultView.HTMLElement.prototype.scrollIntoView = function() {}

  createGlobals()

  // highlight entities - simulates 'markup_page' message
  const leadminerResults = getLeadminerResults(leadminerEntities)
  TextHighlighter.wrapEntitiesWithHighlight({body: leadminerResults})

  document.body.appendChild(Sidebar.create())
})

it('text elements in leadminerResult should be highlighted', () => {

  const hasHighlights = leadminerEntities.every(entity => {
    const highlightedElements = Array.from(document.getElementsByClassName(TextHighlighter.highlightClass))
    return highlightedElements.length && highlightedElements.some(highlightedElement => {
      return highlightedElement.textContent === entity.text
    })
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

      const font = <HTMLFontElement>occurrence.children[0]
      if (timesClicked === expectedHighlightIndex) {
        // entity that has been scrolled to should be highlighted
        expect(font.color).toBe(CardButtons.highlightColor)
      } else {
        // all other entites should not have the highlight color
        expect(!font || font.color !== CardButtons.highlightColor)
      }
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
function getLeadminerResults(entities: LeadminerEntity[]): Object {
  return entities.map(entity => {
    return {
      beg: 325,
      begInNormalizedDoc: 325,
      end: 355,
      endInNormalizedDoc: 355,
      entityGroup: "Gene or Protein",
      entityText: entity.text,
      possiblyCorrectedText: entity.text,
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

function createGlobals(): void {
  document.implementation.createHTMLDocument()
  var fs = require('fs');
  const html = fs.readFileSync('src/ner-edge-case-tests.html');
  document.documentElement.innerHTML = html

  // add each entity in leadminerentities 'entity.occurrences' number of times
  leadminerEntities.forEach(entity => {
    for (let i = 0; i < entity.occurrences; i++) {
      const el = document.createElement('div')
      el.innerHTML = `${entity.text}`
      document.body.appendChild(el)
    }
  })
}
