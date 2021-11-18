export const HIGHLIGHTED_ELEMENT_ID_DELIMITER = '_'

export function highlightID(
  entityID: string,
  entityOccurrence: number,
  synonymName: string
): string {
  return [entityID, entityOccurrence, synonymName].join(HIGHLIGHTED_ELEMENT_ID_DELIMITER)
}

export function parseHighlightID(
  id: string
): [entityID: string, entityOccurrence: number, synonymName: string, synonymOccurrence: number] {
  const [entityID, entityOccurrence, synonymName, synonymOccurrence] = id.split(
    HIGHLIGHTED_ELEMENT_ID_DELIMITER
  )

  return [entityID, parseInt(entityOccurrence), synonymName, parseInt(synonymOccurrence)]
}

export function highlightFormat(synonym: string): RegExp {
  const highlightingFormat = `(?<=\\W|^)${synonym}(?=\\W|$)`

  return new RegExp(highlightingFormat)
}
