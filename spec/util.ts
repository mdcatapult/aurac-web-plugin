import { Globals } from "./../src/content-script/globals"

import * as jsdom from 'jsdom'
import { BrowserMock } from "./../src/content-script/browser-mock";
import { LeadminerEntity } from "./integration.spec";
const {JSDOM} = jsdom;

export function setup(leadminerEntities: LeadminerEntity[]): Document {
  Globals.document = createDocument(leadminerEntities)
  Globals.browser = new BrowserMock()

  // scrollIntoView will not work in test context without this
  Globals.document.defaultView.HTMLElement.prototype.scrollIntoView = () => {}
  return Globals.document
}

function createDocument(leadminerEntities: LeadminerEntity[]): Document {
  const document = new JSDOM('').window.document
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
  return document
}

