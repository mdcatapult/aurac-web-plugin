(() => {

  console.log('script loaded');

  // @ts-ignore
  browser.runtime.onMessage.addListener((msg) => {
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
              replacementNode.addEventListener('mouseover', newFerretTooltip(entity, replacementNode));
              replacementNode.addEventListener('mouseenter', newFerretTooltip(entity, replacementNode));
              replacementNode.addEventListener('mouseleave', newFerretTooltip(entity, replacementNode));
              replacementNode.addEventListener('mouseout', newFerretTooltip(entity, replacementNode));
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
      `.ferret-tooltip {
        color: black;
        font-family: Arial, sans-serif;
        font-size: 100%;
        background: rgb(192,192,192);
        transform: translate(0%, 50%);
        border: 2px solid #ffff00;
        padding: 10px;
        position: absolute;
        z-index: 10;
        visibility: hidden;
    }

    .ferret-highlight:hover + span.ferret-tooltip{
        visibility: visible;
    }`;
    return styleElement;
  };

  // returns an event listener which creates a new element with passed info and appends it to the passed element
  const newFerretTooltip = (info, element) => {
    return (event) => {
      const span = document.createElement('span');
      span.className = 'ferret-tooltip';
      span.insertAdjacentHTML('afterbegin', `<p>Term: ${info.entityText}</p>`);
      if (info.resolvedEntity) {
        span.insertAdjacentHTML('beforeend', `<p>Resolved entity: ${info.resolvedEntity}</p>`);
      }
      span.insertAdjacentHTML('beforeend', `<p>Entity Group: ${info.entityGroup}</p>`);
      span.insertAdjacentHTML('beforeend', `<p>Entity Type: ${info.recognisingDict.entityType}</p>`);
      span.insertAdjacentHTML('beforeend', `<p>Dictionary Source: ${info.recognisingDict.source}</p>`);

      switch (event.type) {
        case 'mouseenter':
          element.appendChild(span);
          break;
        case 'mouseleave':
          const ferretToolTips = Array.from(document.getElementsByClassName('ferret-tooltip'));
          if (ferretToolTips) {
            ferretToolTips.forEach(ferretToolTip => {
              if (element.childNodes && Array.from(element.childNodes).includes(ferretToolTip)) {
                element.removeChild(ferretToolTip);
              }
            });
          }
          break;
      }
    };
  };

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
