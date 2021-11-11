import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SidebarCardListComponent } from './sidebar-card-list.component';

describe('SidebarEntityListComponent', () => {
  let component: SidebarCardListComponent;
  let fixture: ComponentFixture<SidebarCardListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SidebarCardListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SidebarCardListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
