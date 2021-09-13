import {Entity} from './types';
import {Sidebar} from './sidebar';
import {Card} from './card';

export module TextHighlighter {

  import getAuracHighlightChildren = Sidebar.getAuracHighlightChildren;
  type chemicalFormula = {
    formulaNode: Element;
    formulaText: string;
  };

  const chemicalFormulae: chemicalFormula[] = [];
  const delimiters: string[] = ['(', ')', '\\n', '\'', '\"', ',', ';', '.', '-'];
  const noSpace = '';
  const space = ' ';

  export function wrapEntitiesWithHighlight(msg: any) {
    // document.head.appendChild(SidebarAnimations.newAuracStyleElement());
    // sort entities by length of entityText (descending) - this will ensure that we can capture e.g. VPS26A, which would not be
    // highlighted if VPS26 has already been highlighted, because the text VPS26A is now spread across more than one node
    msg.body.sort((a: Entity, b: Entity) => b.entityText.length - a.entityText.length)
      .map((entity: Entity) => {
        const selectors = getSelectors(entity.entityText);
        wrapChemicalFormulaeWithHighlight(entity);
        addHighlightAndEventListeners(selectors, entity);
      });
  }

  // Recursively find all text nodes which match regex
  export function allTextNodes(node: HTMLElement, textNodes: Array<string>) {
    if (!allowedTagType(node) || node.classList && node.classList.contains('aurac-sidebar')) {
      return;
    }

    // if the node contains any <sub> children concatenate the text content of its child nodes
    if (Array.from(node.childNodes).some(childNode => childNode.nodeName === 'SUB')) {
      let text = '';
      node.childNodes.forEach(childNode => text += childNode.textContent);
      // join text by stripping out any whitespace or return characters
      const formattedText = text.replace(/[\r\n\s]+/gm, '');
      // push chemical formula to textNodes to be NER'd
      textNodes.push(formattedText + '\n');
      chemicalFormulae.push({formulaNode: node, formulaText: formattedText});
      return;
    }

    try {
      node.childNodes.forEach(child => {
        const element = child as HTMLElement;
        if (isNodeAllowed(element)) {
          if (element.nodeType === Node.TEXT_NODE) {
            textNodes.push(element.textContent + '\n');
          } else if (!element.classList.contains('tooltipped') &&
            !element.classList.contains('tooltipped-click') &&
            !element.classList.contains('aurac-sidebar') &&
            element.style.display !== 'none') {
            allTextNodes(element, textNodes);
          }
        }
      });
    } catch (e) {
      // There are so many things that could go wrong.
      // The DOM is a wild west
      console.error(e);
    }
  }

  // Only allow nodes that we can traverse or add children to
  function isNodeAllowed(element: HTMLElement): boolean {
    return element.nodeType !== Node.COMMENT_NODE && element.nodeType !== Node.CDATA_SECTION_NODE
      && element.nodeType !== Node.PROCESSING_INSTRUCTION_NODE && element.nodeType !== Node.DOCUMENT_TYPE_NODE;
  }

  function allowedTagType(element: HTMLElement): boolean {
    return ![HTMLScriptElement,
      HTMLStyleElement,
      SVGElement,
      HTMLInputElement,
      HTMLButtonElement,
      HTMLAnchorElement,
    ].some(tag => element instanceof tag)
  }

  // TODO maybe remove this when we can select via data attribute?
  // Recursively find all text nodes which match entity
  function allDescendants(node: HTMLElement, elements: Array<Element>, entity: string) {
      if ((node && node.classList && node.classList.contains('aurac-sidebar')) || !allowedTagType(node)) {
        return;
      }
      try {
        node.childNodes.forEach(child => {
          const element = child as HTMLElement;
          if (isNodeAllowed(element) && element.nodeType === Node.TEXT_NODE) {
            if (textContainsTerm(element.nodeValue!, entity)) {
              elements.push(element);
            }
            // tslint:disable-next-line:max-line-length
          } else if (element.classList && !element.classList.contains('tooltipped')
            && !element.classList.contains('tooltipped-click')
            && element.style.display !== 'none') {
            allDescendants(element, elements, entity);
          }
        });
      } catch (e) {
        // There are so many things that could go wrong.
        // The DOM is a wild west
        console.error(e);
      }
    }

  // If a string contains at least one instance of a particular term between word boundaries then return true
// Can handle non latin unicode terms which at the moment JS Regex can't.
  function textContainsTerm(text: string, term: string): boolean {
    let currentText = '';
    const found: string[] = [];
    let foundTerm = false;
    // First check if the term is found within the entire string
    // If it does then step through the string 1 letter at a time until it matches the term.
    // Then check if the matched part is inside a word boundary.
    if (text.includes(term)) {
      text.split('').forEach(letter => {
        currentText += letter;
        if (currentText.includes(term) && !foundTerm) {
          const removeTermFromCurrentText: string = currentText.replace(term, '');
          // Find the remaining bit of text but also remove any line breaks from it
          const remainingText: string = text.slice(currentText.length);
          // We found the string but is it in the middle of something else like abcdMyString1234? ie is it a word boundary or not
          // or is it at the start or end of the string. If it's within a word boundary we don't want to highlight it. If however, it is
          // encapsulated by a special character delimiter then we do.
          if ((removeTermFromCurrentText === noSpace || removeTermFromCurrentText.charAt(removeTermFromCurrentText.length - 1)
            === space) && (remainingText.startsWith(space) || remainingText === noSpace)) {
            found.push(term);
            foundTerm = true;
          } else {
            delimiters.forEach((character) => {
              if (removeTermFromCurrentText.includes(character) ||
                remainingText.endsWith(character) ||
                remainingText.startsWith(character)) {
                found.push(term);
                foundTerm = true;
              }
            });
          }
          currentText = '';
        }
      });
      return !!found.length;
    }
    return false;
  }

  // TODO chemical class for stuff like this?
  function wrapChemicalFormulaeWithHighlight(entity: Entity) {
    for (const formula of chemicalFormulae) {
      const formulaNode = formula.formulaNode;
      if (formula.formulaText === entity.entityText) {
        try {
          const replacementNode = document.createElement('span');
          // Retrieves the specific highlight colour to use for this NER term
          replacementNode.innerHTML = highlightTerm(formulaNode.innerHTML, entity);
          // This new highlighted term will replace the current child (same term but with no highlight) of this parent element
          formulaNode.parentNode!.insertBefore(replacementNode, formulaNode);
          formulaNode.parentNode!.removeChild(formulaNode);
          const childValues = Sidebar.getAuracHighlightChildren(replacementNode);
          childValues.forEach(childValue => { // For each highlighted element, we will add an event listener to add it to our sidebar
            Card.populateEntityToOccurrences(entity.entityText, childValue);
            childValue.addEventListener('click', Sidebar.entityClickHandler(entity, replacementNode));
          });
        } catch (e) {
          console.error(e);
        }
      }
    }
  }

  // highlights a term by wrapping it an HTML span
  const highlightTerm = (term: string, entity: Entity) => `<span class="aurac-highlight" style="background-color: ${entity.recognisingDict.htmlColor};position: relative; cursor: pointer">${term}</span>`;

  function addHighlightAndEventListeners(selector: Element[], entity: Entity) {
    selector.map(element => {
      // Try/catch for edge cases.
      try {
        // For each term, we want to replace it's original HTML with a highlight colour
        const replacementNode = document.createElement('span');
        replacementNode.className = 'aurac-highlight';
        replacementNode.innerHTML = element.nodeValue!.split(entity.entityText).join(highlightTerm(entity.entityText, entity));

        // This new highlighted term will will replace the current child (same term but with no highlight) of this parent element.
        element.parentNode!.insertBefore(replacementNode, element);
        element.parentNode!.removeChild(element);

        // For each value we find that is a highlighted term, we want to add it to our sidebar and find its occurrences within the page
        const childValues = getAuracHighlightChildren(replacementNode);
        childValues.forEach(childValue => {
          Card.populateEntityToOccurrences(entity.entityText, childValue);
          childValue.addEventListener('click', Sidebar.entityClickHandler(entity, replacementNode));
        });
      } catch (e) {
        console.error(e);
      }
    });
  }

  function getSelectors(entity: string): Array<Element> {
    const allElements: Array<Element> = [];
    allDescendants(document.body, allElements, entity);
    return allElements;
  }
}
