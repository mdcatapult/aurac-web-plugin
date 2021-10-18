import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BrowserService } from './browser.service';

@Injectable({
  providedIn: 'root'
})
export class ReadinessService {
  
  constructor(private browserService: BrowserService) { }
  
  sidebarIsReady = false
  sidebarIsReady$: Observable<boolean> = new Observable((subscription) => {
    this.browserService.addListener((msg) => {
      if (msg.type === 'readiness_service_sidebar_ready') {
        this.sidebarIsReady = true;
        subscription.next(this.sidebarIsReady);
      };
    });
  });
}
