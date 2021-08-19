import {Injectable} from '@angular/core';
import {Settings} from 'src/types';
import {defaultSettings} from 'src/consts';
import {BrowserService} from '../browser.service';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  constructor() {
  }

  /**
   * loadSettings calls browserService to load settings, then ensures that the retrieved object has all the correct
   * keys based on defaultSettings.
   * @param browserService
   * @param onResolve
   */
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
