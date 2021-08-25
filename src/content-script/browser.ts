import {Sidebar} from './sidebar'
import {TextHighlighter} from './textHighlighter'
import { Card } from './card'
export module Browser {
  // add listener function to browser
  export function addListener() {
    browser.runtime.onMessage.addListener((msg: any) => {
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
