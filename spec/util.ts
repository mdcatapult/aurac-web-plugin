import { Globals } from './../src/content-script/globals'

import * as jsdom from 'jsdom'
import { BrowserMock } from './../src/content-script/browser-mock'
const {JSDOM} = jsdom

// LeadminerEntity represents an entity which has come back from leadminer, and the number
// of occurrences it has on the page.
export type LeadmineEntity = {
  text: string,
  occurrences: number
}

export function setup(leadmineEntities: LeadmineEntity[]): Document {
  Globals.document = createDocument(leadmineEntities)
  Globals.browser = new BrowserMock()

  // NOTHING TO SEE HERE MOVE ALONG
  // global objects need to be overwritten for the benefit of third party libraries (e.g. tippyjs)
  // @ts-ignore
  global.document! = Globals.document
  // @ts-ignore
  global.window! = global.document.defaultView!

  // scrollIntoView will not work in test context without this
  Globals.document.defaultView.HTMLElement.prototype.scrollIntoView = () => {}
  return Globals.document
}

function createDocument(leadmineEntities: LeadmineEntity[]): Document {
  const document = new JSDOM('').window.document
  document.implementation.createHTMLDocument()
  var fs = require('fs')
  const html = fs.readFileSync('src/ner-edge-case-tests.html')
  document.documentElement.innerHTML = html

  // add to document each entity in leadminerentities 'entity.occurrences' number of times
  leadmineEntities.forEach(entity => {
    for (let i = 0; i < entity.occurrences; i++) {
      const el = document.createElement('div')
      el.innerHTML = `${entity.text}`
      document.body.appendChild(el)
    }
  })
  return document
}

