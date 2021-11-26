import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import * as _ from 'lodash'
import { BehaviorSubject, Observable } from 'rxjs'
import { Message } from 'src/types/messages'
import { XRefSources, Preferences, defaultSettings, APIURLs, Settings } from 'src/types/settings'
import { BrowserService } from '../browser.service'

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  // Private behaviour subjects form the basis of the class attributes.
  private readonly xRefSourcesBehaviorSubject: BehaviorSubject<XRefSources> = new BehaviorSubject(
    {}
  )
  private readonly preferencesBehaviorSubject: BehaviorSubject<Preferences> = new BehaviorSubject(
    defaultSettings.preferences
  )
  private readonly APIURLsBehaviorSubject: BehaviorSubject<APIURLs> = new BehaviorSubject(
    defaultSettings.urls
  )

  // Observables allow dependants to subscribe to changes without the ability to set values. Readonly means the
  // reference cannot be modified by a dependant.
  readonly xRefSourcesObservable = this.xRefSourcesBehaviorSubject.asObservable()
  readonly preferencesObservable = this.preferencesBehaviorSubject.asObservable()
  readonly APIURLsObservable = this.APIURLsBehaviorSubject.asObservable()

  // Getters allow simple access to current values.
  get xRefSources(): XRefSources {
    return this.xRefSourcesBehaviorSubject.getValue()
  }
  get preferences(): Preferences {
    return this.preferencesBehaviorSubject.getValue()
  }
  get APIURLs(): APIURLs {
    return this.APIURLsBehaviorSubject.getValue()
  }

  constructor(private browserService: BrowserService, private httpClient: HttpClient) {
    this.browserService.addListener(msg => this.handleMessages(msg))
    this.loadFromBrowserStorage()
      .then(settings => {
        this.setAll(settings)
      })
      .catch(console.error)
  }

  private handleMessages(msg: Partial<Message>): Promise<any> | void {
    switch (msg.type) {
      case 'settings_service_get_settings':
        return new Promise<Settings>(resolve => {
          resolve({
            xRefSources: this.xRefSources,
            urls: this.APIURLs,
            preferences: this.preferences
          })
        })
      case 'settings_service_set_preferences':
        return new Promise(resolve => {
          this.setPreferences(msg.body)
          this.saveToBrowserStorage(this.getAll()).then(() => {
            resolve(null)
          })
        })
      case 'settings_service_set_urls':
        return new Promise(resolve => {
          this.setURLs(msg.body)
          this.saveToBrowserStorage(this.getAll()).then(() => {
            resolve(null)
          })
        })
      case 'settings_service_set_xrefs':
        return new Promise(resolve => {
          this.setXrefs(msg.body)
          this.saveToBrowserStorage(this.getAll())
          resolve(null)
        })
      case 'settings_service_refresh_xref_sources':
        return this.refreshXRefSources(msg.body)
      case 'settings_service_get_current_recogniser':
        return Promise.resolve(this.preferences.recogniser)
    }
  }

  getAll(): Settings {
    return { xRefSources: this.xRefSources, urls: this.APIURLs, preferences: this.preferences }
  }

  getEnabledXrefs(): string[] {
    return Object.keys(this.xRefSources).filter(xRef => this.xRefSources[xRef] === true)
  }

  private setPreferences(pref: Preferences) {
    this.preferencesBehaviorSubject.next(pref)
  }

  private setURLs(urls: APIURLs) {
    this.APIURLsBehaviorSubject.next(urls)
  }

  private setXrefs(xrefs: XRefSources) {
    this.xRefSourcesBehaviorSubject.next(xrefs)
  }
  private setAll(settings: Settings): void {
    this.xRefSourcesBehaviorSubject.next(settings.xRefSources)
    this.preferencesBehaviorSubject.next(settings.preferences)
    this.APIURLsBehaviorSubject.next(settings.urls)
  }

  private refreshXRefSources(unichemURL: string): Promise<string[]> {
    return this.httpClient
      .get<string[]>(`${unichemURL}/sources`)
      .toPromise()
      .then(unichemPlusSources => Promise.resolve(unichemPlusSources))
  }

  static getXRefSources(httpClient: HttpClient, unichemURL: string): Observable<string[]> {
    return httpClient.get<string[]>(`${unichemURL}/sources`)
  }

  /**
   * loadFromBrowserStorage calls browserService to load settings, then ensures that the retrieved object has all the correct
   * keys based on defaultSettings.
   */
  private loadFromBrowserStorage(): Promise<Settings> {
    return this.browserService.load('settings').then(settingsObj => {
      const settings = (settingsObj as browser.storage.StorageObject)?.settings as Settings

      return _.defaultsDeep(settings, defaultSettings)
    })
  }

  private saveToBrowserStorage(settings: Settings): Promise<void> {
    return this.browserService.save({ settings })
  }
}
