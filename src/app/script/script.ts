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

  // provides a wrapper around Map<string, HTMLDivElement>() to ensure key formatting
  class EntityToDiv {
    private m = new Map<string, HTMLDivElement>();

    set(text: string, html: HTMLDivElement) {
      this.m.set(text.toLowerCase(), html);
    }

    has(text: string): boolean {
      return this.m.has(text.toLowerCase());
    }

    get(text: string): HTMLDivElement {
      return this.m.get(text.toLowerCase());
    }

    values(): IterableIterator<HTMLDivElement> {
      return this.m.values();
    }
  }

  console.log('script loaded');

  const ferretSidebar = document.createElement('span');
  const buttonElement = document.createElement('button');

  const collapseArrow = '&#60;';
  const expandArrow = '&#62;';
  const rightArrow = '&#8594';
  const leftArrow = '&#8592';
  let htmlColoursSet = false;
  const ferretHighlightElements: Array<FerretHighlightHtmlColours> = [];

  ferretSidebar.appendChild(buttonElement);
  buttonElement.innerHTML = collapseArrow;
  buttonElement.className = 'sidebar-button';
  buttonElement.id = 'button-id';
  ferretSidebar.id = 'ferret-sidebar-id';
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
        element: ferretSidebar,
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

  // This class stores the properties of each button as well as their respective highlighted elements, how many of that element there are
  // and the current position of it that the user is searching for
  class NERArrowButtonProperties {
    nerElements: Array<Element> = [];
    nerTerm: string;
    positionInArray = 0;
    scrollTermIntoView = 0;
    firstClick = true;
    leftButtonClicked: boolean;
    rightButtonClicked: boolean;
    nerColour: string;

    constructor(nerTerm, nerColour) {
      this.nerTerm = nerTerm;
      this.nerColour = nerColour;
    }

    leftButtonAlterIndex(): void {
      if (this.leftButtonClicked && this.scrollTermIntoView !== 0) { // If we've clicked the left button and
        // were not on the beginning element perform these actions. We would get an array OOB exception without this
        this.scrollTermIntoView--;
      }
      scrollNerIntoView(this);
    }

    rightButtonAlterIndex(endOfTerms): void {
      // When we have reached the end of the NER terms, on right button click we reset back to the beginning term within the array
      if (this.scrollTermIntoView === endOfTerms) {
        this.scrollTermIntoView = 0;
        scrollNerIntoView(this);
      }
      // If we clicked the right button perform these actions
      else if (this.firstClick) { // On first click we cannot increment the array position as we want to see the value at index 0
        scrollNerIntoView(this);
        this.firstClick = false; // Need to set this to false so we don't keep duplicating NER elements inside array
      } else { // If we have already clicked an arrow button once then increment the array and display the ner term on screen
        this.scrollTermIntoView++;
        scrollNerIntoView(this);
      }
    }
  }

  // This class stores the HTML of all ferret-highlight elements before and after we change them. That way when they are no longer
  // highlighted by our search they can return to their original HTML state
  class FerretHighlightHtmlColours {
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
  ferretSidebar.appendChild(sidebarTexts);
  const entityToDiv = new EntityToDiv();
  buttonElement.addEventListener('click', () => {
    animateElements(elementProperties);
    isExpanded = !isExpanded;
    buttonElement.innerHTML = isExpanded ? collapseArrow : expandArrow;

    document.head.appendChild(newFerretStyleElement());
  });

  // @ts-ignore

  browser.runtime.onMessage.addListener((msg) => {
    if (!isAppOpen) {
      document.body.style.width = '80vw';
      document.body.style.marginLeft = '20vw';
      isAppOpen = true;
    }
    document.head.appendChild(newFerretStyleElement());
    ferretSidebar.className = 'ferret-sidebar';
    document.body.appendChild(ferretSidebar);

    switch (msg.type) {
      case 'get_page_contents':
        return new Promise((resolve, reject) => {
          const textNodes: Array<string> = [];
          allTextNodes(document.body, textNodes);
          resolve({type: 'leadmine', body: textNodes.join('\n')});
        });
      case 'markup_page':
        document.head.appendChild(newFerretStyleElement());
        msg.body.map((entity) => {
          const term = entity.entityText;
          const sel = getSelectors(term);
          sel.map(element => {
            // Try/catch for edge cases.
            try {
              const replacementNode = document.createElement('span');
              replacementNode.innerHTML = element.nodeValue.replaceAll(term, highlightTerm(term, entity));
              element.parentNode.insertBefore(replacementNode, element);
              element.parentNode.removeChild(element);
              const childValues = getFerretHighlightChildren(replacementNode);
              childValues.forEach(childValue => childValue.addEventListener('mouseenter', populateFerretSidebar(entity, replacementNode)));
            } catch (e) {
              console.error(e);
            }
          });
        });
        break;
      case 'x-ref_result':
        setXRefHTML(msg.body);
        break;
      default:
        throw new Error('Received unexpected message from plugin');
    }
  });

  // highlights a term by wrapping it an HTML span
  const highlightTerm = (term, entity) => `<span class="ferret-highlight" style="background-color: ${entity.recognisingDict.htmlColor};position: relative;">${term}</span>`;

  // creates an HTML style element with basic styling for Ferret sidebar
  const newFerretStyleElement = () => {
    const styleElement = document.createElement('style');
    styleElement.innerHTML = `.ferret-sidebar {
        color: black;
        font-family: Arial, sans-serif;
        font-size: 14px;
        background: rgb(192,192,192);
        position: fixed;
        z-index: 10;
        height: 100vh;
        left: ${elementProperties.find(v => v.element === ferretSidebar).position.expanding}vw;
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
     .right-arrow-button {
      color: black;
      background-color: rgb(192, 192, 192);
      position: absolute;
      top: 0;
      left: 92%;
      padding: 5px;
     }
     .left-arrow-button {
      color: black;
      background-color: rgb(192, 192, 192);
      position: absolute;
      top: 0;
      left: 84%;
      padding: 5px`;
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
      // The frame function is used to animate the sidebar moving in and out. setInvertal will call this function every seconds/ms
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
  }

  // returns an event listener which creates a new element with passed info and appends it to the passed element
  const populateFerretSidebar = (info: Information, element: Element) => {
    return (event) => {
      if (event.type !== 'mouseenter') {
        return;
      }
      if (getFerretHighlightChildren(element).some(child => child.className === 'ferret-highlight')
        && element.parentElement.className === 'ferret-highlight') {
        removeEventListener('mouseenter', populateFerretSidebar(info, element));
      } else {
        if (!entityToDiv.has(info.entityText)) {
          entityToDiv.set(info.entityText, renderSidebarElement(info));
          // @ts-ignore
          browser.runtime.sendMessage({type: 'compound_x-refs', body: [info.entityText, info.resolvedEntity]});
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
    // If the parent element is relative and its children are position absolute. They will be positioned based on the parents location.
    sidebarText.style.position = 'relative';
    renderArrowButtonElements(sidebarText, information);

    sidebarText.id = 'sidebar-text';
    sidebarText.style.border = '1px solid black';
    sidebarText.style.padding = '2px';
    sidebarText.style.marginBottom = '5px';
    sidebarText.style.backgroundColor = information.recognisingDict.htmlColor;
    sidebarText.insertAdjacentHTML('afterbegin', `<p>Term: ${information.entityText}</p>`);

    if (information.resolvedEntity) {
      sidebarText.insertAdjacentHTML('beforeend', `<p>Resolved entity: ${information.resolvedEntity}</p>`);

      if (information.entityGroup === 'Gene or Protein') {
        const geneNameLink = createGeneNameLink(information.resolvedEntity);
        sidebarText.insertAdjacentHTML('beforeend', geneNameLink);
      }
    }

    sidebarText.insertAdjacentHTML('beforeend', `<p>Entity Group: ${information.entityGroup}</p>`);
    sidebarText.insertAdjacentHTML('beforeend', `<p>Entity Type: ${information.recognisingDict.entityType}</p>`);
    sidebarText.insertAdjacentHTML('beforeend', `<p>Dictionary Source: ${information.recognisingDict.source}</p>`);

    const xrefHTML = document.createElement('div');
    xrefHTML.className = information.entityText;
    sidebarText.appendChild(xrefHTML);
    sidebarTexts.appendChild(sidebarText);
    return sidebarText;
  }

  function renderArrowButtonElements(sidebarText: HTMLDivElement, information: Information): void {
    const rightArrowButtonElement = document.createElement('button');
    sidebarText.appendChild(rightArrowButtonElement);
    rightArrowButtonElement.innerHTML = rightArrow;
    rightArrowButtonElement.className = 'right-arrow-button';

    const leftArrowButtonElement = document.createElement('button');
    sidebarText.appendChild(leftArrowButtonElement);
    leftArrowButtonElement.innerHTML = leftArrow;
    leftArrowButtonElement.className = 'left-arrow-button';

    const nerTerm = information.entityText;
    const nerColour = information.recognisingDict.htmlColor;
    const arrowProperties = new NERArrowButtonProperties(nerTerm, nerColour);

    leftArrowButtonElement.addEventListener('click', () => {
      arrowProperties.leftButtonClicked = true;
      arrowProperties.rightButtonClicked = false;
      pressArrowButton(arrowProperties);
    });

    rightArrowButtonElement.addEventListener('click', () => {
      arrowProperties.rightButtonClicked = true;
      arrowProperties.leftButtonClicked = false;
      pressArrowButton(arrowProperties);
    });
  }

  function pressArrowButton(arrowProperties: NERArrowButtonProperties): void {
    const endOfTerms = arrowProperties.nerElements.length - 1;
    const highlightedNerTerms: HTMLCollectionOf<Element> = document.getElementsByClassName('ferret-highlight');
    // Scan the document body for NER terms that match with the term we are looking for, if there is a match then add the elements with that
    // term to our array. We only want to add the NER elements to the array on the first click. Otherwise we would keep adding them to the
    // array everytime we clicked an arrow button
    const ferretHighlightArray = Array.from(highlightedNerTerms);
    ferretHighlightArray.forEach((element, index) => {
      if (element.textContent === arrowProperties.nerTerm && arrowProperties.firstClick) {
        arrowProperties.nerElements[arrowProperties.positionInArray] = ferretHighlightArray[index];
        arrowProperties.positionInArray++;
      }
    });
    setNerHtmlColours(highlightedNerTerms);
    if (arrowProperties.leftButtonClicked) {
      arrowProperties.leftButtonAlterIndex();
    } else if (arrowProperties.rightButtonClicked) {
      arrowProperties.rightButtonAlterIndex(endOfTerms);
    }
  }

  function scrollNerIntoView(arrowProperties: NERArrowButtonProperties): void {
    const currentNerElement = arrowProperties.nerElements[arrowProperties.scrollTermIntoView];
    currentNerElement.scrollIntoView({behavior: 'smooth'});
    setHtmlColours(currentNerElement);
  }

  function setNerHtmlColours(highlightedNerTerms: HTMLCollectionOf<Element>): void {
    if (!htmlColoursSet) {
      const ferretHighlightArray = Array.from(highlightedNerTerms);
      ferretHighlightArray.forEach(element => {
        const index = ferretHighlightArray.indexOf(element);
        const elementName = element;
        const colourBefore = element.innerHTML;
        const colourAfter = element.textContent.fontcolor('blue');
        const nerHtmlColour = new FerretHighlightHtmlColours(index, elementName, colourBefore, colourAfter);
        ferretHighlightElements.push(nerHtmlColour);
      });
    }
    htmlColoursSet = true;
  }

  function setHtmlColours(nerElement: Element): void {
    const ferretHighlightArray = Array.from(ferretHighlightElements);
    ferretHighlightArray.forEach(element => {
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

  function getFerretHighlightChildren(element: Element) {
    return Array.from(element.children).filter(child => child.className === 'ferret-highlight');
  }

  const getSelectors = (entity) => {
    // Create regex for entity.
    const re = new RegExp(`\\b${entity}\\b`);
    const allElements: Array<Element> = [];
    allDescendants(document.body, allElements, re);
    return allElements;
  };

  // Recursively find all text nodes which match regex
  function allDescendants(node: HTMLElement, elements: Array<Element>, re: RegExp) {
    if ((node && node.classList.contains('ferret-sidebar')) || !allowedTagType(node)) {
      return;
    }
    try {
      node.childNodes.forEach(child => {
        const element = child as HTMLElement;
        if (allowedNodeType(element)) {
          if (element.nodeType === Node.TEXT_NODE) {
            if (element.nodeValue.match(re)) {
              elements.push(element);
            }
            // tslint:disable-next-line:max-line-length
          } else if (!element.classList.contains('tooltipped') && !element.classList.contains('tooltipped-click') && element.style.display !== 'none') {
            allDescendants(element, elements, re);
          }
        }
      });
    } catch (e) {
      // There are so many things that could go wrong.
      // The DOM is a wild west
      console.error(e);
    }
  }

  // Recursively find all text nodes which match regex
  function allTextNodes(node: HTMLElement, textNodes: Array<string>) {
    if (!allowedTagType(node)) {
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

})();
