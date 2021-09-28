const puppeteer = require('puppeteer');
const assert = require('assert');
const Xvfb = require('xvfb');

const extensionPath = 'dist/browser-plugin';
let extensionPage = null;
let browser = null;
let xvfb = null;

describe('Extension UI Testing', function() {
  this.timeout(20000);
  before(async function() {
    await boot();
  });

  describe('Settings Page', async function() {
    it('Has restore defaults button', async function() {
      await extensionPage.click('#aurac-settings-button');
      let defaultsButton = (await extensionPage.$('.restore-defaults-button-container'));
      assert.notStrictEqual(defaultsButton, null);
    })
  });

  after(async function() {
    await browser.close();
    xvfb.stop();
  });
});

async function boot() {
  xvfb = new Xvfb({
    silent: true,
    xvfb_args: ["-screen", "0", '1280x720x24', "-ac"],
  });
  xvfb.start((err)=>{if (err) console.error(err)})
  browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null, //otherwise it defaults to 800x600
    args: [
      '--no-sandbox',
      '--start-fullscreen',
      '--display='+xvfb._display,
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
