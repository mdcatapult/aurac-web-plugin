(function () {

  console.log("script loaded");

  browser.runtime.onMessage.addListener((msg) => {
    switch (msg.type) {
      case 'get_page_contents':
        return Promise.resolve({type: 'leadmine', body: document.querySelector('body').outerHTML})
      case 'markup_page':
        addElementToHead(createFerretStyling());
        msg.body.entities.map((entity) => {
          const term = entity.entity.entityText;
          const info = {entityText: term, resolvedEntity: entity.entity.resolvedEntity};
          getSelectors(term)
            .map(selector => {
              const element = newElement(info);
              const node = document.querySelector(selector);
              node.innerHTML = node.innerHTML.replace(term, highlightTerm(term, entity.entity.recognisingDict.htmlColor));
              // ADD HIDDEN ELEMENTS TO THE DOM
              // addFerretElement(element, node);
              node.addEventListener("mouseenter", () => {
                addFerretElement(element, node);
              });
              node.addEventListener("mouseleave", () => {
                setTimeout(() => element.remove(), 5000);
              });
            });
        })
        break;
      default:
        throw new Error('Received unexpected message from plugin');
    }
  })

  // highlights a term by wrapping it an HTML span
  const highlightTerm = (term, colour) => `<span style="background-color: ${colour};position: relative;">${term}</span>`;

  // creates an HTML style element with basic styling for Ferret tooltip
  const createFerretStyling = () => {
    const styleElement = document.createElement("style");
    styleElement.innerHTML =
    `.ferret{
             color: black;
             font-family: Arial, sans-serif;
             font-size: 100%;
             background: rgb(192,192,192);
             transform: translate(0%, 50%);
             border: 2px solid #ffff00;
             padding: 10px;
             position: absolute;
             z-index: 10;
         }`
    return styleElement
  };

  // adds a passed HTML element to the head of a page
  // const addElementToHead = (element) => document.head.insertAdjacentHTML("beforeend", element);
  const addElementToHead = (element) => document.head.appendChild(element);

  // creates a new div with Leadmine entityText and resolvedEntity
  const newElement = (info) => {
    let div = document.createElement('div');
    div.className = 'ferret';
    div.insertAdjacentHTML('afterbegin', `<p>Term: ${info.entityText}</p>`);
    if (info.resolvedEntity) {
      div.insertAdjacentHTML('beforeend', `<p>Resolved entity: ${info.resolvedEntity}</p>`)
    }
    return div;
  }

  // adds a new element to the DOM as a child of the passed node
  const addFerretElement = (element, node) => {
    // remove any existing elements first
    const existingElements = document.getElementsByClassName('ferret')
    Array.from(existingElements).forEach(element => element.remove())
    node.appendChild(element);
  };

  const getSelectors = (entity) => {
    // Create regex for entity.
    const re = new RegExp(`\\b${entity}\\b`)

    // Get all nodes whose innerHTML contains the entity.
    const nodes = Array.from(document.querySelectorAll('body *:not(script)'))
      .filter(element => element.innerText && element.innerText.match(re))

    // Create an array of unique selectors for each node.
    const nodeSelectors = nodes.map(n => uniqueSelector(n))

    // Unset the selectors which are parents of other selectors in the array.
    for (let i = 0; i < nodes.length; i++) {
      const idx = nodeSelectors.indexOf(uniqueSelector(nodes[i].parentElement))
      if (idx > -1 || !nodes[i].parentElement) {
        nodeSelectors[idx] = undefined;
        nodes[idx] = undefined;
      }
    }

    // Return the selectors which are still defined.
    return nodeSelectors.filter(n => !!n)
  }

  const uniqueSelector = (node) => {
    if (!node) {
      return undefined
    }
    let selector = "";
    while (node.parentElement) {
      const siblings = Array.from(node.parentElement.children).filter(
        e => e.tagName === node.tagName
      );
      selector =
        (siblings.indexOf(node)
          ? `${node.tagName}:nth-of-type(${siblings.indexOf(node) + 1})`
          : `${node.tagName}`) + `${selector ? " > " : ""}${selector}`;
      node = node.parentElement;
    }
    return `html > ${selector.toLowerCase()}`;
  }

})()
