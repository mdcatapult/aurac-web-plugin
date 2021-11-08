import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SidebarEntity } from '../types';

import { SidebarEntityComponent } from './sidebar-entity.component';
import {SynonymText, SynonymData} from '../../../types';

describe('SidebarEntityComponent', () => {
  let component: SidebarEntityComponent;
  let fixture: ComponentFixture<SidebarEntityComponent>;
  const entity: SidebarEntity = {
    metadata: '',
    title: '',
    entityName: '',
    identifiers: [],
    synonyms: ['a-synonym'],
    occurrences: ['occ1', 'occ2', 'occ3'],
    xrefs: []
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SidebarEntityComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SidebarEntityComponent);
    component = fixture.componentInstance;
    component.entity = entity
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should handle right scrollIndex correctly', () => {
    // scroll to the end of occurrences
    for (let i = 0; i < entity.occurrences.length - 1; i++) {
      component.arrowClicked('right')
      expect(component.scrollIndex).toBe(i + 1)
    }
    // scroll off the end
    component.arrowClicked('right')
    expect(component.scrollIndex).toBe(0)
  })

  it('should handle left scrollIndex correctly', () => {
    component.arrowClicked('left')
    expect(component.scrollIndex).toBe(entity.occurrences.length - 1)
  })
});
