import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SidebarEntityListComponent } from './sidebar-entity-list.component';

describe('SidebarEntityListComponent', () => {
  let component: SidebarEntityListComponent;
  let fixture: ComponentFixture<SidebarEntityListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SidebarEntityListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SidebarEntityListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
