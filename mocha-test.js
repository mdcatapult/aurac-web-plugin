const puppeteer = require('puppeteer');
const assert = require('assert');
const should = require('should');

const extensionPath = 'dist/browser-plugin';
let extensionPage = null;
let browser = null;

describe('Extension UI Testing', function() {
  this.timeout(20000);
  before(async function() {
    await boot();
  });

  describe('Settings Page', async function() {
    it('Has restore defaults button', async function() {
      await extensionPage.click('#aurac-settings-button');
      let defaultsButton = (await extensionPage.$('.restore-defaults-button-container'));
      should.exist(defaultsButton);
    })
  });

  after(async function() {
    await browser.close();
  });
});

async function boot() {
  browser = await puppeteer.launch({
    headless: false, // extension are allowed only in head-full mode
    args: [
      `--disable-extensions-except=${extensionPath}`,
      `--load-extension=${extensionPath}`
    ]
  });

  const page = await browser.newPage();
  await page.waitFor(2000); // arbitrary wait time.

  const targets = await browser.targets();
  const extensionTarget = targets.find(({ _targetInfo }) => {
    return _targetInfo.title === 'Aurac';
  });

  const extensionUrl = extensionTarget._targetInfo.url || '';
  const [,, extensionID] = extensionUrl.split('/');
  const extensionPopupHtml = 'index.html?page=popup'

  extensionPage = await browser.newPage();
  await extensionPage.goto(`chrome-extension://${extensionID}/${extensionPopupHtml}`);
}
