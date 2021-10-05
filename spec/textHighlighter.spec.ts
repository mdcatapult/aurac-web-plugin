import {TextHighlighter} from '../src/content-script/textHighlighter';

fdescribe('textContainsTerm', () => {

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

    it('text starts and ends with the same delimiter', () => {
      TextHighlighter.delimiters.forEach(delimiter => {
        let result = TextHighlighter.textContainsTerm(`${delimiter}${term}${delimiter}`, term)
        expect(result).toBe(true);
      })
    });

    it('text starts and ends with the same delimiter', () => {
      let result = TextHighlighter.textContainsTerm(`(${term})`, term)
      expect(result).toBe(true);
      })
    })
  }
)

