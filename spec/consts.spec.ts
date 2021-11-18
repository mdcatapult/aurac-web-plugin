import { callRegex } from '../src/content-script/consts'

describe('callRegex', () => {
  it('returns true given the string just contains the term', () => {
    const synonym = 'OPG'
    const result = callRegex(synonym)
    expect(result.test('OPG')).toBeTrue()
  })

  it('returns true given a term with white space boundaries', () => {
    const synonym = 'OPG'
    const result = callRegex(synonym)
    expect(result.test('Hello this is an OPG nice to meet you')).toBeTrue()
  })

  it('returns false given the term is attached to a word character on its left', () => {
    const synonym = 'OPG'
    const result = callRegex(synonym)
    expect(result.test('Hello this is anOPG nice to meet you')).toBeFalse()
  })

  it('returns false given the term is attached to a word character on its right', () => {
    const synonym = 'OPG'
    const result = callRegex(synonym)
    expect(result.test('Hello this is an OPGnice to meet you')).toBeFalse()
  })

  it('returns false given the term is next to more than one word character', () => {
    const synonym = 'OPG'
    const result = callRegex(synonym)
    expect(result.test('Hello this is anOPGnice to meet you')).toBeFalse()
  })

  it('returns true given the term has a non word character to the left of it', () => {
    const synonym = 'OPG'
    const result = callRegex(synonym)
    expect(result.test('Hello this is an !OPG nice to meet you')).toBeTrue()
  })

  it('returns true given the term has a non word character to the right of it', () => {
    const synonym = 'OPG'
    const result = callRegex(synonym)
    expect(result.test('Hello this is an OPG! nice to meet you')).toBeTrue()
  })

  it('returns true given the term has a non word character next to either side of it', () => {
    const synonym = 'OPG'
    const result = callRegex(synonym)
    expect(result.test('Hello this is an !OPG! nice to meet you')).toBeTrue()
  })

  it('returns false given the term has a number attached to the left of it', () => {
    const synonym = 'OPG'
    const result = callRegex(synonym)
    expect(result.test('Hello this is an 2OPG nice to meet you')).toBeFalse()
  })

  it('returns false given the term has a number attached to the right of it', () => {
    const synonym = 'OPG'
    const result = callRegex(synonym)
    expect(result.test('Hello this is an OPG2 nice to meet you')).toBeFalse()
  })

  it('returns false given the term has a number attached side of it', () => {
    const synonym = 'OPG'
    const result = callRegex(synonym)
    expect(result.test('Hello this is an 2OPG2 nice to meet you')).toBeFalse()
  })

  it('returns true given the term has a non word character and a word character to its left', () => {
    const synonym = 'OPG'
    const result = callRegex(synonym)
    expect(result.test('Hello this is an!OPG nice to meet you')).toBeTrue()
  })

  it('returns true given the term has a non word character and a word character to its right', () => {
    const synonym = 'OPG'
    const result = callRegex(synonym)
    expect(result.test('Hello this is an OPG!nice to meet you')).toBeTrue()
  })

  it('returns true given the term has non word characters next to it and is surrounded by non word characters', () => {
    const synonym = 'OPG'
    const result = callRegex(synonym)
    expect(result.test('Hello this is an!OPG!nice to meet you')).toBeTrue()
  })
})
