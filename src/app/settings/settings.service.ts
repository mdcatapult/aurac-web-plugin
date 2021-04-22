import {Injectable} from '@angular/core';
import {DictionaryURLs} from '../../types';
import {AbstractControl} from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  constructor() {
  }

  static validURLs(urls: DictionaryURLs): boolean {

    // checks if values exists while implicitly checking correct keys exist from loaded JSON
    if (!urls.leadmineURL || !urls.unichemURL || !urls.compoundConverterURL) {
      return false;
    }

    for (const urlsKey of Object.keys(urls)) {
      const validURL = this.isValidURL(urlsKey);

      if (!validURL) {
        return false;
      }
    }

    return true;
  }

  static isValidURL(url: string): boolean {
    try {
      new URL(url)
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  static validator(control: AbstractControl): { [key: string]: string } | null {
    return SettingsService.isValidURL(control.value) ? null : {'invalid URL': control.value}
  }
}
