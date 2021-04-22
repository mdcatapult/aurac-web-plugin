import {Injectable} from '@angular/core';
import {DictionaryURLs} from '../../types';
import {AbstractControl} from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  constructor() {
  }

  // check if correct keys exist and we can make a URL
  static validURLs(urls: DictionaryURLs): boolean {

    // TODO probably better to have an array of URLs?
    if (!urls.leadmineURL || !urls.unichemURL || !urls.compoundConverterURL) {
      return false;
    }

    try {
      for (const urlsKey of Object.keys(urls)) {
        const validURL = this.isValidURL(urlsKey);

        if (!validURL) {
          return false;
        }
      }
    } catch (e) {
      return false;
    }

    return true;
  }

  static isValidURL(url: string): boolean {
    return !!new URL(url);
  }

  static validator(control: AbstractControl): { [key: string]: string } | null {
    console.log('potatoes', control.value);
    console.log(SettingsService.validURLs(control.value))


    return SettingsService.validURLs(control.value) ? null : {'invalid URL': control.value}
  }

}
