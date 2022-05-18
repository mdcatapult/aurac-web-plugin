Copyright 2022 Medicines Discovery Catapult

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.

You may obtain a copy of the License at
http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

# Aurac architecture proposal

The main aim here is to split everything down in to _tiny_ services and components, each of which having a _single responsibility_.

Another big reason for this is that with iframes the sidebar and main content can no longer share data. Therefore, all data must be managed via the background page (Angular is good at this, so this is a good thing).

## Conventions

- Browser messages:
  - Message types must be lower cased, snake cased versions of the service
    component name and function name to which they correspond (and no logic should be performed within switch statements). For example, `SettingsService.saveSettings` would be `settings_service_save_settings`.
  - Components/services should handle their own messages (or have a dedicated messenger service if they become too complicated).
  - Messages to the content script should be prefixed with `content_script`, e.g. `content_script_scroll_to_id`.
  - Message body should become strongly typed. We should know exactly the type for each message. This can be an intersection of many types.

## New services

- `EntityService`: This service is for managing entity data. It keeps track of which entities are on which page, which occurrences are highlighted (and where), which entities are displayed in the sidebar, etc. It is not responsible for anything else, so it doesn't listen to or send browser messages or do any fetching.

  - Variables:

    ```typescript
    // Map of page id to a map of dictionaries to a map of entityText (string) to entities.
    private entityMap: Map<number,TabEntities>;

    // Private observable (so dependants can't call .next)
    private readonly changeStream: Observable<EntityChange>;

    // Void observable stream means subscribers are notified of changes but
    // can't call next.
    get changeStream$(): Observable<void> {
        return this.changeStream;
    }

    // Gets the last change (public)
    get lastAppliedChange(): EntityChange {
        return this.changeStream.getValue();
    }

    // Sets the lastAppliedChange (i.e. calls .next on the changeStream)
    private set lastAppliedChange(entityChange: EntityChange): void {
        this.changeStream.next(entityChange);
    }
    ```

  - Methods:

    ```typescript
    // Return the entityMap.
    getEntities(): Map<number, TabEntities>;

    // Get entities for a page.
    getTabEntities(tab: number): TabEntities;

    // Set entities on a page. Setters must set `this.lastAppliedChange` with the correct value.
    setTabEntities(tab: number, entities: TabEntities): void;

    // Get entities for a dictionary on a page.
    getDictionaryEntities(dictionaryId: DictionaryID): DictionaryEntities;

    // Set dictionary entities. Set "show" to false for any other dictionary entities we may have (unless we're highlighting multiple dictionaries in future). Setters must set `this.lastAppliedChange` with the correct value.
    setDictionaryEntities(dictionaryId: DictionaryID, entities: DictionaryEntities);

    // Set an entity. Setters must set `this.lastAppliedChange` with the correct value.
    setEntity(entityId: EntityID, entity: Entity): void;

    // Set occurrences. Setters must set `this.lastAppliedChange` with the correct value.
    setOccurrences(entityId: EntityID, occurrences: Array<string>);

    // Add occurrence. Setters must set `this.lastAppliedChange` with the correct value.
    addOccurrence(entityId: EntityID, occurrence: string);

    // Set the entity show value. Setters must set `this.lastAppliedChange` with the correct value.
    setEntityVisibility(entityId: EntityID, show: boolean);
    ```

- `EntityMessengerService`: This service sits between the `EntityService` and the sidebar/content script. It's job is to interpret and relay messages between the two. _This service must be injected into the background page_.

  - Methods:

    ```typescript
    // This is a callback for entityService.subscribe (e.g. in the entity messenger constructor, we will do `entityService.changeStream.subscribe(this.handleEntityChanges)`). If there are changes to the entity data, this function would be responsible for forwarding any required information to the tab.
    private handleEntityChanges(change: EntityChange): void;

    // This function is a callback for browserService.addListener (e.g. in the entity messenger constructor, we will do `browserService.addListener(this.handleRuntimeMessages)`). When the tab makes changes to the page, it should send a message to update the entities. Message types will be lowercased and snakecased versions of the entityService method names. For example, to add an entity highlight the message type should be `entity_service_add_entity_highlight` and the body will be an object containing the function arguments.
    private handleRuntimeMessages(): void;
    ```

- `NERService`: This is the service we will use for calling leadmine/ner-api. When the results come back we must set their value in the `EntityService` before returning to the caller. _This service must be injected into the background page_.

  - Methods:

    ```typescript
    // This is a callback for browserService.addListener. It will handle 'ner_service_process_current_page' ('ner_current_page') by calling `processCurrentPage`.
    private handleRuntimeMessage(): void;

    // Processes the given page to find entities for the given dictionary. Returns a promise of the dictionary entities.
    private processText(text: string, dictionary: Dictionary): Promise<LeadminerResult>;

    // Returns a copy of the input based on uniqueness of the entityText.
    private getUniqueEntities(entities: Array<LeadminerEntity>): Array<LeadminerEntity>;

    // Gets the current page id, url, and contents, and processes it with the currently configured dictionary. This function must call `entityService.setDictionaryEntities`. 'ner_service_process_current_page'
    processCurrentPage(): void;
    ```

- `CSVService`: Service for all CSV logic.
- `CrossReferenceService`: Service for cross-references.
- `ModalService`: Handles modal logic and data (to open/close the modal a bunch of messages will need to be sent between the sidebar, modal, and background-script).

## Service updates

- `BrowserService`: This is doing some stuff with settings that it shouldn't be responsible for. We'll remove that and make it a very _very_ light wrapper around the browser API for mocking purposes only.
- `SettingsService`: This service will hold all of the settings data (and load/save it via the browser service). We will use a very useful pattern I discovered a while back (for the doclib UI):

  ```typescript
  private readonly _minimumEntityLength = new BehaviorSubject<number>(3);

  get minimumEntityLength$(): Observable<void> {
      return this._minimumEntityLength;
  }

  get minimumEntityLength(): number {
      return this._minimumEntityLength.getValue();
  }

  set minimumEntityLength(entityLength: number): void {
      // You can perform checks here.
      this._minimumEntityLength.next(number);
  }
  ```

  Having getters and setters combined with the behavior subject like this means that clients of the settings service (i.e. the settings component) can get the `minimumEntityLength` with `settingsService.minimumEntityLength`, and can a the new `minimumEntityLength` with `settingsService.minimumEntityLength = 4`. Subscribers can use the observable to react to changes e.g.:

  ```typescript
  // entity-card.component.ts
  settingsService.minimumEntityLength$.subscribe(() => {
    this.show = this.entity.leadminerEntity.entityText >= settingsService.minimumEntityLength
  })
  ```

  ```html
  <app-entity-card>
    <div *ngIf="show">{{content}}</div>
  </app-entity-card>
  ```

## New components

- `SidebarComponent`: Container for sidebar with `open` and `close` methods (plus `exportCSV` etc.).
- `SidebarHeaderComponent`: Navigation and headings for the sidebar.
- `EntityListComponent`: Handles updates to the entities that should be shown on the page. Uses an `ngFor` to render the entity cards.
- `EntityCardComponent`: Nicely renders an input entity.
- `ModalComponent`: Renders the modal based on data from the modal service.

## Script updates

The modal and sidebar can now be moved to angular. I recommend that whatever remains becomes stateless, i.e. it doesn't hold any data, it just receives messages to execute functions. Some ideas for functions:

```typescript
// handle all brwoser messages by delegating to other functions.
handleTabMessages(): void;

// creates the sidebar button
createButton(): void;

// Simple function scrolls to the element.
scrollToId(id: string): void;

// opens and closes the sidebar
openSidebar(): void;
closeSideber(): void;

// Sets modal iframe visibility
openModal(): void;
closeModal(): void;

// Calls highlightEntity with each entity. Uses returned ids to set browser events.
// Must call `entity_service_set_occurrences` with the ids.
highlightEntities(entities: Array<string>): void;

// create and remove the spinner.
createSpinner(): void;
removeSpinner(): void;

// returns ids of highlight spans.
private highlightEntity(entityName: string): Array<string>;

// Handles things like closing the modal when clicking/tabbing out.
private handleDOMEvents(): void;
```

## New types

```typescript
// Entity is a wrapper for a leadminer entity with any extra functional
// information.
interface Entity {
  leadminerEntity: LeadminerEntity
  occurrences: Array<string> // contains the id's of highlighted spans.
  show: boolean // whether to show in sidebar.
  // Other stuff should go here - e.g. cross references.
}

// Dictionary (there is already a type for this, this is here for
// illustration).
type Dictionary = 'gene_protein' | 'chemicals' | 'general' | 'diseases'

// DictionaryEntities is a wrapper for all the entities found when running NER.
interface DictionaryEntities {
  show: boolean
  entities: Map<string, Entity>
}

// Holds all entities on a page in valid dictionaries.
type TabEntities = {
  [key in Dictionary]?: DictionaryEntities
}

interface DictionaryID {
  tab: number
  dictionary: Dictionary
}

interface EntityID extends DictionaryID {
  identifier: string
}

interface SynonymID extends EntityID {
  synonym: string
}

interface OccurrenceID extends EntityID {
  occurrence: string
}

type ChangeIdentifier = number | DictionaryID | EntityID | SynonymID | OccurrenceID

// EntityChange describes where a change to the cache has been made and the
// result of the change.
interface EntityChange {
  identifier: ChangeIdentifier
  result: TabEntities | DictionaryEntities | Entity | Map<string, LeadminerEntity>
}
```

## NER Dataflow

1. Popup page context: User clicks "NER" in the popup.
2. Popup page context: Popup sends runtime message to the NERService `ner_service_process_current_page`.
3. Background page context: NERService calls `content_script_get_page_contents`.
4. Content script page context: Get's page contents and returns (a promise).
5. Background page context: NERService calls backend API.
6. Background page context: NERService sets DictionaryEntities value in EntityService.
7. Background page context: NERService sends message to content script to highlight the entities `content_script_highlight_entities`.
8. Content script page context: Entities are highlighted. Messages are sent to the background to set the id's of the highlight spans `entity_service_set_occurrences`.

```js
{
    2812: {
        gene_protein: {
            show: true,
            entities: {
                "RDHQFKQIGNGIED-MRVPVSSYSA-N": {
                    show: true,
                    identifiers: {
                        "inchikey": "RDHQFKQIGNGIED-MRVPVSSYSA-N",
                    },
                    synonyms: [
                        "Acetylcarnitine",
                        "Acetyl-L-carnitine"
                    ],
                    occurences: [
                        "RDHQFKQIGNGIED-MRVPVSSYSA-N#0",
                        "RDHQFKQIGNGIED-MRVPVSSYSA-N#1",
                        "RDHQFKQIGNGIED-MRVPVSSYSA-N#2"
                    ],
                    metadata: {
                        recognisingDict: "some chemical dict",
                        sectionType: "what is this?",
                        entityGroup: "chemicals"
                    }
                }
            }
        },
        diseases: {
            show: false,
            entities: {}
        }
    }
}
```

## Implementation

1. Implement sidebar with dummy data. Immediately test it!
2. Implement EntityService and EntityMessengerService with dummy data and make sure sidebar is getting updated. Immediately test it!

## Service and component heirarchy

### Sidebar

- SidebarComponent
  - BrowserService
  - SidebarHeaderComponent
  - SidebarEntityListComponent
    - SidebarEntityCardComponent

### Background

- BackgroundComponent
  - ReadinessService
  - EntityService
  - EntityMessengerService
    - BrowserService
  - NERService
  - CrossReferenceService
  - CompoundConverterService

### Highlight workflow

1. Popup sends message to ner service: `ner_service_process_current_page`.
2. NER service sends message to content script: `content_script_open_loading_icon`.
3. NER service sends message to content script: `content_script_get_page_contents`.
4. NER service calls leadmine.
   - Leadmine is broken.
     1. NER service sends message to content script: `content_script_close_loading_icon`.
   - Leadmine doesn't find anything.
     1. NER service sends message to content script: `content_script_close_loading_icon`.
   - Leadmine finds stuff.
     1. NER service sends message to content script: `content_script_highlight_text`.
     2. Content script calls `closeLoadingIcon`.
     3. Content script returns id's of highlighted span.

## Finding synonyms

- Recognition API needs to send back the dictionary that the entity was found in.
  - Recognition API must return the unadulterated token.
- Leadmine dictionaries need to set the resolved entity as an identifier.
- When we receive the response we can collect synonyms based on the dictionary and an identifier associated with that dictionary.
- We can look at overlapping synonym sets at the end and merge them.
