import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Entity } from 'src/types/entity';
import { SidebarCardComponent } from './sidebar-card.component';

describe('SidebarCardComponent', () => {
  let component: SidebarCardComponent;
  let fixture: ComponentFixture<SidebarCardComponent>;
  const entity: Entity = {
    synonymToXPaths: new Map<string,string[]>()
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SidebarCardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SidebarCardComponent);
    component = fixture.componentInstance;
    component.card.entity = entity
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

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
});
