export const HIGHLIGHTED_ELEMENT_ID_DELIMITER = '@@'

export function highlightID(
  entityID: string,
  entityOccurrence: number,
  synonymName: string,
  synonymOccurrence: number
): string {
  return [entityID, entityOccurrence, synonymName, synonymOccurrence].join(
    HIGHLIGHTED_ELEMENT_ID_DELIMITER
  )
}

export function parseHighlightID(
  id: string
): [entityID: string, entityOccurrence: number, synonymName: string, synonymOccurrence: number] {
  const [entityID, entityOccurrence, synonymName, synonymOccurrence] = id.split(
    HIGHLIGHTED_ELEMENT_ID_DELIMITER
  )

  return [entityID, parseInt(entityOccurrence), synonymName, parseInt(synonymOccurrence)]
}
