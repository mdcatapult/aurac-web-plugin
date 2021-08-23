import browser from 'webextension-polyfill'
import {SidebarAnimations} from './sidebarAnimations'
import {Sidebar} from './sidebar'
import {TextHighlighter} from './textHighlighter'
import * as Constants from './constants'
import { Card } from './card'
export module Browser {

  // add listener function to browser
  export function addListener(sidebar: HTMLSpanElement) {

    // rename to "isFirstMessage"?
    let isAppOpen = false;
    let hasNERLookupOccurred = false;
    browser.runtime.onMessage.addListener((msg) => {
      if (!isAppOpen && msg.type !== 'sidebar_rendered') {
        Sidebar.open(sidebar);
        isAppOpen = true;
        return;
      }
      switch (msg.type) {
        case 'get_page_contents':
          return new Promise(resolve => {
            const textNodes: Array<string> = [];
            TextHighlighter.allTextNodes(document.body, textNodes);
            resolve({type: 'leadmine', body: textNodes.join('\n')});
          });
        case 'markup_page':
          TextHighlighter.wrapEntitiesWithHighlight(msg);
          break;
        case 'x-ref_result':
          Card.setXRefHTML(msg.body);
          break;
        case 'toggle_sidebar':
          Sidebar.toggle(sidebar)
          break;
        case 'sidebar_rendered':
          return new Promise((resolve) => {
            const result = String(hasNERLookupOccurred);
            resolve({type: 'resolved', body: result});
          });
        case 'ner_lookup_performed':
          hasNERLookupOccurred = true;
          break;
        default:
          throw new Error('Received unexpected message from plugin');
      }
    });
  }

}
