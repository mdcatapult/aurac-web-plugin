import {TestBed} from '@angular/core/testing';
import {UrlValidator} from './url-validator';
import {APIURLs} from '../../../../types/settings';

describe('SettingsService', () => {

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should return false when given invalid URLs', () => {
    const invalidUrls: APIURLs = {
      nerURL: 'dhfjdhrks',
      compoundConverterURL: 'asdfsdaf',
      unichemURL: '/dfdsf/asd???=asdf',
      pdfConverterURL: '/fwepij',
    };

    expect(UrlValidator.validURLs(invalidUrls)).toBeFalsy();
  });

  it('should return false given some valid and invalid URLs', () => {
    const validURLs: APIURLs = {
      nerURL: '',
      compoundConverterURL: 'https://compound-converter.wopr.inf.mdc/convert',
      unichemURL: 'http://unichem-plus.wopr.inf.mdc/x-ref',
      pdfConverterURL: 'http://a-legit-url',
    };

    expect(UrlValidator.validURLs(validURLs)).toBeFalsy();
  });

  it('should return true given valid URLs', () => {
    const validURLs: APIURLs = {
      nerURL: 'https://leadmine.wopr.inf.mdc',
      compoundConverterURL: 'https://compound-converter.wopr.inf.mdc/convert',
      unichemURL: 'http://unichem-plus.wopr.inf.mdc/x-ref',
      pdfConverterURL: 'http://a-legit-url',
    };

    expect(UrlValidator.validURLs(validURLs)).toBeTruthy();
  });

  it('should return false given invalid recogniser URL keys', () => {
    /* tslint:disable */
    const invalidJsonString = "{\"leadmineURL\": \"https://leadmine.wopr.inf.mdc\", " +
      "\"compoundConverterUrL\": \"https://compound-converter.wopr.inf.mdc/convert\"," +
      "\"unichemURL\": \"http://unichem-plus.wopr.inf.mdc/x-ref\"}";

    const urlsWithInvalidKey = JSON.parse(invalidJsonString) as APIURLs;

    expect(UrlValidator.validURLs(urlsWithInvalidKey)).toBeFalsy();
  });
});
