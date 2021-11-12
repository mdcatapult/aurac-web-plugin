import { ComponentFixture, TestBed } from '@angular/core/testing'
import { BrowserService } from 'src/app/browser.service'
import { TestBrowserService } from 'src/app/test-browser.service'
import { SidebarCardListComponent } from './sidebar-card-list.component'
import { NgxPageScrollCoreModule, PageScrollService } from 'ngx-page-scroll-core'

describe('SidebarCardListComponent', () => {
  let component: SidebarCardListComponent
  let fixture: ComponentFixture<SidebarCardListComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgxPageScrollCoreModule.forRoot()],
      declarations: [SidebarCardListComponent],
      providers: [PageScrollService, { provide: BrowserService, useClass: TestBrowserService }]
    }).compileComponents()
  })

  beforeEach(() => {
    fixture = TestBed.createComponent(SidebarCardListComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
