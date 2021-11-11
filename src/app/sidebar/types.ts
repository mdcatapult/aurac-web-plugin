import { Entity, EntityID } from 'src/types/entity';

export interface SidebarCard {
  clickedSynonymName: string
  clickedSynonymOccurrence: number
  clickedEntityOccurrence: number
  entityID: EntityID,
  entity: Entity
}

export interface Identifier {
  type: string
  value: string
}
