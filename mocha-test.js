/*
 * Copyright 2022 Medicines Discovery Catapult
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const puppeteer = require('puppeteer')
const assert = require('assert')
const Xvfb = require('xvfb')

const extensionPath = 'dist/browser-plugin'
let extensionPage = null
let browser = null
let xvfb = null

describe('Extension UI Testing', function () {
  this.timeout(20000)
  before(async function () {
    await boot()
  })

  after(async function () {
    await browser.close()
    xvfb.stop()
  })
})

async function boot() {
  xvfb = new Xvfb({
    silent: true,
    xvfb_args: ['-screen', '0', '1280x720x24', '-ac']
  })
  xvfb.start(err => {
    if (err) console.error(err)
  })
  browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null, //otherwise it defaults to 800x600
    args: [
      '--no-sandbox',
      '--start-fullscreen',
      '--display=' + xvfb._display,
      `--disable-extensions-except=${extensionPath}`,
      `--load-extension=${extensionPath}`
    ]
  })

  const page = await browser.newPage()
  await page.waitFor(2000) // arbitrary wait time.

  const targets = await browser.targets()
  const extensionTarget = targets.find(({ _targetInfo }) => {
    return _targetInfo.title === 'Aurac'
  })

  const extensionUrl = extensionTarget._targetInfo.url || ''
  const [, , extensionID] = extensionUrl.split('/')
  const extensionPopupHtml = 'index.html?page=popup'

  extensionPage = await browser.newPage()
  await extensionPage.goto(`chrome-extension://${extensionID}/${extensionPopupHtml}`)
}
