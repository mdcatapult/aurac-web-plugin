import browser from 'web-ext-types/global/index';
export class Browser {


  constructor(browser: chrome.browser) {
  }

  getLogo() {

  }


  auracLogo.src = browser.runtime.getURL('assets/head-brains.png')

}
