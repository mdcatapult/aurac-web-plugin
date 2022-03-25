import { Injectable } from '@angular/core'
import * as _ from 'lodash'
import { Subject } from 'rxjs'
import { Recogniser } from 'src/types/recognisers'
import { Species } from 'src/types/species'
import {
  Entity,
  EntityChange,
  EntityID,
  RecogniserEntities,
  SetterInfo,
  TabEntities,
  TabID
} from '../../types/entity'
import { SettingsService } from './settings.service'

@Injectable({
  providedIn: 'root'
})
export class EntitiesService {
  // contains all entities on the page
  private entityMap: Map<TabID, TabEntities> = new Map()

  // filteredEntities is used when we want to filter entities based on minEntityLength.
  // Maintaining a separate map is necessary because HTMLTagIDs are populated from the content script
  // every time highlight is called. Therefore the results from the script need storing - it is not good enough
  // to simply filter entityMap each time we need filtered entities because the HTMLTagIDs need recalculating.
  private filteredEntities: Map<TabID, TabEntities> = new Map()

  private readonly entityChangeSubject = new Subject<EntityChange>()
  readonly entityChangeObservable = this.entityChangeSubject.asObservable()

  constructor(private settingsService: SettingsService) {}

  getTabEntities(tab: TabID): TabEntities | undefined {
    return _.cloneDeep(this.entityMap.get(tab))
  }

  setTabEntities(tabID: TabID, entities: TabEntities, setterInfo?: SetterInfo): void {
    this.entityMap.set(tabID, entities)
    this.updateStream(tabID, entities, setterInfo)
  }

  setFilteredEntities(tabID: TabID, entities: TabEntities): void {
    this.filteredEntities.set(tabID, entities)
  }

  getFilteredEntities(tab: TabID): TabEntities | undefined {
    return _.cloneDeep(this.filteredEntities.get(tab))
  }

  // filterEntities updates the entity stream with a copy of this.entityMap, filtered by minEntityLength
  filterEntities(minEntityLength: number, species?: Species): Map<TabID, TabEntities> {
    const entityMap = new Map<TabID, TabEntities>()

    _.cloneDeep(this.entityMap).forEach((tabEntities, tabId) => {
      const filteredEntities = this.filterTabEntities(minEntityLength, tabEntities, species)
      entityMap.set(tabId, filteredEntities)

      // update entity stream with filteredEntities for tabId
      this.updateStream(tabId, filteredEntities, 'isFilteredEntities')
    })

    return entityMap
  }

  private filterTabEntities(
    minEntityLength: number,
    tabEntities: TabEntities,
    species?: Species
  ): TabEntities {
    const tabEntityKeys = Object.keys(tabEntities) as Array<keyof TabEntities>

    tabEntityKeys.forEach(recogniser => {
      const recogniserEntities = tabEntities[recogniser] as RecogniserEntities

      recogniserEntities.entities.forEach(entity => {
        const filteredSynonyms = new Map<string, string[]>()

        entity.synonymToXPaths.forEach((occurrences, synonym) => {
          const hasLength = synonym.length >= minEntityLength
          const hasSpecies = species && entity.speciesNames?.includes(species)

          if (hasLength && (!species || hasSpecies)) {
            filteredSynonyms.set(synonym, occurrences)
          }
        })

        entity.synonymToXPaths = filteredSynonyms
      })
    })

    return tabEntities
  }

  setRecogniserEntities(
    tabID: TabID,
    recogniser: Recogniser,
    entities: RecogniserEntities,
    setterInfo?: SetterInfo
  ): void {
    const minEntityLength = this.settingsService.preferences.minEntityLength

    const tabEntities = this.entityMap.get(tabID)

    let entityCopy: TabEntities

    if (!tabEntities) {
      const newTabEntities: TabEntities = {}
      newTabEntities[recogniser] = entities
      this.entityMap.set(tabID, newTabEntities)
      entityCopy = _.cloneDeep(newTabEntities)
    } else {
      tabEntities[recogniser] = entities
      this.entityMap.set(tabID, tabEntities)
      entityCopy = _.cloneDeep(tabEntities)
    }
    this.updateStream(tabID, this.filterTabEntities(minEntityLength, entityCopy), setterInfo)
  }

  getFilteredEntity(tabID: TabID, recogniser: Recogniser, entityID: EntityID): Entity | undefined {
    const tabEntities = this.filteredEntities.get(tabID)

    return tabEntities ? tabEntities[recogniser]?.entities?.get(entityID) : undefined
  }

  private updateStream(tabID: TabID, entities: TabEntities, setterInfo?: SetterInfo): void {
    this.entityChangeSubject.next({ tabID, entities, setterInfo: setterInfo })
  }
}
