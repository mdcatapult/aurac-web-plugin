/**
 * @jest-environment jsdom
 */

import {Card} from './../card'
import {Sidebar} from './../sidebar'
import {BrowserMock} from './../browser-mock'
import {CardButtons} from './../cardButtons'
import {cardClassName} from '../types'
import { beforeAll, describe, test, expect } from 'jest-without-globals'

let sidebar: HTMLElement

beforeAll(() => {
  sidebar = Sidebar.create(new BrowserMock())
  document.body.appendChild(sidebar)
})

describe('card creation', () => {
  const entityText = 'entityText'

  beforeAll(() => {
    createCard(entityText)
  })

  test('card should be added to DOM', () => {
    const card = document.getElementById(`${cardClassName}.${entityText}`)
    expect(card).toBeTruthy()
  })

  test('card should be a child of sidebar card container', () => {
    const card = document.getElementById(`${cardClassName}.${entityText}`)
    const sidebar = document.getElementsByClassName(Sidebar.sidebarClass)[0]
    expect(card.parentElement.parentElement).toBe(sidebar)
  })
})

describe('card contents', () => {

  let card: HTMLElement
  let controls: HTMLElement
  const term = 'a-protein'

  beforeAll(() => {
    createCard(term)
    card = document.getElementById(`${cardClassName}.${term}`)
    controls = <HTMLElement>Array.from(card.children).find(el => el.className === CardButtons.controlsClass)
  })

  test('card should contain term', () => {
    expect(card.innerHTML.includes(term)).toBe(true)
  })

  test('card should have remove button', () => {
    const removeButton = Array.from(controls.children)
      .find(el => el.id === `${CardButtons.baseRemoveId}-${term}`)
    expect(removeButton).toBeTruthy()
  })

  test('card should have save button', () => {
    const saveButton = Array.from(controls.children)
      .find(el => el.id === `${CardButtons.baseSaveId}-${term}`)
    expect(saveButton).toBeTruthy()
  })

  test('card should have arrow buttons', () => {
    const saveButton = Array.from(controls.children)
      .find(el => el.classList.contains('aurac-arrow-buttons'))
    expect(saveButton).toBeTruthy()
  })
})

function createCard(entityText: string): void {

  // a card requires at least one occurrence
  CardButtons.entityToOccurrence.set(entityText, [document.createElement('div')])

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
