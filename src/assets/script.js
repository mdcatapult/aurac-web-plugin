(function () {

  console.log("script loaded");

  browser.runtime.onMessage.addListener((msg) => {
    console.log(msg);
    switch (msg.type) {
      case 'get_page_contents':
        return Promise.resolve({type: 'leadmine', body: document.querySelector('body').outerHTML})
      case 'markup_page':
        msg.body.entities.map((entity) => {
          const txt = entity.entity.entityText;
          let info = {entityText: txt, resolvedEntity: entity.entity.resolvedEntity};
          getSelectors(txt)
            .map(selector => {
              const element = newElement(info);
              const node = document.querySelector(selector);
              node.innerHTML = node.innerHTML.replace(txt, createSpan(txt, entity.entity.recognisingDict.htmlColor));
              node.addEventListener("mouseenter", (event) => {
                addElement(element);
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

  const createSpan = (term, colour) => `<span style="background-color: ${colour};">${term}</span>`;

  // creates a new div with h1 elements
  const newElement = (info) => {
    // create div
    let div = document.createElement('div');
    // add styling
    div.style.cssText = 'width:15%;height:5%;background:rgb(192,192,192);';
    div.style.position = 'absolute';
    div.style.left = '50%';
    div.style.top = '50%';
    div.style.transform = 'translate(-0%, -50%)';
    div.style.border = '5px solid #FFFF00';
    div.style.padding = '10px';
    div.style.zIndex = '10';
    div.display = 'flex';
    div.display.justifyContent = 'space-between';
    // div.display.alignItems = 'center';
    // insert inner HTML elements
    div.insertAdjacentHTML('afterbegin', `
        <h5>Term: ${info.entityText}</h5>
        <h5 style="position:absolute;top:1%;right:1%;cursor:pointer;" onclick="this.parentNode.parentNode.removeChild(this.parentNode)">x</h5>
    `);
    if (info.resolvedEntity) div.insertAdjacentHTML('beforeend', `<h5>Resolved entity: ${info.resolvedEntity}</h5>`)
    return div;
  }

  // adds a new element to the DOM
  const addElement = (element) => {
    console.log(this.parentNode + "     PARENT NODE");
    window.document.body.insertBefore(element, window.document.body.lastChild);
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
