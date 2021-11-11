import * as jsdom from 'jsdom'
import { APIEntities } from 'src/app/background/ner.service'

const {JSDOM} = jsdom
let document: Document = new JSDOM('').window.document

// sets global Node object to default value from JSDOM. Without this, the
// global Node object is not understood from within test context
global.Node = document.defaultView.Node

// simulates the entities which come back from leadmine
const APIEntities: APIEntities = [{
  name: "thing",
  position: 0,
  xpath: "/html/*[1]",
  recogniser: 'leadmine-proteins'
}]

describe('integration', () => {
  beforeAll(() => {
    // setup
  })

  it('text elements in leadminerResult should be highlighted', () => {
    const hasHighlights = true

    expect(hasHighlights).toBe(true)
  })

  it('clicking highlighted elements should create card', () => {

  })

  it('clicking clear button should remove all cards', () => {

  })

  it('clicking remove on a card should remove that card', () => {

  })

  describe('occurrences', () => {
    it('occurrences count', () => {

    })

    it('arrow buttons', () => {

    })
  })
})
