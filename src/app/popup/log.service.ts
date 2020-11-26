import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LogService {
  constructor() { }

  Debug(message: any) {
    browser.runtime.sendMessage({type: 'log', level: 'debug', msg: message});
  }

  Info(message: any) {
    browser.runtime.sendMessage({type: 'log', level: 'info', msg: message});
  }

  Log(message: any) {
    browser.runtime.sendMessage({type: 'log', level: 'log', msg: message});
  }

  Warn(message: any) {
    browser.runtime.sendMessage({type: 'log', level: 'warn', msg: message});
  }

  Error(message: any) {
    browser.runtime.sendMessage({type: 'log', level: 'error', msg: message});
  }
}
