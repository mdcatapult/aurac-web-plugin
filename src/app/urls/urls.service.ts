import {Injectable} from '@angular/core';
import {DictionaryURLKeys, DictionaryURLs} from '../../types';
import {AbstractControl} from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class UrlsService {

  constructor() {
  }

  static validURLs(urls: DictionaryURLs): boolean {

    // checks if values exists while implicitly checking correct keys exist from loaded JSON
    if (!urls.leadmineURL || !urls.unichemURL || !urls.compoundConverterURL) {
      return false;
    }

    return Object.keys(urls).every(key =>
      this.isValidURL(urls[key as keyof DictionaryURLs])
    );
  }

  static isValidURL(url: string): boolean {
    try {
      // tslint:disable-next-line
      new URL(url);
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  static validator(control: AbstractControl): { [key: string]: string } | null {
    return UrlsService.isValidURL(control.value) ? null : {'invalid URL': control.value};
  }
}
