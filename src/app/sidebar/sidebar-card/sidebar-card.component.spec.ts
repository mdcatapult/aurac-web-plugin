import { ComponentFixture, TestBed } from '@angular/core/testing'
import { NgxPageScrollCoreModule } from 'ngx-page-scroll-core'
import { BrowserService } from 'src/app/browser.service'
import { TestBrowserService } from 'src/app/test-browser.service'
import { Entity } from 'src/types/entity'
import { SidebarCard } from '../types'
import { SidebarCardComponent } from './sidebar-card.component'

describe('SidebarCardComponent', () => {
  let component: SidebarCardComponent
  let fixture: ComponentFixture<SidebarCardComponent>
  const entity: Entity = {
    synonymToXPaths: new Map<string, string[]>(),
    htmlTagIDs: ['a', 'b', 'c', 'd']
  }
  const card: SidebarCard = {
    recogniser: 'leadmine-proteins',
    entity: entity,
    clickedEntityOccurrence: 0,
    clickedSynonymOccurrence: 0,
    clickedSynonymName: '',
    entityID: '1',
    selectedSpecies: undefined
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgxPageScrollCoreModule.forRoot()],
      declarations: [SidebarCardComponent],
      providers: [{ provide: BrowserService, useClass: TestBrowserService }]
    }).compileComponents()
  })

  beforeEach(() => {
    fixture = TestBed.createComponent(SidebarCardComponent)
    component = fixture.componentInstance
    component.card = card
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should handle right scrollIndex correctly', () => {
    // scroll to the end of occurrences
    for (let i = 0; i < entity.htmlTagIDs.length - 1; i++) {
      component.arrowClicked('right')
      expect(component.scrollIndex).toBe(i + 1)
    }
    // scroll off the end
    component.arrowClicked('right')
    expect(component.scrollIndex).toBe(0)
  })

  it('should handle left scrollIndex correctly', () => {
    component.arrowClicked('left')
    expect(component.scrollIndex).toBe(entity.htmlTagIDs.length - 1)
  })
})
