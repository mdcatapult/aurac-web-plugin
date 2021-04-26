import {Injectable} from '@angular/core';
import {DictionaryURLKeys, DictionaryURLs} from '../../types';
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

    // for (const key in urls) {
    //   if (urls.hasOwnProperty(key)) {
    //     let value = urls[key];
    //   }
    // }

    // let valid = true;
    // for (let key in urls) {
    //   if (urls.hasOwnProperty(key)) {
    //     if(!this.isValidURL(urls[key])) {
    //       valid = false;
    //     }
    //   } else {
    //     valid = false;
    //   }
    // }
    //
    // return valid;



    return Object.keys(urls).every(key =>
      this.isValidURL(urls[key as keyof  DictionaryURLs])
    );
  }

  static isValidURL(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  static validator(control: AbstractControl): { [key: string]: string } | null {
    return SettingsService.isValidURL(control.value) ? null : {'invalid URL': control.value};
  }
}
