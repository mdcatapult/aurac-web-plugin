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
              replacementNode.addEventListener('mouseenter', newFerretTooltip(entity, replacementNode));
              replacementNode.addEventListener('mouseleave', newFerretTooltip(entity, replacementNode));
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

  // removes ferret highlight
  const unHighlightTerm = (node) => {
    // create new span element without any styling
    const span = document.createElement('span');
    span.innerHTML = node.children[0].innerHTML;
    // replace the ferret highlight span with the new 'unhighlighted' one
    node.replaceChild(span, node.children[0]);
  };

  // creates an HTML style element with basic styling for Ferret tooltip
  const newFerretStyleElement = () => {
    const styleElement = document.createElement('style');
    styleElement.innerHTML =
      `.ferret-tooltip {
        color: black;
        font-family: Arial, sans-serif;
        font-size: 14px;
        background: rgb(192,192,192);
        transform: translate(0%, 50%);
        border: 2px solid #ffff00;
        padding: 10px;
        position: absolute;
        z-index: 10;
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
          element.childNodes.forEach(childNode => {
            if (childNode.className === 'ferret-highlight' && childNode.childNodes[0].children) {
              childNode.firstChild.firstChild.removeEventListener('mouseenter', newFerretTooltip);
              childNode.firstChild.firstChild.removeEventListener('mouseleave', newFerretTooltip);
              childNode.firstChild.removeEventListener('mouseenter', newFerretTooltip);
              childNode.firstChild.removeEventListener('mouseleave', newFerretTooltip);
              unHighlightTerm(childNode.firstChild);
              // span is altered correctly after unHiglightTerm, but still getting overlapping tooltips
              // if we return here we get a single tooltip, but only on the inner match
              // return;
              Array.from(document.getElementsByClassName('ferret-tooltip')).forEach(tooltip => tooltip.remove());
            }
            element.appendChild(span);
          });
          break;
        case 'mouseleave':
          // remove ALL ferret tooltips - this catches a case such as 'Glucans biosynthesis protein D' in which both the full term and
          // 'protein' are recognised entities after NER'ing the page
          Array.from(document.getElementsByClassName('ferret-tooltip')).forEach(tooltip => tooltip.remove());
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
