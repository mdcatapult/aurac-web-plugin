import {Card} from './../src/content-script/card'
import {Sidebar} from './../src/content-script/sidebar'
import {CardButtons} from './../src/content-script/cardButtons'
import {cardClassName} from './../src/content-script/types'
import {Globals} from './../src/content-script/globals'
import {setup} from './util'

import * as jsdom from 'jsdom'
const { JSDOM } = jsdom
const documentObject = new JSDOM('').window.document

let sidebar: HTMLElement

beforeAll(() => {
  setup([])
  sidebar = Sidebar.create()
  Globals.document.body.appendChild(sidebar)
})

describe('card creation', () => {
  const entityText = 'entityText'

  beforeAll(() => {
    createCard(entityText)
  })

  it('card should be added to DOM', () => {
    const card = Globals.document.getElementById(`${cardClassName}.${entityText}`)
    expect(card).toBeTruthy()
  })

  it('card should be a child of sidebar card container', () => {
    const card = Globals.document.getElementById(`${cardClassName}.${entityText}`)
    const sidebar = <HTMLElement> Globals.document.getElementsByClassName(Sidebar.sidebarClass)[0]
    expect(card.parentElement.parentElement).toBe(sidebar)
  })
})

describe('card contents', () => {

  let card: HTMLElement
  let controls: HTMLElement
  const term = 'a-protein'

  beforeAll(() => {
    createCard(term)
    card = Globals.document.getElementById(`${cardClassName}.${term}`)
    controls = <HTMLElement> Array.from(card.children).find(el => el.className === CardButtons.controlsClass)
  })

  it('card should contain term', () => {
    expect(card.innerHTML.includes(term)).toBe(true)
  })

  it('card should have remove button', () => {
    const removeButton = Array.from(controls.children)
      .find(el => el.id === `${CardButtons.baseRemoveId}-${term}`)

    expect(removeButton).toBeTruthy()
  })

  it('card should have save button', () => {
    const saveButton = Array.from(controls.children)
      .find(el => el.id === `${CardButtons.baseSaveId}-${term}`)

    expect(saveButton).toBeTruthy()
  })

  it('card should have arrow buttons', () => {
    const saveButton = Array.from(controls.children)
      .find(el => el.classList.contains('aurac-arrow-buttons'))

    expect(saveButton).toBeTruthy()
  })
})

function createCard(entityText: string): void {

  // a card requires at least one occurrence
  CardButtons.entityToOccurrence.set(entityText, [documentObject.createElement('div')])

  const card = Card.create({
    entityText: entityText,
    resolvedEntity: null,
    entityGroup: null,
    recognisingDict: {
      htmlColor: 'blue',
      entityType: '',
      source: '',
    }
  }, [entityText], [])

  Sidebar.addCard(card)
}
