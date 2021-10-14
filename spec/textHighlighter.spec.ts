import {TextHighlighter} from '../src/content-script/textHighlighter';
import {setup} from './util';
import {Entity} from '../src/content-script/types';

describe('textContainsTerm', () => {

    const terms = ['protein', 'Glucans biosynthesis protein D']

    terms.forEach(term => {
      it('returns true given the same text and term', () => {
        let result = TextHighlighter.textContainsTerm(term, term)
        expect(result).toBe(true);
      });

      it('returns false given the term isnt the same as the text', () => {
        let result = TextHighlighter.textContainsTerm('term', term)
        expect(result).toBe(false);
      });

      it('returns true given multiple terms which are surrounded by whitespace within text', () => {
        let result = TextHighlighter.textContainsTerm(` ${term} ${term} ${term} `, term)
        expect(result).toBe(true);
      });

      it('returns false given there is whitespace within a term', () => {
        let result = TextHighlighter.textContainsTerm('pro tein', term)
        expect(result).toBe(false);
      });

      it('returns false given there is a space within the text', () => {
        let result = TextHighlighter.textContainsTerm(' ', term)
        expect(result).toBe(false);
      });

      it('returns false given there is empty text', () => {
        let result = TextHighlighter.textContainsTerm('', term)
        expect(result).toBe(false);
      });

      it('returns false given a term enclosed in characters which are not whitespace or delimiters', () => {
        let result = TextHighlighter.textContainsTerm(`text${term}text`, term)
        expect(result).toBe(false);
      });

      it('returns false given a term at the end of text and not preceded by whitespace', () => {
        let result = TextHighlighter.textContainsTerm(`text${term}`, term)
        expect(result).toBe(false);
      });

      it('returns true given a term at the end of text and preceded by whitespace', () => {
        let result = TextHighlighter.textContainsTerm(`text ${term}`, term)
        expect(result).toBe(true);
      });

      it('returns false given a term at the start of text and not followed by whitespace', () => {
        let result = TextHighlighter.textContainsTerm(`${term}text`, term)
        expect(result).toBe(false);
      });

      it('returns true given a term at the start of text and followed by whitespace', () => {
        let result = TextHighlighter.textContainsTerm(`${term} text`, term)
        expect(result).toBe(true);
      });

      it('returns true given a text preceding term ends with delimiter and text following term starts with whitespace', () => {
        TextHighlighter.delimiters.forEach(delimiter => {
          let result = TextHighlighter.textContainsTerm(`text${delimiter}${term} text`, term)
          expect(result).toBe(true);
        })
      });

      it('returns true given a text preceding term ends with delimiter and term is at end of text', () => {
        TextHighlighter.delimiters.forEach(delimiter => {
          let result = TextHighlighter.textContainsTerm(`text${delimiter}${term}`, term)
          expect(result).toBe(true);
        })
      });

      it('returns true given a text starts and ends with the same delimiter', () => {
        TextHighlighter.delimiters.forEach(delimiter => {
          let result = TextHighlighter.textContainsTerm(`${delimiter}${term}${delimiter}`, term)
          expect(result).toBe(true);
        })
      });

      it('returns true given a text starts and ends with different delimiters', () => {
        let result = TextHighlighter.textContainsTerm(`(${term})`, term)
        expect(result).toBe(true);
      })

      it('returns true given a text following a term starts with delimiter and text preceding term ends with whitespace', () => {
        TextHighlighter.delimiters.forEach(delimiter => {
          let result = TextHighlighter.textContainsTerm(` ${term}${delimiter} `, term)
          expect(result).toBe(true);
        })
      });

      it('returns true given a text following a term starts with delimiter and term is at start of text', () => {
        TextHighlighter.delimiters.forEach(delimiter => {
          let result = TextHighlighter.textContainsTerm(`${term}${delimiter}information`, term)
          expect(result).toBe(true);
        })
      });
    })
  }
)


describe('allTextNodes', () => {

  let document: Document;
  let textNodes: Array<string>;

  beforeAll(() => {
    document = setup([])
  })

  beforeEach(() => {
    textNodes = []
  })


  it('given text nodes array should populate when child node has a sub tag type', () => {
    const parentNodeElement = document.createElement('div');
    const subNodeElement = document.createElement('sub')
    parentNodeElement.appendChild(subNodeElement)

    TextHighlighter.allTextNodes(parentNodeElement, textNodes)

    expect(textNodes.length).toBe(1)
  })


  it('given text nodes array should contain correctly reconstructed chemical formula', () => {
    const parentNodeElement = document.createElement('div');
    const subNodeElement = document.createElement('span')
    subNodeElement.innerHTML = `C<sub>17</sub>H<sub>25</sub>Br<sub>2</sub>NO<sub>2</sub>`
    parentNodeElement.appendChild(subNodeElement)

    TextHighlighter.allTextNodes(parentNodeElement, textNodes)

    expect(textNodes[0]).toEqual('C17H25Br2NO2')
  })

  it('given text nodes array should populate when child node has text node type', () => {
    const parentNodeElement = document.createElement('div');
    const textNode = document.createTextNode('textNode')
    parentNodeElement.appendChild(textNode)

    TextHighlighter.allTextNodes(parentNodeElement, textNodes)

    expect(textNodes.length).toBe(1)
  })

  it('given text nodes array should not populate when child node has a comment node type', () => {
    const nodeElement = document.createElement('div')
    const commentNode = document.createComment('commentNode')
    nodeElement.appendChild(commentNode)

    TextHighlighter.allTextNodes(nodeElement, textNodes)

    expect(textNodes.length).toBe(0)
  })

  it('given text nodes array should not populate when child node has a processing instruction node type', () => {
    const parentElement = document.createElement('div')
    const processingInstructionNode = document.createProcessingInstruction('test', 'test')
    parentElement.appendChild(processingInstructionNode)

    TextHighlighter.allTextNodes(parentElement, textNodes)

    expect(textNodes.length).toBe(0)
  })

  it('given text nodes array should remain empty when passed node is a script element', () => {
    const parentElement = document.createElement('div')
    const scriptElement = document.createElement('script')
    parentElement.appendChild(scriptElement)

    TextHighlighter.allTextNodes(parentElement, textNodes)

    expect(textNodes.length).toBe(0)
  })

  it('given text nodes array should remain empty when passed node is a style element', () => {
    const parentElement = document.createElement('div')
    const styleElement = document.createElement('style')
    parentElement.appendChild(styleElement)

    TextHighlighter.allTextNodes(parentElement, textNodes)

    expect(textNodes.length).toBe(0)
  })

  it('given text nodes array should remain empty when passed node is an SVG element', () => {
    const parentElement = document.createElement('div')
    const svgElement = document.createElement('svg')
    parentElement.appendChild(svgElement)

    TextHighlighter.allTextNodes(parentElement, textNodes)

    expect(textNodes.length).toBe(0)
  })

  it('given text nodes array should remain empty when passed node is an input element', () => {
    const parentElement = document.createElement('div')
    const inputElement = document.createElement('input')
    parentElement.appendChild(inputElement)

    TextHighlighter.allTextNodes(parentElement, textNodes)

    expect(textNodes.length).toBe(0)
  })

  it('given text nodes array should remain empty when passed node is a button element', () => {
    const parentElement = document.createElement('div')
    const buttonElement = document.createElement('button')
    parentElement.appendChild(buttonElement)

    TextHighlighter.allTextNodes(parentElement, textNodes)

    expect(textNodes.length).toBe(0)
  })

  it('given text nodes array should remain empty when passed node is an anchor element', () => {
    const parentElement = document.createElement('div')
    const anchorElement = document.createElement('anchor')
    parentElement.appendChild(anchorElement)

    TextHighlighter.allTextNodes(parentElement, textNodes)

    expect(textNodes.length).toBe(0)
  })

  it('given text nodes array should not populate text nodes array with sidebar element', () => {
    const parentElement = document.createElement('div')
    const sidebarElement = document.createElement('span')
    sidebarElement.textContent = 'something'
    sidebarElement.className = 'aurac-sidebar'
    parentElement.appendChild(sidebarElement)

    TextHighlighter.allTextNodes(parentElement, textNodes)

    expect(textNodes.length).toBe(0)
  })

  it('given text next nodes should not populate text nodes array with hidden element', () => {
    const parentElement = document.createElement('div')
    const hiddenElement = document.createElement('p')
    hiddenElement.textContent = 'something'
    hiddenElement.style.display = 'none'
    parentElement.appendChild(hiddenElement)

    TextHighlighter.allTextNodes(parentElement, textNodes)

    expect(textNodes.length).toBe(0)
  })

  it('given text nodes array should not populate text nodes array with element of tooltipped class', () => {
    const parentElement = document.createElement('div')
    const hiddenElement = document.createElement('p')
    hiddenElement.textContent = 'something'
    hiddenElement.className = 'tooltipped'
    parentElement.appendChild(hiddenElement)

    TextHighlighter.allTextNodes(parentElement, textNodes)

    expect(textNodes.length).toBe(0)
  })

  it('given text nodes array should not populate text nodes array with element of tooltipped-click class', () => {
    const parentElement = document.createElement('div')
    const hiddenElement = document.createElement('p')
    hiddenElement.textContent = 'something'
    hiddenElement.className = 'tooltipped-click'
    parentElement.appendChild(hiddenElement)

    TextHighlighter.allTextNodes(parentElement, textNodes)

    expect(textNodes.length).toBe(0)
  })
})


describe('allDescendants', () => {

  let document: Document;
  let elements: Array<Element>;

  beforeAll(() => {
    document = setup([])
  })

  beforeEach(() => {
    elements = []
  })

  it('returns array length of 1 when populating elements array with a single valid descendant', () => {
    const parentElement = document.createElement('div')
    const textElement = document.createElement('p')
    textElement.textContent = 'protein'
    parentElement.appendChild(textElement)

    TextHighlighter.allDescendants(parentElement, elements, 'protein')

    expect(elements.length).toBe(1);
  })

  it('should populate elements array with a couple of valid descendants', () => {
    const parentElement = document.createElement('div')
    const textElement = document.createElement('p')
    textElement.textContent = 'protein'
    const childElement = document.createElement('p')
    childElement.textContent = 'protein'

    textElement.appendChild(childElement)
    parentElement.appendChild(textElement)

    TextHighlighter.allDescendants(parentElement, elements, 'protein')

    expect(elements.length).toBe(2);
  })

  it('should populate elements array with descendants which are allowed', () => {
    const parentElement = document.createElement('div')
    const textElement = document.createElement('p')
    textElement.textContent = 'protein'
    const childElement = document.createElement('p')
    childElement.textContent = 'protein'
    const grandchildElement = document.createElement('p')

    parentElement.appendChild(textElement)
    textElement.appendChild(childElement)
    childElement.appendChild(grandchildElement)

    TextHighlighter.allDescendants(parentElement, elements, 'protein')

    expect(elements.length).toBe(2);
  })

  it('should populate elements array with descendants which are text nodes and term is within text', () => {
    const parentElement = document.createElement('div')
    const textNode = document.createTextNode('protein')

    parentElement.appendChild(textNode)

    TextHighlighter.allDescendants(parentElement, elements, 'protein')

    expect(elements.length).toBe(1);
  })

  it('should ignore descendants of class aurac-sidebar', () => {
    const parentElement = document.createElement('div')
    parentElement.className = 'aurac-sidebar'
    const textElement = document.createElement('p')
    textElement.textContent = 'protein'

    parentElement.appendChild(textElement)

    TextHighlighter.allDescendants(parentElement, elements, 'protein')

    expect(elements.length).toBe(0);
  })

  it('should ignore descendants of class tooltipped', () => {
    const parentElement = document.createElement('div')
    parentElement.className = 'tooltipped'
    const textElement = document.createElement('p')
    textElement.textContent = 'protein'

    parentElement.appendChild(textElement)

    TextHighlighter.allDescendants(parentElement, elements, 'protein')

    expect(elements.length).toBe(0);
  })
})

it('should remove highlights when we call removeHighlights method', () => {
    let document: Document;
    document = setup([])

    let highlightElement = document.createElement('div')
    highlightElement.className = TextHighlighter.highlightClass
    document.body.appendChild(highlightElement)

    const numberOfHighlights = Array.from(document.getElementsByClassName(TextHighlighter.highlightClass)).length
    const numberOfElements = Array.from(document.body.children).length
    TextHighlighter.removeHighlights()
    const numberOfElementsAfter = Array.from(document.body.children).length

    expect(numberOfElementsAfter).toBe(numberOfElements - numberOfHighlights)
})

describe('elementHasHighlightParents', () => {

  let document: Document;
  beforeAll(() => {
    document = setup([])
  })

  it('returns true if direct parent of passed element is an aurac highlight', () => {
    const parentElement = document.createElement('div')
    parentElement.className = TextHighlighter.highlightClass
    const childElement = document.createElement('p')
    parentElement.appendChild(childElement)

    expect(TextHighlighter.elementHasHighlightedParents(childElement)).toBe(true)
  })

  it('returns true if grandparent of passed element is an aurac highlight', () => {
    const grandParentElement = document.createElement('div')
    grandParentElement.className = TextHighlighter.highlightClass
    const parentElement = document.createElement('div')
    grandParentElement.appendChild(parentElement)
    const childElement = document.createElement('p')
    parentElement.appendChild(childElement)

    expect(TextHighlighter.elementHasHighlightedParents(childElement)).toBe(true)
  })

  it('returns false if passed element has no aurac highlight parent', () => {
    const grandParentElement = document.createElement('div')
    const parentElement = document.createElement('div')
    grandParentElement.appendChild(parentElement)
    const childElement = document.createElement('p')
    parentElement.appendChild(childElement)

    expect(TextHighlighter.elementHasHighlightedParents(childElement)).toBe(false)
  })
})

it('should highlight an entity when we call addHighlightAndEventListeners method', () => {
    const document = setup([])
    const elementToBeHighlighted = document.createElement('p')
    elementToBeHighlighted.id = 'elementToBeHighlighted'
    elementToBeHighlighted.textContent = 'protein'
    document.body.appendChild(elementToBeHighlighted)
    const entity: Entity = {
      entityText: 'protein',
      resolvedEntity: '',
      entityGroup: '',
      recognisingDict: {
        entityType: '',
        htmlColor: '',
        source: ''
      }
    }
    TextHighlighter.addHighlightAndEventListeners([elementToBeHighlighted.firstChild as HTMLElement], entity)
    expect(document.getElementsByClassName(TextHighlighter.highlightParentClass).length).toBe(1)
    expect(document.getElementsByClassName(TextHighlighter.highlightClass).length).toBe(1)
})

describe('getHighlightContent', () => {

  it('should return textContent of an aurac highlight', () => {
    const auracHighlightElement = document.createElement('span')
    auracHighlightElement.className = 'aurac-highlight'
    auracHighlightElement.textContent =  'Salicylic Acid Acetate'

    expect(TextHighlighter.getHighlightContent(auracHighlightElement)).toBe('Salicylic Acid Acetate')
  })

  it('should return the value of a highlighted HTML input element', () => {
    const auracHighlightElement = document.createElement('span')
    auracHighlightElement.className = 'aurac-highlight'

    const inputElement = document.createElement('input')
    inputElement.value = 'CC(=O)Oc1ccccc1C(=O)O'

    auracHighlightElement.appendChild(inputElement)

    expect(TextHighlighter.getHighlightContent(auracHighlightElement)).toBe('CC(=O)Oc1ccccc1C(=O)O')
  })

})