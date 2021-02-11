(() => {

  console.log('script loaded');

  // @ts-ignore
  browser.runtime.onMessage.addListener((msg) => {
    switch (msg.type) {
      case 'get_page_contents':
        return Promise.resolve({type: 'leadmine', body: document.querySelector('body').outerHTML});
      case 'markup_page':
        document.head.appendChild(newFerretStyleElement());
        msg.body.map((entity) => {
          const term = entity.entityText;
          const info = {entityText: term, resolvedEntity: entity.resolvedEntity};
          const sel = getSelectors(term);
          sel.map(element => {
              // Try/catch for edge cases.
              try {
                const replacementNode = document.createElement('span');
                replacementNode.innerHTML = element.nodeValue.replace(term, highlightTerm(term, entity));
                element.parentNode.insertBefore(replacementNode, element);
                element.parentNode.removeChild(element);
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
  const highlightTerm = (term, entity) => {
    const entityHtml = newFerretTooltip(entity).outerHTML;
    const highlightSpan = `<span class="ferret-highlight" style="background-color: ${entity.recognisingDict.htmlColor};position: relative;">${term}</span>` + entityHtml;
    return highlightSpan;
  };

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

  // creates a new div with Leadmine entityText and resolvedEntity
  const newFerretTooltip = (info) => {
    const div = document.createElement('span');
    div.className = 'ferret-tooltip';
    div.insertAdjacentHTML('afterbegin', `<p>Term: ${info.entityText}</p>`);
    if (info.resolvedEntity) {
      div.insertAdjacentHTML('beforeend', `<p>Resolved entity: ${info.resolvedEntity}</p>`);
    }
    return div;
  };

  const getSelectors = (entity) => {
    // Create regex for entity.
    const re = new RegExp(`\\b${entity}\\b`);
    const allElements: Array<Element> = [];
    allDescendants(document.body, allElements, re);
    return allElements;
  };

  const uniqueSelector = (node: Element) => {
    if (!node) {
      return undefined;
    }
    let selector = '';
    while (node.parentElement) {
      const siblings: Array<Element> = Array.from(node.parentElement.children).filter(
        (e: HTMLElement) => e.tagName === node.tagName
      );
      selector =
        (siblings.indexOf(node)
          ? `${node.tagName}:nth-of-type(${siblings.indexOf(node) + 1})`
          : `${node.tagName}`) + `${selector ? ' > ' : ''}${selector}`;
      node = node.parentElement;
    }
    return `html > ${selector.toLowerCase()}`;
  };

  const parentHasClass = (element , className: string) => {
    if (element.className && element.className.split('').indexOf(className) >= 0 ) { return true; }
    return element.parentNode && parentHasClass(element.parentNode, className);
  };

  // Recursively find all text nodes which match regex
  function allDescendants(node: HTMLElement, elements: Array<Element>, re: RegExp) {
    node.childNodes.forEach(child => {
      const element = child as HTMLElement;
      if (element.nodeType === Node.TEXT_NODE) {
        if (element.nodeValue.match(re)) {
          elements.push(element);
        }
      } else if (!element.classList.contains('tooltipped') && !element.classList.contains('tooltipped-click') && element.style.display !== 'none') {
        allDescendants(element, elements, re);
      }
    });
  }

})();
