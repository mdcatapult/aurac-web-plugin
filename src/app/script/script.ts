(() => {
  type Information = {
    entityText: string,
    resolvedEntity: string,
    entityGroup: string,
    recognisingDict: {
      entityType: string,
      source: string,
    },
  };
  console.log('script loaded');
  const ferretSidebar = document.createElement('span');
  const buttonElement = document.createElement('button');
  ferretSidebar.appendChild(buttonElement);
  buttonElement.innerHTML = '&#10060';
  buttonElement.className = 'sidebar-button button';
  const sidebarTexts = document.createElement('div');
  ferretSidebar.appendChild(sidebarTexts);
  const sidebarArray: Information[] = [];

  buttonElement.addEventListener('click', () => {
    ferretSidebar.remove();
    document.body.style.width = '100vw';
    document.body.style.marginLeft = '0';
  });
  // @ts-ignore
  browser.runtime.onMessage.addListener((msg) => {

    document.body.style.width = '80vw';
    document.body.style.marginLeft = '20vw';
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
              replacementNode.innerHTML = element.nodeValue.replace(term, highlightTerm(term, entity));
              element.parentNode.insertBefore(replacementNode, element);
              element.parentNode.removeChild(element);
              const childValue = getFerretHighlightChildren(replacementNode);
              childValue[0].addEventListener('mouseenter', newFerretTooltip(entity, replacementNode));
              childValue[0].addEventListener('mouseleave', newFerretTooltip(entity, replacementNode));
            } catch (e) {
              console.error(e);
            }
          });
        });
        break;
      default:
        throw new Error('Received unexpected message from plugin');
    }
  });
  // highlights a term by wrapping it an HTML span
  const highlightTerm = (term, entity) => `<span class="ferret-highlight" style="background-color: ${entity.recognisingDict.htmlColor};position: relative;">${term}</span>`;

  // creates an HTML style element with basic styling for Ferret tooltip
  const newFerretStyleElement = () => {
    const styleElement = document.createElement('style');
    styleElement.innerHTML =
      `.ferret-sidebar {
        color: black;
        font-family: Arial, sans-serif;
        font-size: 14px;
        background: rgb(192,192,192);
        position: fixed;
        z-index: 10;
        height: 100vh;
        left: 0;
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
      position: relative;
      left: 88%;
     }`;
    return styleElement;
  };

  // returns an event listener which creates a new element with passed info and appends it to the passed element
  const newFerretTooltip = (info, element: Element) => {
    return (event) => {
      if (event.type !== 'mouseenter') {
        return;
      }
      Array.from(document.getElementsByClassName('ferret-tooltip')).forEach(tooltip => tooltip.remove());
      if (getFerretHighlightChildren(element).some(child => child.className === 'ferret-highlight')
        && element.parentElement.className === 'ferret-highlight') {
        removeEventListener('mouseenter', newFerretTooltip(info, element));
      }
      const highlightedIndex = sidebarArray.indexOf(sidebarArray.find(v => v.entityText === info.entityText));
      if (!sidebarArray.some(v => v.entityText === info.entityText)) {
        renderSidebar(info);
        sidebarArray.push(info);
      }
      sidebarTexts.getElementsByTagName('div').item(highlightedIndex).scrollIntoView({behavior: 'smooth'});
      setSidebarColors(highlightedIndex);
    };
  };

  function setSidebarColors(highlightedIndex: number): void {
    const textElements = sidebarTexts.getElementsByTagName('div');
    for (let i = 0; i < textElements.length; i++) {
      textElements[i].style.color = i === highlightedIndex ? 'blue' : 'black';
    }
  }

  // Creates a sidebar element presenting information.
  function renderSidebar(information: Information): void {
    const sidebarText = document.createElement('div');
    sidebarText.id = 'sidebar-text';
    sidebarText.style.border = '1px solid black';
    sidebarText.insertAdjacentHTML('afterbegin', `<p>Term: ${information.entityText}</p>`);
    if (information.resolvedEntity) {
      sidebarText.insertAdjacentHTML('beforeend', `<p>Resolved entity: ${information.resolvedEntity}</p>`);
    }
    sidebarText.insertAdjacentHTML('beforeend', `<p>Entity Group: ${information.entityGroup}</p>`);
    sidebarText.insertAdjacentHTML('beforeend', `<p>Entity Type: ${information.recognisingDict.entityType}</p>`);
    sidebarText.insertAdjacentHTML('beforeend', `<p>Dictionary Source: ${information.recognisingDict.source}</p>`);
    sidebarTexts.appendChild(sidebarText);
  }

  function getFerretHighlightChildren(element: Element): Element[] {
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
    try {
      node.childNodes.forEach(child => {
        const element = child as HTMLElement;
        if (allowedNodeType(element)) {
          if (element.nodeType === Node.TEXT_NODE) {
            textNodes.push(element.textContent + '\n');
            // tslint:disable-next-line:max-line-length
          } else if (!element.classList.contains('tooltipped') && !element.classList.contains('tooltipped-click') && element.style.display !== 'none') {
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
})();
