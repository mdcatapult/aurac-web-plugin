(() => {
  type Information = {
    entityText: string,
    resolvedEntity: string,
    entityGroup: string,
    recognisingDict: {
      htmlColor: string,
      entityType: string,
      source: string,
    },
  };

  // provides a wrapper around Map<string, T>() to ensure key formatting
  class EntityMap<T> {
    private m = new Map<string, T>();

    set(entityText: string, value: T) {
      this.m.set(entityText.toLowerCase(), value);
    }

    has(text: string): boolean {
      return this.m.has(text.toLowerCase());
    }

    get(text: string): T {
      return this.m.get(text.toLowerCase());
    }

    values(): IterableIterator<T> {
      return this.m.values();
    }
  }

  console.log('script loaded');

  const auracSidebar = document.createElement('span');
  const buttonElement = document.createElement('button');

  const sidebarOpenScreenWidth = '80vw';
  const sidebarClosedScreenWidth = '100vw';
  let hasNERLookupOccurred = false;

  const collapseArrow = '&#60;';
  const expandArrow = '&#62;';
  const rightArrow = '&#8594';
  const leftArrow = '&#8592';
  const auracHighlightElements: Array<AuracHighlightHtmlColours> = [];

  auracSidebar.appendChild(buttonElement);
  const specialCharacters: string[] = ['(', ')', '\\n', '\'', '\"'];
  const noSpace = '';
  const space = ' ';

  auracSidebar.appendChild(buttonElement);
  buttonElement.innerHTML = collapseArrow;
  buttonElement.className = 'sidebar-button';
  buttonElement.id = 'button-id';
  auracSidebar.id = 'aurac-sidebar-id';
  document.body.id = 'body';

  let isExpanded = true;
  let isAppOpen = false;

  type ElementPropertiesType = {
    element: HTMLElement,
    position: {
      expanding: number,
      collapsing: number
    },
    property: 'left' | 'marginLeft' | 'width',
    isReversed?: boolean
  }[];

  const elementProperties: ElementPropertiesType =
    [
      {
        element: buttonElement,
        property: 'left',
        position: {
          expanding: 20,
          collapsing: 0
        },
      },
      {
        element: auracSidebar,
        property: 'left',
        position: {
          expanding: 0,
          collapsing: -21
        },
      },
      {
        element: document.body,
        property: 'width',
        position: {
          expanding: 80,
          collapsing: 100
        },
        isReversed: true,
      },
      {
        element: document.body,
        property: 'marginLeft',
        position: {
          expanding: 20,
          collapsing: 0
        },
      },
    ];

  type ArrowButtonProperties = {
    nerTerm: string,
    nerColor: string,
    positionInArray: number,
    isClicked: boolean,
  };

  // This class stores the HTML of all aurac-highlight elements before and after we change them. That way when they are no longer
  // highlighted by our search they can return to their original HTML state
  class AuracHighlightHtmlColours {
    index: number;
    elementName: Element;
    colourBefore: string;
    colourAfter: string;

    constructor(index: number, elementName: Element, colourBefore: string, colourAfter: string) {
      this.index = index;
      this.elementName = elementName;
      this.colourBefore = colourBefore;
      this.colourAfter = colourAfter;
    }
  }

  const sidebarTexts = document.createElement('div');
  auracSidebar.appendChild(sidebarTexts);
  const entityToDiv = new EntityMap<HTMLDivElement>();
  const entityToOccurrence = new EntityMap<Element[]>();
  buttonElement.addEventListener('click', () => {
    if (document.body.style.width === sidebarOpenScreenWidth || document.body.style.width === sidebarClosedScreenWidth) {
      animateElements(elementProperties);
    }
    buttonElement.innerHTML = isExpanded ? collapseArrow : expandArrow;
    document.head.appendChild(newAuracStyleElement());
  });

  // @ts-ignore

  browser.runtime.onMessage.addListener((msg) => {
    if (!isAppOpen && msg.type !== 'sidebar_rendered') {
      document.body.style.width = '80vw';
      document.body.style.marginLeft = '20vw';
      auracSidebar.className = 'aurac-sidebar';
      document.body.appendChild(auracSidebar);
      isAppOpen = true;
      document.head.appendChild(newAuracStyleElement());
    }
    switch (msg.type) {
      case 'get_page_contents':
        return new Promise(resolve => {
          const textNodes: Array<string> = [];
          allTextNodes(document.body, textNodes);
          resolve({type: 'leadmine', body: textNodes.join('\n')});
        });
      case 'markup_page':
        wrapChemicalFormulaWithHighlight(msg);
        break;
      case 'x-ref_result':
        setXRefHTML(msg.body);
        break;
      case 'toggle_sidebar':
        if (document.body.style.width === sidebarOpenScreenWidth || document.body.style.width === sidebarClosedScreenWidth) {
          animateElements(elementProperties);
          buttonElement.innerHTML = isExpanded ? collapseArrow : expandArrow;
        }
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

  function wrapChemicalFormulaWithHighlight(msg: any) {
    document.head.appendChild(newAuracStyleElement());
    msg.body.map((entity) => {
      const term = entity.entityText;
      const selectors = getSelectors(term);

      // if entity is a chemical formula, wrap innerHTML in highlight span and add event listener
      for (const formula of chemicalFormulae) {
        const formulaNode = formula.formulaNode;
        if (formula.formulaText === term) {
          try {
            const replacementNode = document.createElement('span');
            // Retrieves the specific highlight colour to use for this NER term
            replacementNode.innerHTML = highlightTerm(formulaNode.innerHTML, entity);
            // This new highlighted term will replace the current child (same term but with no highlight) of this parent element
            formulaNode.parentNode.insertBefore(replacementNode, formulaNode);
            formulaNode.parentNode.removeChild(formulaNode);
            const childValues = getAuracHighlightChildren(replacementNode);
            childValues.forEach(childValue => { // For each highlighted element, we will add an event listener to add it to our sidebar
              populateEntityToOccurrences(entity.entityText, childValue);
              childValue.addEventListener('mouseenter', populateAuracSidebar(entity, replacementNode));
            });
          } catch (e) {
            console.error(e);
          }
          // exit the loop as soon as we find a match
          break;
        }
      }
      addHighlightEventListeners(selectors, term, entity);
    });
  }

  function addHighlightEventListeners(selector: Element[], term: string, entity: Information) {
    selector.map(element => {
      // Try/catch for edge cases.
      try {
        // For each term, we want to replace it's original HTML with a highlight colour
        const replacementNode = document.createElement('span');
        replacementNode.innerHTML = element.nodeValue.replaceAll(term, highlightTerm(term, entity));

        // This new highlighted term will will replace the current child (same term but with no highlight) of this parent element.
        element.parentNode.insertBefore(replacementNode, element);
        element.parentNode.removeChild(element);

        // For each value we find that is a highlighted term, we want to add it to our sidebar and find its occurrences within the page
        const childValues = getAuracHighlightChildren(replacementNode);
        childValues.forEach(childValue => {
          populateEntityToOccurrences(entity.entityText, childValue);
          childValue.addEventListener('mouseenter', populateAuracSidebar(entity, replacementNode));
        });
      } catch (e) {
        console.error(e);
      }
    });
  }

  // highlights a term by wrapping it an HTML span
  const highlightTerm = (term, entity) => `<span class="aurac-highlight" style="background-color: ${entity.recognisingDict.htmlColor};position: relative;">${term}</span>`;

  // creates an HTML style element with basic styling for Aurac sidebar
  const newAuracStyleElement = () => {
    const styleElement = document.createElement('style');
    styleElement.innerHTML = `.aurac-sidebar {
        color: black;
        font-family: Arial, sans-serif;
        font-size: 14px;
        background: rgb(192,192,192);
        position: fixed;
        z-index: 10;
        height: 100vh;
        left: ${elementProperties.find(v => v.element === auracSidebar).position.expanding}vw;
        top: 0;
        width: 20vw;
        border-right: 2px solid black;
        padding: 5px;
        overflow-wrap: break-word;
        overflow-y: scroll;
    }
    .sidebar-button {
      color: black;
      background-color: rgb(192, 192, 192);
      position: fixed;
      left: ${elementProperties.find(v => v.element === buttonElement).position.expanding}vw;
      top: 50%;
     }
     .left-arrow-button {
      color: black;
      background-color: rgb(192, 192, 192);
      order: 1;
      padding: 5px;
     }
     .right-arrow-button {
      color: black;
      background-color: rgb(192, 192, 192);
      order: 2;
      padding: 5px;
     }
     .arrow-buttons {
     display: flex;
     justify-content: flex-end;
     flex-direction: row;
     }`;
    return styleElement;
  };

  // This function will animate the sidebar opening and closing
  function animateElements(element: ElementPropertiesType): void {
    element.forEach(elementProperty => {
      let id = null;
      // If the sidebar is currently open, then it will keep moving until it has reached its target position, otherwise
      // It will keep closing until it has reached its closed position
      let pos = isExpanded ? elementProperty.position.expanding : elementProperty.position.collapsing;
      const target = isExpanded ? elementProperty.position.collapsing : elementProperty.position.expanding;
      const elementDistanceSpeed = 0.5;
      id = setInterval(frame, 1);
      // The frame function is used to animate the sidebar moving in and out. setInterval will call this function every seconds/ms
      // depending on what number you pass to it
      function frame() {
        if (pos === target) { // If the position is equal to its target then it has reached its new position and should stop moving
          clearInterval(id); // We reset the timer of the element back to nothing when its reached its target
        } else {
          if (!elementProperty.isReversed) { // The 'isReversed' boolean relates to the document body width, as the sidebar expands
            // on the screen, the width of the document body needs to contract and vice versa
            pos = isExpanded ? pos + elementDistanceSpeed : pos - elementDistanceSpeed;
          } else { // The elementDistanceSpeed is how much the element will move by within this timeframe
            pos = isExpanded ? pos - elementDistanceSpeed : pos + elementDistanceSpeed;
          }
          elementProperty.element.style[elementProperty.property] = pos + 'vw'; // Moves the respective element by a directional property
        }
      }
    });
    isExpanded = !isExpanded;
  }

  // returns an event listener which creates a new element with passed info and appends it to the passed element
  const populateAuracSidebar = (info: Information, element: Element) => {
    return (event) => {
      if (event.type !== 'mouseenter') {
        return;
      }
      if (getAuracHighlightChildren(element).some(child => child.className === 'aurac-highlight')
        && element.parentElement.className === 'aurac-highlight') {
        removeEventListener('mouseenter', populateAuracSidebar(info, element));
      } else {
        if (!entityToDiv.has(info.entityText)) {
          entityToDiv.set(info.entityText, renderSidebarElement(info));
          // @ts-ignore
          browser.runtime.sendMessage({type: 'compound_x-refs', body: [info.entityText, info.resolvedEntity]})
            .catch(e => console.error(e));
        }
      }
      const div = entityToDiv.get(info.entityText);
      if (div) {
        div.scrollIntoView({behavior: 'smooth'});
        setSidebarColors(div);
      }
    };
  };

  function setSidebarColors(highlightedDiv: HTMLDivElement): void {
    Array.from(entityToDiv.values()).forEach(div => {
      div.style.border = div === highlightedDiv ? '2px white solid' : '1px black solid';
    });
  }

  // Creates a sidebar element presenting information.
  function renderSidebarElement(information: Information): HTMLDivElement {
    const sidebarText: HTMLDivElement = document.createElement('div');
    renderArrowButtonElements(sidebarText, information);
    renderOccurrenceCounts(sidebarText, information);

    sidebarText.id = 'sidebar-text';
    sidebarText.style.border = '1px solid black';
    sidebarText.style.padding = '2px';
    sidebarText.style.marginBottom = '5px';
    sidebarText.style.backgroundColor = information.recognisingDict.htmlColor;

    sidebarText.insertAdjacentHTML('beforeend', `<p>Term: ${information.entityText}</p>`);
    if (information.resolvedEntity) {
      sidebarText.insertAdjacentHTML('beforeend', `<p>Resolved entity: ${information.resolvedEntity}</p>`);

      if (information.entityGroup === 'Gene or Protein') {
        const geneNameLink = createGeneNameLink(information.resolvedEntity);
        sidebarText.insertAdjacentHTML('beforeend', geneNameLink);
      }
    }

    sidebarText.insertAdjacentHTML('beforeend', `<p>Entity Type: ${information.recognisingDict.entityType}</p>`);

    const xrefHTML = document.createElement('div');
    xrefHTML.className = information.entityText;
    sidebarText.appendChild(xrefHTML);
    sidebarTexts.appendChild(sidebarText);
    return sidebarText;
  }

  function populateEntityToOccurrences(entityText: string, occurrence: Element): void {
    if (!entityToOccurrence.has(entityText)) {
      entityToOccurrence.set(entityText, [occurrence]);
    } else {
      entityToOccurrence.get(entityText).push(occurrence);
    }
  }

  function renderOccurrenceCounts(sidebarText: HTMLDivElement, information: Information): void {
    const entityText = information.entityText;
    const occurrenceElement = document.createElement('span');
    occurrenceElement.id = `${entityText}-occurrences`;
    occurrenceElement.style.display = 'flex';
    occurrenceElement.style.justifyContent = 'flex-end';

    occurrenceElement.innerText = `${entityToOccurrence.get(entityText).length} matches found`;
    sidebarText.appendChild(occurrenceElement);
  }

  function renderArrowButtonElements(sidebarText: HTMLDivElement, information: Information): void {
    const arrowFlexProperties: HTMLDivElement = document.createElement('div');
    arrowFlexProperties.className = 'arrow-buttons';
    sidebarText.appendChild(arrowFlexProperties);

    const leftArrowButtonElement = document.createElement('button');
    leftArrowButtonElement.innerHTML = leftArrow;
    leftArrowButtonElement.className = 'left-arrow-button';
    arrowFlexProperties.appendChild(leftArrowButtonElement);

    const rightArrowButtonElement = document.createElement('button');
    rightArrowButtonElement.innerHTML = rightArrow;
    rightArrowButtonElement.className = 'right-arrow-button';
    arrowFlexProperties.appendChild(rightArrowButtonElement);

    const arrowProperties: ArrowButtonProperties = {
      nerTerm: information.entityText, nerColor: information.recognisingDict.htmlColor, positionInArray: 0, isClicked: false
    };

    leftArrowButtonElement.addEventListener('click', () => {
      pressArrowButton(arrowProperties, 'left');
    });

    rightArrowButtonElement.addEventListener('click', () => {
      pressArrowButton(arrowProperties, 'right');
    });
  }

  function pressArrowButton(arrowProperties: ArrowButtonProperties, direction: 'left' | 'right'): void {
    Array.from(entityToOccurrence.values()).forEach(entity => {
      entity.forEach(occurrence => setHtmlColours(occurrence));
    });

    if (direction === 'right') {
      if (arrowProperties.positionInArray >= entityToOccurrence.get(arrowProperties.nerTerm).length - 1) {
        // gone off the end of the array - reset
        arrowProperties.positionInArray = 0;
      } else if (arrowProperties.isClicked) {
        arrowProperties.positionInArray++;
      }
    } else if (arrowProperties.positionInArray > 0) { // direction is 'left'
      arrowProperties.positionInArray--;
    }

    setNerHtmlColours(entityToOccurrence.get(arrowProperties.nerTerm));

    const targetElement = entityToOccurrence.get(arrowProperties.nerTerm)[arrowProperties.positionInArray];
    targetElement.scrollIntoView({behavior: 'smooth'});

    setHtmlColours(targetElement);

    const occurrencesElement = document.getElementById(`${arrowProperties.nerTerm}-occurrences`);
    occurrencesElement.innerText = `${arrowProperties.positionInArray + 1} / ${entityToOccurrence.get(arrowProperties.nerTerm).length}`;
    arrowProperties.isClicked = true;
  }

  function setNerHtmlColours(highlightedNerTerms: Element[]): void {
    highlightedNerTerms.forEach(element => {
      const index = highlightedNerTerms.indexOf(element);
      const elementName = element;
      const colourBefore = element.innerHTML;
      const colourAfter = element.textContent.fontcolor('blue');
      const nerHtmlColour = new AuracHighlightHtmlColours(index, elementName, colourBefore, colourAfter);
      auracHighlightElements.push(nerHtmlColour);
    });
  }

  function setHtmlColours(nerElement: Element): void {
    const auracHighlightArray = Array.from(auracHighlightElements);
    auracHighlightArray.forEach(element => {
      element.elementName.innerHTML = element.elementName === nerElement ? element.colourAfter : element.colourBefore;
    });
  }

  // if the entity group is 'Gene or Protein' add a genenames url link to the sidebarText element
  function createGeneNameLink(resolvedEntity: string): string {
    const id = resolvedEntity.split(':').pop();
    const geneNameUrl = `https://www.genenames.org/data/gene-symbol-report/#!/hgnc_id/${id}`;
    return `<p id=${geneNameUrl}>Genenames link: <a href=${geneNameUrl} target="_blank">${geneNameUrl}</a></p>`;
  }

  function setXRefHTML(xrefs: { databaseName: string, url: string, compoundName: string }[]): void {
    Array.from(document.getElementsByClassName(xrefs[0] ? xrefs[0].compoundName : '')).forEach(element => element.innerHTML = '');
    xrefs.forEach(xref => {
      const xrefElement = document.getElementsByClassName(xref.compoundName).item(0);
      xrefElement.innerHTML += `<p> ${xref.databaseName}: <a href=${xref.url} target="_blank">${xref.url}</a></p>`;
    });
  }

  function getAuracHighlightChildren(element: Element) {
    return Array.from(element.children).filter(child => child.className === 'aurac-highlight');
  }

  const getSelectors = (entity) => {
    const allElements: Array<Element> = [];
    allDescendants(document.body, allElements, entity);
    return allElements;
  };

  // Recursively find all text nodes which match entity
  function allDescendants(node: HTMLElement, elements: Array<Element>, entity: string) {
    if ((node && node.classList.contains('aurac-sidebar')) || !allowedTagType(node)) {
      return;
    }
    try {
      node.childNodes.forEach(child => {
        const element = child as HTMLElement;
        if (allowedNodeType(element)) {
          if (element.nodeType === Node.TEXT_NODE) {
            if (textContainsTerm(element.nodeValue, entity)) {
              elements.push(element);
            }
            // tslint:disable-next-line:max-line-length
          } else if (!element.classList.contains('tooltipped') && !element.classList.contains('tooltipped-click') && element.style.display !== 'none') {
            allDescendants(element, elements, entity);
          }
        }
      });
    } catch (e) {
      // There are so many things that could go wrong.
      // The DOM is a wild west
      console.error(e);
    }
  }

  // chemical formulae use <sub> tags, the content of which needs to be extracted and concatenated to form a complete formula which can
  // be sent to be NER'd.  This type enables the mapping of a chemical formula to its parent node so that the entire formula
  // (which is split across several nodes in the DOM) can be highlighted
  type chemicalFormula = {
    formulaNode: Element;
    formulaText: string;
  };

  const chemicalFormulae: chemicalFormula[] = [];

  // Recursively find all text nodes which match regex
  function allTextNodes(node: HTMLElement, textNodes: Array<string>) {
    if (!allowedTagType(node) || node.classList.contains('aurac-sidebar')) {
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
        if (allowedNodeType(element)) {
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
  const allowedNodeType = (element: HTMLElement): boolean => {
    return element.nodeType !== Node.COMMENT_NODE && element.nodeType !== Node.CDATA_SECTION_NODE
      && element.nodeType !== Node.PROCESSING_INSTRUCTION_NODE && element.nodeType !== Node.DOCUMENT_TYPE_NODE;
  };

  const forbiddenTags = [HTMLScriptElement,
    HTMLStyleElement,
    SVGElement,
    HTMLInputElement,
    HTMLButtonElement];

  const allowedTagType = (element: HTMLElement): boolean => !forbiddenTags.some(tag => element instanceof tag);

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
          // encapsulated by a special character then we do.
          if ((removeTermFromCurrentText === noSpace || removeTermFromCurrentText.charAt(removeTermFromCurrentText.length - 1)
            === space) && (remainingText.startsWith(space) || remainingText === noSpace)) {
            found.push(term);
            foundTerm = true;
          } else {
            specialCharacters.forEach((character) => {
              if (removeTermFromCurrentText.includes(character) || remainingText.endsWith(character)) {
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
  }
})();
