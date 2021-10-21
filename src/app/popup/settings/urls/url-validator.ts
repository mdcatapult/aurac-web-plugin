import {DictionaryURLs} from '../../../../types';
import {AbstractControl} from '@angular/forms';
import { Logger } from '../../../logger';

export class UrlValidator {

  constructor() { }

  static validURLs(urls: DictionaryURLs): boolean {

    // checks if values exists while implicitly checking correct keys exist from loaded JSON
    if (!urls.leadmineURL || !urls.unichemURL || !urls.compoundConverterURL) {
      return false;
    }

    return Object.keys(urls).every(key =>
      UrlValidator.isValidURL(urls[key as keyof DictionaryURLs])
    );
  }

  static isValidURL(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch (e) {
      // TODO: This is throwing with seemingly valid urls when we open the sidebar. 
      // Are they temporarily empty? Investigate.
      Logger.error("invalid url", e);
      return false;
    }
  }

  static validator(control: AbstractControl): { [key: string]: string } | null {
    return UrlValidator.isValidURL(control.value) ? null : {'invalid URL': control.value};
  }
}
