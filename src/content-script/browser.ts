import {TextHighlighter} from './textHighlighter'
import {Card} from './card'
import {UserExperience} from './userExperience';
import {ChEMBL} from './chembl';
import {SidebarButtons} from './sidebarButtons';
import {LeadminerEntity} from '../types';
import {Modal} from './modal';


export module Browser {
  // add listener function to browser
  import chemblRepresentations = ChEMBL.getChemblRepresentationValues;
  let leadmineEntities: Array<LeadminerEntity>;
  let hasNERBeenPerformed = false;

  export function addListener() {
    browser.runtime.onMessage.addListener((msg: any) => {
      switch (msg.type) {
        case 'get_page_contents':
          return new Promise(resolve => {
            const textNodes: Array<string> = [];
            TextHighlighter.allTextNodes(document.body, textNodes);
            // On ChEMBL, the representations (i.e. SMILES, InChI, InChIKey) are not text nodes
            // so need to be 'manually' added to the textNodes array
            const textForNER = textNodes.concat(chemblRepresentations());
            resolve({type: 'leadmine', body: textForNER.join('\n')});
          });
        case 'markup_page':
          hasNERBeenPerformed = true;
          leadmineEntities = msg.body as Array<LeadminerEntity>;
          UserExperience.toggleLoadingIcon(false);
          TextHighlighter.wrapEntitiesWithHighlight(msg);
          SidebarButtons.open()
          break;
        case 'x-ref_result':
          Card.setXRefHTML(msg.body);
          const modalButton: HTMLButtonElement = document.getElementById('aurac-modal-open-button') as HTMLButtonElement
          modalButton.disabled = false
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
        case 'retrieve_ner_from_page':
          return new Promise((resolve) => {
            resolve({type: 'resolved', body: {entities: leadmineEntities,  ner_performed: hasNERBeenPerformed}});
          });
        default:
          throw new Error('Received unexpected message from plugin');
      }
    });
  }
}
