import { ComponentFixture, TestBed } from '@angular/core/testing';

import { XRefSourcesComponent } from './x-ref-sources.component';

describe('XRefSourcesComponent', () => {
  let component: XRefSourcesComponent;
  let fixture: ComponentFixture<XRefSourcesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ XRefSourcesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(XRefSourcesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
