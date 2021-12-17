import { Globals } from './../src/content-script/globals'

import * as jsdom from 'jsdom'
import { BrowserMock } from './../src/content-script/browser-mock'
import { APIEntities } from 'src/app/background/ner.service'
const { JSDOM } = jsdom

export function setup(apiEntities: APIEntities): Document {
  Globals.document = createDocument(apiEntities)
  Globals.browser = new BrowserMock()

  // scrollIntoView will not work in test context without this
  Globals.document.defaultView.HTMLElement.prototype.scrollIntoView = () => {}

  return Globals.document
}

function createDocument(apiEntities: APIEntities): Document {
  const document = new JSDOM('').window.document
  document.implementation.createHTMLDocument()
  var fs = require('fs')
  const html = fs.readFileSync('src/ner-edge-case-tests.html')
  document.documentElement.innerHTML = html

  // add to document each entity in leadminerentities 'entity.occurrences' number of times
  apiEntities.forEach(entity => {
    const el = document.createElement('div')
    el.innerHTML = `${entity.name}`
    document.body.appendChild(el)
  })

  return document
}
