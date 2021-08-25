import browser from 'webextension-polyfill'
import {Sidebar} from './sidebar'
import {TextHighlighter} from './textHighlighter'
import * as Constants from './constants'
import { Card } from './card'
export module Browser {
  // add listener function to browser
  export function addListener() {

    // rename to "isFirstMessage"?
    // let isAppOpen = false;

    browser.runtime.onMessage.addListener((msg) => {
      /*if (!isAppOpen && msg.type !== 'sidebar_rendered') {
        Sidebar.open();
        isAppOpen = true;
        return;
      }*/
      switch (msg.type) {
        case 'get_page_contents':
          return new Promise(resolve => {
            const textNodes: Array<string> = [];
            TextHighlighter.allTextNodes(document.body, textNodes);
            resolve({type: 'leadmine', body: textNodes.join('\n')});
          });
        case 'markup_page':
          TextHighlighter.wrapEntitiesWithHighlight(msg);
          Sidebar.open()
          break;
        case 'x-ref_result':
          Card.setXRefHTML(msg.body);
          break;
        case 'toggle_sidebar':
          Sidebar.toggle()
          break;
        default:
          throw new Error('Received unexpected message from plugin');
      }
    });
  }

}
