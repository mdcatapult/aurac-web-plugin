import { Component, OnInit } from '@angular/core';
import { LogReceiverService } from './log-receiver.service';

@Component({
  selector: 'app-logger',
  template: ''
})
export class LoggerComponent implements OnInit {

  constructor(private receiver: LogReceiverService) { }

  ngOnInit(): void {
    // tslint:disable-next-line:no-console
    this.receiver.debug$.subscribe(msg => console.debug(msg));
    // tslint:disable-next-line:no-console
    this.receiver.info$.subscribe(msg => console.info(msg));
    this.receiver.log$.subscribe(msg => console.log(msg));
    this.receiver.warn$.subscribe(msg => console.warn(msg));
    this.receiver.error$.subscribe(msg => console.error(msg));
  }

}
