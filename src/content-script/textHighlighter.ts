import {chemicalFormula, Entity, ChemblRepresentations} from './types';
import {Sidebar} from './sidebar';
import {Card} from './card';
import {ChEMBL} from './chembl';
import tippy from 'tippy.js';
// import 'tippy.js/dist/tippy.css';
// Error: ./node_modules/tippy.js/dist/tippy.css
// Module build failed (from ./node_modules/@angular-devkit/build-angular/node_modules/postcss-loader/dist/cjs.js):
// SyntaxError
//
// (1:1) /home/nick.etherington@medcat.local/Workspace/Ferret/ferret-browser-plugin/node_modules/tippy.js/dist/tippy.css Unknown word
//
// > 1 | import api from "!../../style-loader/dist/runtime/injectStylesIntoStyleTag.js";
// | ^
// 2 |             import content from "!!../../css-loader/dist/cjs.js??ref--19-1!./tippy.css";
// 3 |
//
// @ ./src/content-script/textHighlighter.ts 5:0-33
// @ ./src/content-script/browser.ts
// @ ./src/content-script/script.ts



export module TextHighlighter {

  const chemicalFormulae: chemicalFormula[] = [];
  const highlightClass = 'aurac-highlight';
  const highlightParentClass = 'aurac-highlight-parent';

  export function wrapEntitiesWithHighlight(msg: any) {

    // get InChI, InChIKey and SMILES input elements if we are on ChEMBL
    let chemblRepresentations: ChemblRepresentations;
    if (ChEMBL.isChemblPage()) {
      chemblRepresentations = ChEMBL.createChemblRepresentationsObject();
    }

    // sort entities by length of entityText (descending) - this will ensure that we can capture e.g. VPS26A, which would not be
    // highlighted if VPS26 has already been highlighted, because the text VPS26A is now spread across more than one node
    msg.body.sort((a: Entity, b: Entity) => b.entityText.length - a.entityText.length)
      .map((entity: Entity) => {

        const selectors = getSelectors(entity.entityText);
        wrapChemicalFormulaeWithHighlight(entity);
        addHighlightAndEventListeners(selectors, entity);
        if (ChEMBL.isChemblPage()) {
          ChEMBL.highlightHandler(entity, chemblRepresentations)
        }
        // add tooltip
        // N.B. styling dos not work - issue with css import above and webpack
        tippy('.aurac-highlight', {
          content: entity.entityText,
        })

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

  const delimiters: string[] = ['(', ')', '\\n', '\"', '\'', '\\', ',', ';', '.', '!'];

  // Returns true if a string contains at least one instance of a particular term between word boundaries, i.e. not immediately
  // followed or preceded by either a non white-space character or one of the special characters in the delimiters array.
  // Can handle non latin unicode terms which at the moment JS Regex can't.
  function textContainsTerm(text: string, term: string): boolean {
    const startsWithWhiteSpaceRegex = /^\s+.*/;
    const endsWithWhiteSpaceRegex = /.*\s+$/;
    let currentText = '';
    const found: string[] = [];
    let foundTerm = false;

    // First check if the term is found within the entire string.
    // If it does then step through the string 1 letter at a time until it matches the term.
    // Then check if the matched part is inside a word boundary.
    if (text.includes(term)) {
      text.split('').forEach((letter) => {
        currentText += letter;
        if (currentText.includes(term) && !foundTerm) {
          const textPrecedingTerm: string = currentText.replace(term, '');

          // Find the remaining bit of text but also remove any line breaks from it
          const textFollowingTerm: string = text.slice(currentText.length);

          // We found the string but is it in the middle of something else like abcdMyString1234? i.e. is it a word boundary or not
          // or is it at the start or end of the string. If it's within a word boundary we don't want to highlight it.
          if ((!!textPrecedingTerm.match(endsWithWhiteSpaceRegex) || !textPrecedingTerm.length) &&
            (!!textFollowingTerm.match(startsWithWhiteSpaceRegex) || !textFollowingTerm.length)) {
            found.push(term);
            foundTerm = true;
          } else {
            // If however the term is encapsulated by a special character delimiter then we do want to highlight it.
            delimiters.forEach((character) => {
              if ((textPrecedingTerm.endsWith(character) &&
                  (!!textFollowingTerm.match(startsWithWhiteSpaceRegex) ||
                    !textFollowingTerm.length ||
                    textFollowingTerm.startsWith(character) ||
                    // catch a case where we have a different delimiter at the end of the term, e.g. a term between parentheses
                    delimiters.includes(textFollowingTerm.charAt(0))))
                ||
                (textFollowingTerm.startsWith(character) &&
                  (!!textPrecedingTerm.match(endsWithWhiteSpaceRegex) ||
                    !textPrecedingTerm.length ||
                    textPrecedingTerm.endsWith(character) ||
                    // catch a case where we have a different delimiter at the end of the term, e.g. a term between parentheses
                    delimiters.includes(textPrecedingTerm.charAt(textPrecedingTerm.length - 1))))) {
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

  function addEventListeners(term: Element, highlightedTerm: HTMLSpanElement, entity: Entity) {
    // highlighted term will replace the current child (same term but with no highlight) of the parent element
    term.parentNode!.insertBefore(highlightedTerm, term);
    term.parentNode!.removeChild(term);
    const childValues = Sidebar.getAuracHighlightChildren(highlightedTerm);
    // For each highlighted element, we will add an event listener to add it to our sidebar
    childValues.filter(child => {
      return !elementHasHighlightedParents(child)
    }).forEach(childValue => {
      Card.populateEntityToOccurrences(entity.entityText, childValue);
      childValue.addEventListener('click', Sidebar.entityClickHandler(entity, highlightedTerm));
      // TODO: add hover event listener here
    });
  }

  // TODO chemical class for stuff like this?
  function wrapChemicalFormulaeWithHighlight(entity: Entity) {
    for (const formula of chemicalFormulae) {
      const formulaNode = formula.formulaNode;
      if (formula.formulaText === entity.entityText) {
        try {
          const replacementNode = document.createElement('span');
          // the span needs a class so that it can be deleted by the removeHighlights function
          replacementNode.className = highlightClass;
          // Retrieves the specific highlight colour to use for this NER term
          replacementNode.innerHTML = highlightTerm(formulaNode.innerHTML, entity);
          addEventListeners(formulaNode, replacementNode, entity);
        } catch (e) {
          console.error(e);
        }
      }
    }
  }

  // highlights a term by wrapping it an HTML span
  const highlightTerm = (term: string, entity: Entity) => {
    return `<span class="aurac-highlight" style="background-color: ${entity.recognisingDict.htmlColor};position: relative; cursor: pointer">${term}</span>`;
  };

  function addHighlightAndEventListeners(selector: Element[], entity: Entity) {
    selector.map(element => {
      // Try/catch for edge cases.
      try {
        // For each term, we want to replace its original HTML with a highlight colour
        const replacementNode = document.createElement('span');
        // the span needs a class so that it can be deleted by the removeHighlights function
        replacementNode.className = highlightParentClass;
        replacementNode.innerHTML = element.nodeValue!.split(entity.entityText).join(highlightTerm(entity.entityText, entity));
        addEventListeners(element, replacementNode, entity);
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

  export function removeHighlights() {
    Array.from(document.getElementsByClassName(highlightParentClass))
      .concat(Array.from(document.getElementsByClassName(highlightClass)))
      .forEach(element => {
        const childNodes = Array.from(element.childNodes);
        element.replaceWith(...childNodes);
      });
  }

  function elementHasHighlightedParents(entity: Element): boolean {
    const parent = entity.parentElement
    const grandparent = parent?.parentElement
    return !!(parent?.classList.contains(highlightClass) || grandparent?.classList.contains(highlightClass))
  }
}
