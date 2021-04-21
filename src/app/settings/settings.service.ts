import {Injectable} from '@angular/core';
import {DictionaryURLs} from '../../types';
import {AbstractControl} from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  constructor() {
  }

  validator(control: AbstractControl) {
    return this.validURLs(control.value) ? null : {'invalid URL': control.value};
  }

  // check if correct keys exist and we can make a URL
  validURLs(urls: DictionaryURLs): boolean {

    // TODO probably better to have an array of URLs?
    if (!urls.leadmineURL || !urls.unichemURL || !urls.compoundConverterURL) {
      return false;
    }

    try {
      for (const urlsKey of Object.keys(urls)) {
        const validURL = new URL(urls[urlsKey]);

        if (!validURL) {
          return false;
        }
      }
    } catch (e) {
      return false;
    }

    return true;
  }
}
