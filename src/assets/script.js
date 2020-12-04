(function () {

  console.log("script loaded");

  browser.runtime.onMessage.addListener((msg) => {
    console.log(msg);
    switch (msg.type) {
      case 'get_page_contents':
        return Promise.resolve({type: 'leadmine', body: document.querySelector('body').outerHTML})
      case 'markup_page':
        msg.body.entities.map((entity) => {
          const txt = entity.entity.entityText
          getSelectors(txt)
            .map(selector => {
              const element = newElement(txt);
              const node = document.querySelector(selector);
              node.innerHTML = node.innerHTML.replace(txt, createSpan(txt));
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

  const createSpan = (info) => `<span style="background-color: yellow;">${info}</span>`;

  // creates a new div with h1 element
  const newElement = (info) => {
    let elemDiv = document.createElement('div');
    elemDiv.id = 'parent';
    elemDiv.style.cssText = 'width:10%;height:10%;background:rgb(192,192,192);';
    elemDiv.style.position = 'absolute';
    elemDiv.style.left = '50%';
    elemDiv.style.top = '50%';
    elemDiv.style.transform = 'translate(-0%, -50%)';
    elemDiv.style.border = '5px solid #FFFF00';
    elemDiv.style.padding = '10px';
    elemDiv.style.zIndex = '10';
    elemDiv.insertAdjacentHTML('afterbegin', `<h1 style="position:absolute">${info}</h1><h1 style="position:absolute;top:1%;right:1%;cursor:pointer;" onclick="this.parentNode.parentNode.removeChild(this.parentNode)">x</h1>`);
    return elemDiv;
  }

  // adds a new element to the DOM
  const addElement = (element) => {
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
