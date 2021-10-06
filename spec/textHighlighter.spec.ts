import {TextHighlighter} from '../src/content-script/textHighlighter';
import * as Util from 'util';
import {setup} from './util';

describe('textContainsTerm', () => {

    const terms = ['protein', 'Glucans biosynthesis protein D']

    terms.forEach(term => {
      it('term is text', () => {
        let result = TextHighlighter.textContainsTerm(term, term)
        expect(result).toBe(true);
      });

      it('term not in text', () => {
        let result = TextHighlighter.textContainsTerm('term', term)
        expect(result).toBe(false);
      });

      it('multiple terms surrounded by whitespace within text', () => {
        let result = TextHighlighter.textContainsTerm(` ${term} ${term} ${term} `, term)
        expect(result).toBe(true);
      });

      it('whitespace within term', () => {
        let result = TextHighlighter.textContainsTerm('pro tein', term)
        expect(result).toBe(false);
      });

      it('empty text', () => {
        let result = TextHighlighter.textContainsTerm(' ', term)
        expect(result).toBe(false);
      });

      it('term enclosed in characters which are not whitespace or delimiters', () => {
        let result = TextHighlighter.textContainsTerm(`text${term}text`, term)
        expect(result).toBe(false);
      });

      it('term at the end of text and not preceded by whitespace', () => {
        let result = TextHighlighter.textContainsTerm(`text${term}`, term)
        expect(result).toBe(false);
      });

      it('term at the end of text and preceded by whitespace', () => {
        let result = TextHighlighter.textContainsTerm(`text ${term}`, term)
        expect(result).toBe(true);
      });

      it('term at the start of text and not followed by whitespace', () => {
        let result = TextHighlighter.textContainsTerm(`${term}text`, term)
        expect(result).toBe(false);
      });

      it('term at the start of text and followed by whitespace', () => {
        let result = TextHighlighter.textContainsTerm(`${term} text`, term)
        expect(result).toBe(true);
      });

      it('text preceding term ends with delimiter and text following term starts with whitespace', () => {
        TextHighlighter.delimiters.forEach(delimiter => {
          let result = TextHighlighter.textContainsTerm(`text${delimiter}${term} text`, term)
          expect(result).toBe(true);
        })
      });

      it('text preceding term ends with delimiter and term is at end of text', () => {
        TextHighlighter.delimiters.forEach(delimiter => {
          let result = TextHighlighter.textContainsTerm(`text${delimiter}${term}`, term)
          expect(result).toBe(true);
        })
      });

      it('text starts and ends with the same delimiter', () => {
        TextHighlighter.delimiters.forEach(delimiter => {
          let result = TextHighlighter.textContainsTerm(`${delimiter}${term}${delimiter}`, term)
          expect(result).toBe(true);
        })
      });

      it('text starts and ends with different delimiters', () => {
        let result = TextHighlighter.textContainsTerm(`(${term})`, term)
        expect(result).toBe(true);
      })

      it('text following term starts with delimiter and text preceding term ends with whitespace', () => {
        TextHighlighter.delimiters.forEach(delimiter => {
          let result = TextHighlighter.textContainsTerm(` ${term}${delimiter} `, term)
          expect(result).toBe(true);
        })
      });

      it('text following term starts with delimiter and term is at start of text', () => {
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


  it('text nodes array should populate when child node has a sub tag type', () => {
    const parentNodeElement = document.createElement('div');
    const subNodeElement = document.createElement('sub')
    parentNodeElement.appendChild(subNodeElement)

    TextHighlighter.allTextNodes(parentNodeElement, textNodes)

    expect(textNodes.length).toBe(1)
  })


  it('text nodes array should contain correctly reconstructed chemical formula', () => {
    const parentNodeElement = document.createElement('div');
    const subNodeElement = document.createElement('span')
    subNodeElement.innerHTML = `C<sub>17</sub>H<sub>25</sub>Br<sub>2</sub>NO<sub>2</sub>`
    parentNodeElement.appendChild(subNodeElement)

    TextHighlighter.allTextNodes(parentNodeElement, textNodes)

    expect(textNodes[0]).toEqual('C17H25Br2NO2\n')
  })

  it('text nodes array should populate when child node has text node type', () => {
    const parentNodeElement = document.createElement('div');
    const textNode = document.createTextNode('textNode')
    parentNodeElement.appendChild(textNode)

    TextHighlighter.allTextNodes(parentNodeElement, textNodes)

    expect(textNodes.length).toBe(1)
  })

  it('text nodes array should not populate when child node has a comment node type', () => {
    const nodeElement = document.createElement('div')
    const commentNode = document.createComment('commentNode')
    nodeElement.appendChild(commentNode)

    TextHighlighter.allTextNodes(nodeElement, textNodes)

    expect(textNodes.length).toBe(0)
  })

  it('text nodes array should not populate when child node has a processing instruction node type', () => {
    const parentElement = document.createElement('div')
    const processingInstructionNode = document.createProcessingInstruction('test', 'test')
    parentElement.appendChild(processingInstructionNode)

    TextHighlighter.allTextNodes(parentElement, textNodes)

    expect(textNodes.length).toBe(0)
  })

  it('text nodes array should remain empty when passed node is a script element', () => {
    const parentElement = document.createElement('div')
    const scriptElement = document.createElement('script')
    parentElement.appendChild(scriptElement)

    TextHighlighter.allTextNodes(parentElement, textNodes)

    expect(textNodes.length).toBe(0)
  })

  it('text nodes array should remain empty when passed node is a style element', () => {
    const parentElement = document.createElement('div')
    const styleElement = document.createElement('style')
    parentElement.appendChild(styleElement)

    TextHighlighter.allTextNodes(parentElement, textNodes)

    expect(textNodes.length).toBe(0)
  })

  it('text nodes array should remain empty when passed node is an SVG element', () => {
    const parentElement = document.createElement('div')
    const svgElement = document.createElement('svg')
    parentElement.appendChild(svgElement)

    TextHighlighter.allTextNodes(parentElement, textNodes)

    expect(textNodes.length).toBe(0)
  })

  it('text nodes array should remain empty when passed node is an input element', () => {
    const parentElement = document.createElement('div')
    const inputElement = document.createElement('input')
    parentElement.appendChild(inputElement)

    TextHighlighter.allTextNodes(parentElement, textNodes)

    expect(textNodes.length).toBe(0)
  })

  it('text nodes array should remain empty when passed node is a button element', () => {
    const parentElement = document.createElement('div')
    const buttonElement = document.createElement('button')
    parentElement.appendChild(buttonElement)

    TextHighlighter.allTextNodes(parentElement, textNodes)

    expect(textNodes.length).toBe(0)
  })

  it('text nodes array should remain empty when passed node is an anchor element', () => {
    const parentElement = document.createElement('div')
    const anchorElement = document.createElement('anchor')
    parentElement.appendChild(anchorElement)

    TextHighlighter.allTextNodes(parentElement, textNodes)

    expect(textNodes.length).toBe(0)
  })

  it('should not populate text nodes array with sidebar element', () => {
    const parentElement = document.createElement('div')
    const sidebarElement = document.createElement('span')
    sidebarElement.textContent = 'something'
    sidebarElement.className = 'aurac-sidebar'
    parentElement.appendChild(sidebarElement)

    TextHighlighter.allTextNodes(parentElement, textNodes)

    expect(textNodes.length).toBe(0)
  })

  it('should not populate text nodes array with hidden element', () => {
    const parentElement = document.createElement('div')
    const hiddenElement = document.createElement('p')
    hiddenElement.textContent = 'something'
    hiddenElement.style.display = 'none'
    parentElement.appendChild(hiddenElement)

    TextHighlighter.allTextNodes(parentElement, textNodes)

    expect(textNodes.length).toBe(0)
  })

  it('should not populate text nodes array with element of tooltipped class', () => {
    const parentElement = document.createElement('div')
    const hiddenElement = document.createElement('p')
    hiddenElement.textContent = 'something'
    hiddenElement.className = 'tooltipped'
    parentElement.appendChild(hiddenElement)

    TextHighlighter.allTextNodes(parentElement, textNodes)

    expect(textNodes.length).toBe(0)
  })

  it('should not populate text nodes array with element of tooltipped-click class', () => {
    const parentElement = document.createElement('div')
    const hiddenElement = document.createElement('p')
    hiddenElement.textContent = 'something'
    hiddenElement.className = 'tooltipped-click'
    parentElement.appendChild(hiddenElement)

    TextHighlighter.allTextNodes(parentElement, textNodes)

    expect(textNodes.length).toBe(0)
  })
})


fdescribe('allTextNodes', () => {

  let document: Document;
  let elements: Array<Element>;

  beforeAll(() => {
    document = setup([])
  })

  beforeEach(() => {
    elements = []
  })

  it('should populate elements array with a single valid descendant', () => {
    const parentElement = document.createElement('div')
    const textElement = document.createElement('p')
    textElement.textContent = 'protein'
    parentElement.appendChild(textElement)


    TextHighlighter.allDescendants(parentElement, elements, 'protein')

    expect(elements.length).toBe(1);
  })

  it('should populate elements array with multiple valid descendants', () => {
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

  it('should only populate elements array with descendants which are text nodes', () => {
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
