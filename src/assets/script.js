(function () {

  console.log("script loaded");

  browser.runtime.onMessage.addListener((msg) => {
    console.log(msg);
    switch (msg.type) {
      case 'get_page_contents':
        return Promise.resolve({type: 'leadmine', body: document.querySelector('body').outerHTML})
      case 'markup_page':
        msg.body.entities.map((entity) => {
          const term = entity.entity.entityText;
          const info = {entityText: term, resolvedEntity: entity.entity.resolvedEntity};
          getSelectors(term)
            .map(selector => {
              const element = newElement(info);
              const node = document.querySelector(selector);
              node.innerHTML = node.innerHTML.replace(term, highlightTerm(term, entity.entity.recognisingDict.htmlColor));
              node.addEventListener("mouseenter", (event) => {
                addElement(element, node);
              });
              node.addEventListener("mouseleave", (event) => {
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


  // creates a new div with Leadmine entityText and resolvedEntity
  const newElement = (info) => {
    let div = document.createElement('div');
    div.id = 'ferret';
    // div.style.cssText = 'width:15%;height:5%;background:rgb(192,192,192);';
    div.style.cssText = 'background:rgb(192,192,192);';
    // position element relative to highlighted term
    div.style.transform = 'translate(0%, 50%)';
    div.style.border = '2px solid #FFFF00';
    div.style.padding = '10px';
    div.style.position = 'absolute';
    // set z-index to 10 to ensure element is always on top
    div.style.zIndex = '10';
    div.display = 'flex';
    div.display.justifyContent = 'space-between';
    // insert inner HTML elements
    div.insertAdjacentHTML('afterbegin', `<p>Term: ${info.entityText}</p>`);
    if (info.resolvedEntity) div.insertAdjacentHTML('beforeend', `<p>Resolved entity: ${info.resolvedEntity}</p>`)
    return div;
  }

  // adds a new element to the DOM as a child of the passed node
  const addElement = (element, node) => {
    // remove old element first
    const el = document.getElementById('ferret');
    console.log(el);
   if (el) el.remove();
    console.log(el);
    node.appendChild(element);
    console.log(el);
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
