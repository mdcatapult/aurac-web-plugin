import * as Highlights from '../../src/types/highlights'
import { Globals } from '../../src/content-script/globals'
import document = Globals.document
import * as Util from '../../spec/util'
import { APIEntity } from '../../src/app/background/ner.service'

describe('highlightFormat', () => {
  const simpleTerm = 'OPG'
  const termContainingDigits = '3-Ethyl-2-methylhexane'
  const termContainingSpecialCharacters = '(+)-(Z)-Antazirine'
  const synonyms = [simpleTerm, termContainingDigits, termContainingSpecialCharacters]

  synonyms.forEach(synonym => {
    it('returns true given the string just contains the term', () => {
      const result = Highlights.highlightFormat(synonym)
      expect(result.test(`${synonym}`)).toBeTrue()
    })

    it('returns true given a term with white space boundaries', () => {
      const result = Highlights.highlightFormat(synonym)
      expect(result.test(`Hello this is an ${synonym} nice to meet you`)).toBeTrue()
    })

    it('returns false given the term is attached to a word character on its left', () => {
      const result = Highlights.highlightFormat(synonym)
      expect(result.test(`Hello this is an${synonym} nice to meet you`)).toBeFalse()
    })

    it('returns false given the term is attached to a word character on its right', () => {
      const result = Highlights.highlightFormat(synonym)
      expect(result.test(`Hello this is an ${synonym}nice to meet you`)).toBeFalse()
    })

    it('returns false given the term is next to more than one word character', () => {
      const result = Highlights.highlightFormat(synonym)
      expect(result.test(`Hello this is an${synonym}nice to meet you`)).toBeFalse()
    })

    it('returns true given the term has a non word character to the left of it', () => {
      const result = Highlights.highlightFormat(synonym)
      expect(result.test(`Hello this is an !${synonym} nice to meet you`)).toBeTrue()
    })

    it('returns true given the term has a non word character to the right of it', () => {
      const result = Highlights.highlightFormat(synonym)
      expect(result.test(`Hello this is an ${synonym}! nice to meet you`)).toBeTrue()
    })

    it('returns true given the term has a non word character next to either side of it', () => {
      const result = Highlights.highlightFormat(synonym)
      expect(result.test(`Hello this is an !${synonym}! nice to meet you`)).toBeTrue()
    })

    it('returns false given the term has a number attached to the left of it', () => {
      const result = Highlights.highlightFormat(synonym)
      expect(result.test(`Hello this is an 2${synonym} nice to meet you`)).toBeFalse()
    })

    it('returns false given the term has a number attached to the right of it', () => {
      const result = Highlights.highlightFormat(synonym)
      expect(result.test(`Hello this is an ${synonym}2 nice to meet you`)).toBeFalse()
    })

    it('returns false given the term has a number attached side of it', () => {
      const result = Highlights.highlightFormat(synonym)
      expect(result.test(`Hello this is an 2${synonym}2 nice to meet you`)).toBeFalse()
    })

    it('returns true given the term has a non word character and a word character to its left', () => {
      const result = Highlights.highlightFormat(synonym)
      expect(result.test(`Hello this is an!${synonym} nice to meet you`)).toBeTrue()
    })

    it('returns true given the term has a non word character and a word character to its right', () => {
      const result = Highlights.highlightFormat(synonym)
      expect(result.test(`Hello this is an ${synonym}!nice to meet you`)).toBeTrue()
    })

    it('returns true given the term has non word characters next to it and is surrounded by non word characters', () => {
      const result = Highlights.highlightFormat(synonym)
      expect(result.test(`Hello this is an!${synonym}!nice to meet you`)).toBeTrue()
    })
  })
})

fdescribe('unmarkHiddenEntities', () => {
  const APIEntities: APIEntity = { name: '', position: 0, recogniser: undefined, xpath: '' }
  const APIEntityList: APIEntity[] = [APIEntities]

  var document = Util.setup(APIEntityList)

  let auracElement = document.createElement('div')
  document.body.appendChild(auracElement)

  auracElement.className = 'aurac-highlight'
  console.log(auracElement.className)
})
