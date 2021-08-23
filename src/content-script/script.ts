/* TOODO

content - vanilla TS
popup - angular
background - angular
  - should webservice calls be abstracted out in to SDK-esque thing
  - concept of JS lib to call web services (swap out libraries)
 		- node TS lib (then test that independently)
		- lib goes in to nexus and is versioned

 - all talk to each other


todo ideas

 - split up code in to components/classes
	- unit tests
 - integration tests
 		- test html pages?

 - inline css moves out?
 - make sure things are namespaced (packages/folders) for ts/css
 - functions have to return values
 - global state
 - no global variables
 - can we use options?

*/

import {EntityMap} from './entityMap';
import {Entity} from './types';
import * as Constants from './constants';
import {Browser} from './browser';
import {Card} from './card';
import {Sidebar} from './sidebar';

console.log('script loaded');

const sidebar = Sidebar.init(document.createElement('span'))
Browser.addListener(sidebar)



// let hasNERLookupOccurred = false;


function addHighlightAndEventListeners(selector: Element[], entity: Entity) {
  selector.map(element => {
    // Try/catch for edge cases.
    try {
      // For each term, we want to replace it's original HTML with a highlight colour
      const replacementNode = document.createElement('span');
      // @ts-ignore
      replacementNode.innerHTML = element.nodeValue.replaceAll(entity.entityText, highlightTerm(entity.entityText, entity));

      // This new highlighted term will will replace the current child (same term but with no highlight) of this parent element.
      element.parentNode.insertBefore(replacementNode, element);
      element.parentNode.removeChild(element);

      // For each value we find that is a highlighted term, we want to add it to our sidebar and find its occurrences within the page
      const childValues = getAuracHighlightChildren(replacementNode);
      childValues.forEach(childValue => {
        populateEntityToOccurrences(entity.entityText, childValue);
        childValue.addEventListener('click', populateAuracSidebar(entity, replacementNode));
      });
    } catch (e) {
      console.error(e);
    }
  });
}

// highlights a term by wrapping it an HTML span
const highlightTerm = (term, entity) => `<span class="aurac-highlight" style="background-color: ${entity.recognisingDict.htmlColor};position: relative; cursor: pointer">${term}</span>`;


// TODO can this function return something ?
// returns an event listener which creates a new element with passed info and appends it to the passed element
const populateAuracSidebar = (info: Entity, element: Element) => {
  return (event) => {
    if (event.type !== 'click') {
      return;
    }
    document.getElementById('aurac-narrative').style.display = 'none';
    if (getAuracHighlightChildren(element).some(child => child.className === 'aurac-highlight')
      && element.parentElement.className === 'aurac-highlight') {
      removeEventListener('click', populateAuracSidebar(info, element));
    } else {
      if (!entityToCard.has(info.entityText)) {
        const card = Card.create(info)
        entityToCard.set(info.entityText, card);
        Sidebar.addCard(card);
        // @ts-ignore
        browser.runtime.sendMessage({type: 'compound_x-refs', body: [info.entityText, info.resolvedEntity]})
          .catch(e => console.error(e));
      }
    }
    const div = entityToCard.get(info.entityText);
    if (div) {
      div.scrollIntoView({behavior: 'smooth'});
      setSidebarColors(div);
    }
  };
};


// TODO move style
function setSidebarColors(highlightedDiv: HTMLDivElement): void {
  Array.from(entityToCard.values()).forEach(div => {
    div.style.border = div === highlightedDiv ? '2px white solid' : '1px black solid';
  });
}

function populateEntityToOccurrences(entityText: string, occurrence: Element): void {
  if (!entityToOccurrence.has(entityText)) {
    entityToOccurrence.set(entityText, [occurrence]);
  } else {
    entityToOccurrence.get(entityText).push(occurrence);
  }
}

function getAuracHighlightChildren(element: Element) {
  return Array.from(element.children).filter(child => child.className === 'aurac-highlight');
}
