/*
 * Copyright 2022 Medicines Discovery Catapult
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { HttpClientTestingModule } from '@angular/common/http/testing'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { BrowserService } from 'src/app/browser.service'
import { SafeResourcePipe } from 'src/app/safe-resource.pipe'
import { TestBrowserService } from 'src/app/test-browser.service'

import { SidebarHeaderComponent } from './sidebar-header.component'

describe('SidebarHeaderComponent', () => {
  let component: SidebarHeaderComponent
  let fixture: ComponentFixture<SidebarHeaderComponent>
  let testBrowserService: TestBrowserService

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SidebarHeaderComponent, SafeResourcePipe],
      imports: [HttpClientTestingModule],
      providers: [{ provide: BrowserService, useClass: TestBrowserService }]
    }).compileComponents()
  })

  beforeEach(() => {
    testBrowserService = TestBed.inject(TestBrowserService)
    fixture = TestBed.createComponent(SidebarHeaderComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
