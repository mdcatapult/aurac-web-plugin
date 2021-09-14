import {Injectable} from '@angular/core';
import {Settings, defaultSettings} from 'src/types';
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
   * @param browserService browserService implementation
   * @param onResolve callback for when settings have been retrived from browser strorage
   */
  static loadSettings(browserService: BrowserService, onResolve: (settings: Settings) => void): Promise<Settings> {
    return browserService.loadSettings().then(settings => {
      Object.keys(defaultSettings).forEach(defaultSetting => {
        if (settings[defaultSetting as keyof Settings] === undefined) {
          // @ts-ignore
          settings[defaultSetting as keyof Settings] = defaultSettings[defaultSetting as keyof Settings]
        }
      })
      onResolve(settings)
    }) as Promise<Settings>
  }

}
