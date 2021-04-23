import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import {Message} from '../../../types';

@Injectable({
  providedIn: 'root'
})
export class LogReceiverService {

  private readonly Debug = new Subject();
  readonly debug$ = this.Debug.asObservable();
  set debug(msg: any) {
    this.Debug.next(msg);
  }

  private readonly Info = new Subject();
  readonly info$ = this.Info.asObservable();
  set info(msg: any) {
    this.Debug.next(msg);
  }

  private readonly Log = new Subject();
  readonly log$ = this.Log.asObservable();
  set log(msg: any) {
    this.Debug.next(msg);
  }

  private readonly Warn = new Subject();
  readonly warn$ = this.Warn.asObservable();
  set warn(msg: any) {
    this.Debug.next(msg);
  }

  private readonly Error = new Subject();
  readonly error$ = this.Error.asObservable();
  set error(msg: any) {
    this.Debug.next(msg);
  }

  constructor() {
    this.initialise();
  }

  private initialise() {
    browser.runtime.onMessage.addListener((msg: Partial<Message> & {msg?: Message}) => {
      if (msg.type !== 'log') { return; }
      switch (msg.level) {
        case 'debug':
          this.Debug.next(msg.msg);
          break;
        case 'info':
          this.Info.next(msg.msg);
          break;
        case 'log':
          this.Log.next(msg.msg);
          break;
        case 'warn':
          this.Warn.next(msg.msg);
          break;
        case 'error':
          this.Error.next(msg.msg);
      }
    });
  }
}
