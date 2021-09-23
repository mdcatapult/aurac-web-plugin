/**
 * @jest-environment jsdom
 */

import * as puppeteer from 'puppeteer'

beforeAll(() => {
  document.implementation.createHTMLDocument()

  var fs = require('fs');
  const html = fs.readFileSync('src/ner-edge-case-tests.html');
  document.documentElement.innerHTML = html

  console.log('body: ', document.body.innerHTML)
})

test('eee', async () => {
  expect(true).toBe(true)
})
