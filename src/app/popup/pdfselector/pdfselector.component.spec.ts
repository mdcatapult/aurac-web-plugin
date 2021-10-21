import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { TestBrowserService } from '../../test-browser.service';
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
    component = new PDFSelectorComponent(httpMock, new TestBrowserService())
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
