export function callRegex(synonym: string): RegExp {
  const highlightingFormat = `(?<=\\W|^)${synonym}(?=\\W|$)`

  return new RegExp(highlightingFormat)
}
