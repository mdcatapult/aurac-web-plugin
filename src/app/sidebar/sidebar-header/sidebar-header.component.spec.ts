import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserService } from 'src/app/browser.service';
import { SafeResourcePipe } from 'src/app/safe-resource.pipe';
import { TestBrowserService } from 'src/app/test-browser.service';

import { SidebarHeaderComponent } from './sidebar-header.component';

describe('SidebarHeaderComponent', () => {
  let component: SidebarHeaderComponent;
  let fixture: ComponentFixture<SidebarHeaderComponent>;
  let testBrowserService: TestBrowserService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SidebarHeaderComponent, SafeResourcePipe ],
      imports: [HttpClientTestingModule],
      providers: [
        {provide: BrowserService, useClass: TestBrowserService}
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    testBrowserService = TestBed.inject(TestBrowserService)
    fixture = TestBed.createComponent(SidebarHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
