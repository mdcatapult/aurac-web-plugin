import { Entity, EntityID } from 'src/types/entity'
import { Recogniser } from 'src/types/recognisers'

export interface SidebarCard {
  inFocus: boolean
  clickedSynonymName: string
  clickedSynonymOccurrence: number
  clickedEntityOccurrence: number
  entityID: EntityID
  entity: Entity
  recogniser: Recogniser
}

export interface Identifier {
  type: string
  value: string
}
