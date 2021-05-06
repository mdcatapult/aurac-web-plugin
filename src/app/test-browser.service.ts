import { Injectable } from '@angular/core';
import {BrowserService} from './browser.service';

@Injectable({
  providedIn: 'root'
})
export class TestBrowserService extends BrowserService {
  loadSettings(): Promise<any> {
    return new Promise(() => {});
  }
}
