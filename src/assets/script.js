(function(){

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
              })
              }
            );
        })
        break;
      default:
        throw new Error('Received unexpected message from plugin');
    }
  })

  const createSpan = (info) => `<span style="background-color: yellow;">${info}</span>`;


  // create a new element
  const newElement = (info) => {
    console.log("newElement called with " + info)
    let elemDiv = document.createElement('div');
    elemDiv.style.cssText = 'width:25%;height:25%;background:rgb(192,192,192);';
    elemDiv.insertAdjacentHTML('afterbegin',`<h1>${info}</h1>`);
    return elemDiv;
  }

  // add a new element to the DOM
  const addElement = (element) => {
    window.document.body.insertBefore(element, window.document.body.lastChild);
  }


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
