import {TextHighlighter} from './../src/content-script/textHighlighter'
import {Sidebar} from './../src/content-script/sidebar'
import {clickElementForEntity, getLeadmineResults, setup, TestLeadmineEntity} from './util'
import {cardClassName} from './../src/content-script/types'
import {Card} from './../src/content-script/card'

import * as jsdom from 'jsdom'
import { CardButtons } from './../src/content-script/cardButtons'

const {JSDOM} = jsdom
let document: Document = new JSDOM('').window.document

// sets global Node object to default value from JSDOM. Without this, the
// global Node object is not understood from within test context
global.Node = document.defaultView.Node

describe('synonyms', () => {

  const entity1Text = 'entity1'
  const entity2Text = 'entity2'
  const resolvedEntity = 'resolvedEntity'

  const leadmineEntities: TestLeadmineEntity[] = [
    {text: entity1Text, occurrences: 1, resolvedEntity: resolvedEntity},
    {text: entity2Text, occurrences: 1, resolvedEntity: resolvedEntity},
    {text: 'this should be on a different card', occurrences: 1, resolvedEntity: 'something else'}
  ]

  beforeAll(() => {
    document = setup(leadmineEntities)
    document.body.appendChild(Sidebar.create())

    // highlight entities - simulates 'markup_page' message
    const leadmineResults = getLeadmineResults(leadmineEntities)
    TextHighlighter.wrapEntitiesWithHighlight({body: leadmineResults})

    // triggers event handler, added by text highlighter, which should add cards to sidebar
    leadmineEntities.forEach(entity => clickElementForEntity(entity.text))
  })

  it('should add only one card for each unique resolvedEntity', () => {
    const cards = Array.from(document.getElementsByClassName(cardClassName))
    expect(cards.length).toBe(2)
  })

  it('should add every entityText for the same resolved entity to the card when clicked', () => {
    const entityText = document.getElementById(Card.getEntityClass(resolvedEntity))
    expect(entityText.textContent).toBe([entity1Text, entity2Text].toString())
  })

  it('should add up occurrences for all instances of the same resolved entity', () => {
    const occurrencesText = document.getElementById(`${resolvedEntity}-occurrences`)
    const numOfOccurrences = CardButtons.entityToOccurrence.get(resolvedEntity).length

    expect(occurrencesText.innerText.includes(numOfOccurrences.toString())).toBeTrue()
    expect(numOfOccurrences).toBe(2)
  })

  // TODO fix code to work for more than 2 synonyms
  xit('should work for more than 2 synonyms', () => {
    const entity3Text = 'entity3'
    const entities = leadmineEntities.concat([
      {text: entity3Text, occurrences: 1, resolvedEntity: resolvedEntity},
    ])

    document = setup(leadmineEntities)
    document.body.appendChild(Sidebar.create())

    // highlight entities - simulates 'markup_page' message
    const leadmineResults = getLeadmineResults(leadmineEntities)
    TextHighlighter.wrapEntitiesWithHighlight({body: leadmineResults})

    // triggers event handler, added by text highlighter, which should add cards to sidebar
    leadmineEntities.forEach(entity => clickElementForEntity(entity.text))

    const entityText = document.getElementById(Card.getEntityClass(resolvedEntity))
    expect(entityText.textContent).toBe([entity1Text, entity2Text, entity3Text].toString())
  })


})

