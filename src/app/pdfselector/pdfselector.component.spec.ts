import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LogService } from '../popup/log.service';
import { TestBrowserService } from '../test-browser.service';

import { PDFSelectorComponent } from './pdfselector.component';

describe('PDFSelectorComponent', () => {
  let component: PDFSelectorComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [ PDFSelectorComponent ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    const httpMock = TestBed.get(HttpClientTestingModule)
    component = new PDFSelectorComponent(new LogService(), httpMock, new TestBrowserService(new LogService()))
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
