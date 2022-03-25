import { Entity, EntityID } from 'src/types/entity'
import { Recogniser } from 'src/types/recognisers'
import { Species } from 'src/types/species'

export interface SidebarCard {
  clickedSynonymName: string
  clickedSynonymOccurrence: number
  clickedEntityOccurrence: number
  entityID: EntityID
  entity: Entity
  recogniser: Recogniser
  selectedSpecies?: Species
}

export interface Identifier {
  type: string
  value: string
}
