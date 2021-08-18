import {Injectable} from '@angular/core';
import {defaultSettings, Settings} from 'src/types';
import {BrowserService} from '../browser.service';
import {LogService} from '../popup/log.service';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  constructor() {
  }

  static loadSettings(browserService: BrowserService, onResolve: (settings: Settings) => void): Promise<Settings> {
    return browserService.loadSettings().then(settings => {
      Object.keys(defaultSettings).forEach(defaultSetting => {
        // @ts-ignore
        if (settings[defaultSetting] === undefined) {
          // @ts-ignore
          settings[defaultSetting] = defaultSettings[defaultSetting]
        }
      })
      onResolve(settings)
    }) as Promise<Settings>
  }

}
