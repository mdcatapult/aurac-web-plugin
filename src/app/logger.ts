export class Logger {
  constructor() { }

  static debug(...message: any) {
    browser.runtime.sendMessage({type: 'log', level: 'debug', msg: message});
  }

  static info(...message: any) {
    browser.runtime.sendMessage({type: 'log', level: 'info', msg: message});
  }

  static log(...message: any) {
    browser.runtime.sendMessage({type: 'log', level: 'log', msg: message});
  }

  static warn(...message: any) {
    browser.runtime.sendMessage({type: 'log', level: 'warn', msg: message});
  }

  static error(...message: any) {
    browser.runtime.sendMessage({type: 'log', level: 'error', msg: message});
  }
}
