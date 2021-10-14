import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { BrowserService } from './app/browser.service';

@Injectable({
  providedIn: 'root'
})
export class ReadinessService {
  sidebarIsReady$: Subject<boolean> = new Subject();
  sidebarIsReady = false

  constructor(private browserService: BrowserService) {
    this.sidebarIsReady$.subscribe(value => this.sidebarIsReady = value)

    this.browserService.addListener((msg) => {
      if (msg.type === 'readiness_service_sidebar_ready') {
        this.sidebarIsReady$.next(true);
      };
    });
  }
}
