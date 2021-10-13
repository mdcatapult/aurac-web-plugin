import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SidebarEntityComponent } from './sidebar-entity.component';

describe('SidebarEntityComponent', () => {
  let component: SidebarEntityComponent;
  let fixture: ComponentFixture<SidebarEntityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SidebarEntityComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SidebarEntityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
