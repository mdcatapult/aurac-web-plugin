import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PDFSelectorComponent } from './pdfselector.component';

describe('PDFSelectorComponent', () => {
  let component: PDFSelectorComponent;
  let fixture: ComponentFixture<PDFSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PDFSelectorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PDFSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
