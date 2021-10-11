import {TextHighlighter} from './textHighlighter'
import {Card} from './card'
import {UserExperience} from './userExperience';
import {ChEMBL} from './chembl';
import {SidebarButtons} from './sidebarButtons';
import {LeadminerEntity} from '../types';
import {Modal} from './modal';

import { IBrowser } from './IBrowser';
import { Message } from 'src/types';
import { SavedCard } from './types';
import {Globals} from './globals';

/**
 * BrowserImplementation provides implementation of functions in IBroswer interface
 */
export class BrowserImplementation implements IBrowser {

  // add listener function to browser
  static addListener() {
    browser.runtime.onMessage.addListener((msg: any) => {
      switch (msg.type) {
        case 'get_page_contents':
          return new Promise(resolve => {
            const textNodes: Array<string> = [];
            TextHighlighter.allTextNodes(Globals.document.body, textNodes);
            // On ChEMBL, the representations (i.e. SMILES, InChI, InChIKey) are not text nodes
            // so need to be 'manually' added to the textNodes array
            const textForNER = textNodes.concat(ChEMBL.getChemblRepresentationValues());

            // Leadmine needs newline separated strings to correctly identify entities
            resolve({type: 'leadmine', body: textForNER.join('\n')});
          });
        case 'markup_page':
          UserExperience.toggleLoadingIcon(false);
          TextHighlighter.wrapEntitiesWithHighlight(msg);
          SidebarButtons.open()
          break;
        case 'x-ref_result':
          Card.setXRefHTML(msg.body);
          break;
        case 'toggle_sidebar':
          SidebarButtons.toggle()
          break;
        case 'awaiting_response':
          UserExperience.toggleLoadingIcon(msg.body as boolean);
          break;
        case 'remove_highlights':
          TextHighlighter.removeHighlights();
          break;
        case 'open_modal':
          Modal.openModal(msg.body)
          break;
        default:
          throw new Error('Received unexpected message from plugin');
      }
    });
  }
  sendMessage(msg: Message): Promise<any> {
      return browser.runtime.sendMessage(msg)
  }

  getURL(url: string): string {
    return browser.runtime.getURL(url)
  }

  getStoredCards(cardStorageKey: string): SavedCard[] {
    const storedCardsString = window.localStorage.getItem(cardStorageKey)
    return storedCardsString === null ? [] : JSON.parse(storedCardsString) as SavedCard[];
  }
}
