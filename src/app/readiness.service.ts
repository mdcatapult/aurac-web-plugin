import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { first } from 'rxjs/operators';
import { BrowserService } from './browser.service';

@Injectable({
  providedIn: 'root'
})
export class ReadinessService {
  
  sidebarIsReady = false
  sidebarIsReady$: Subject<boolean> = new Subject();
  
  constructor(private browserService: BrowserService) {
    this.browserService.addListener((msg) => {
      if (msg.type === 'readiness_service_sidebar_ready') {
        this.sidebarIsReady$.next(true);
      };
    });

    this.sidebarIsReady$.pipe(first()).subscribe(readiness => this.sidebarIsReady = readiness);
  }
  
}
