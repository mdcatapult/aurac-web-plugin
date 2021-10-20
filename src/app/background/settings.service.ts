import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { BehaviorSubject } from 'rxjs';
import { XRefSources, Preferences, defaultSettings, DictionaryURLs, Settings, Message } from '../../types'
import { BrowserService } from '../browser.service';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  // Private behaviour subjects form the basis of the class attributes.
  private readonly _xRefSources: BehaviorSubject<XRefSources> = new BehaviorSubject({})
  private readonly _preferences: BehaviorSubject<Preferences> = new BehaviorSubject(defaultSettings.preferences);
  private readonly _APIURLs: BehaviorSubject<DictionaryURLs> = new BehaviorSubject(defaultSettings.urls)

  // Observables allow dependants to subscribe to changes without the ability to set values. Readonly means the 
  // reference cannot be modified by a dependant.
  readonly xRefSources$ = this._xRefSources.asObservable()
  readonly preferences$ = this._preferences.asObservable();
  readonly APIURLs$ = this._APIURLs.asObservable()

  // Getters allow simple access to current values.
  get xRefSources(): XRefSources {
    return this._xRefSources.getValue()
  }
  get preferences(): Preferences {
    return this._preferences.getValue()
  }
  get APIURLs(): DictionaryURLs {
    return this._APIURLs.getValue()
  }

  constructor(private browserService: BrowserService, private httpClient: HttpClient) {
    this.browserService.addListener(msg => this.handleMessages(msg))
    this.loadFromBrowserStorage().then(settings => {
      this.setAll(settings);
      this.refreshCrossReferences();
    })
  }

  private handleMessages(msg: Partial<Message>): Promise<any> {
    switch (msg.type) {
      case 'settings_service_get_settings':
        return new Promise<Settings>((resolve) => {
          resolve({
            xRefSources: this.xRefSources,
            urls: this.APIURLs,
            preferences: this.preferences,
          })
        })
      case 'settings_service_set_settings':
        return Promise.resolve(this.setAll(msg.body))
      default:
        return Promise.resolve(console.log(msg))
    }
  }

  private setAll(settings: Settings): void {
    this._xRefSources.next(settings.xRefSources);
    this._preferences.next(settings.preferences);
    this._APIURLs.next(settings.urls);
  }

  private refreshCrossReferences(): void {
    this.httpClient.get<string[]>(`${this.APIURLs.unichemURL}/sources`).subscribe(sources => {
      // console.log(sources)
      const xRefSources: Record<string,boolean> = {}
      sources.forEach(source => {
        // Left hand side must be null or undefined (not false). See "nullish coallescing operator".
        xRefSources[source] = this.xRefSources[source] ?? true
        // console.log(xRefSources)
      })
      this._xRefSources.next(xRefSources)
      console.log("xRefSources", this.xRefSources)
    }, console.error)
  }

  /**
 * loadSettings calls browserService to load settings, then ensures that the retrieved object has all the correct
 * keys based on defaultSettings.
 * @param browserService browserService implementation
 * @param onResolve callback for when settings have been retrived from browser strorage
 */
  private loadFromBrowserStorage(): Promise<Settings> {
    return this.browserService.load('settings').then(settingsObj => {
    const settings = (settingsObj as Settings)
      return _.merge(settings, defaultSettings)
    })
  }
}
