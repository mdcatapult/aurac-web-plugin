import {Globals} from './../src/content-script/globals'

import * as jsdom from 'jsdom'
import {BrowserMock} from './../src/content-script/browser-mock'
import {TextHighlighter} from '../src/content-script/textHighlighter';
import {Dictionary, LeadminerEntity} from '../src/types';
import {CardButtons} from '../src/content-script/cardButtons';

const {JSDOM} = jsdom

// LeadminerEntity represents an entity which has come back from leadmine, and the number
// of occurrences it has on the page.
export type TestLeadmineEntity = {
  text: string,
  occurrences: number,
  resolvedEntity: undefined | string
}

export function setup(leadmineEntities: TestLeadmineEntity[]): Document {
  CardButtons.entityToOccurrence.clear()

  Globals.document = createDocument(leadmineEntities)
  Globals.browser = new BrowserMock()

  // scrollIntoView will not work in test context without this
  Globals.document.defaultView.HTMLElement.prototype.scrollIntoView = () => {}

  return Globals.document
}

function createDocument(leadmineEntities: TestLeadmineEntity[]): Document {
  const document = new JSDOM('').window.document
  document.implementation.createHTMLDocument()

  // add to document each entity in leadmine entities 'entity.occurrences' number of times
  leadmineEntities.forEach(entity => {
    for (let i = 0; i < entity.occurrences; i++) {
      const el = document.createElement('div')
      el.innerHTML = `${entity.text}`
      document.body.appendChild(el)
    }
  })

  return document
}

/**
 * Finds highlight for the entity text given, and clicks the first instance if found
 * Triggers the event handler for the aurac highlight that wraps the element with entity text
 */
export function clickElementForEntity(entityText: string): void {
  const highlightedElements = Globals.document.getElementsByClassName(TextHighlighter.highlightClass)

  Array.from(highlightedElements)
    .forEach((element: HTMLElement) => {
      if (element.textContent === entityText) {
        element.click()
        return
      }
    })
}

// returns sample leadmine results for each entityText
export function getLeadmineResults(entities: TestLeadmineEntity[]): LeadminerEntity[] {
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
      sectionType: 'sectionType',
      resolvedEntity: entity.resolvedEntity,
    }
  })
}
