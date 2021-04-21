import { TestBed } from '@angular/core/testing';

import { SettingsService } from './settings.service';
import {DictionaryURLs} from '../../types';

describe('SettingsService', () => {
  let service: SettingsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SettingsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return false when given invalid URLs', () => {
    const invalidUrls: DictionaryURLs = {
      leadmineURL: 'dhfjdhrks',
      compoundConverterURL: 'asdfsdaf',
      unichemURL: '/dfdsf/asd???=asdf',
    };

    expect(service.validURLs(invalidUrls)).toBeFalse();
  });

  it('should return false given some valid and invalid URLs', () => {
    const validURLs: DictionaryURLs = {
      leadmineURL: '',
      compoundConverterURL: 'https://compound-converter.wopr.inf.mdc/convert',
      unichemURL: 'http://unichem-plus.wopr.inf.mdc/x-ref'
    };

    expect(service.validURLs(validURLs)).toBeFalse();
  });

  it('should return true given valid URLs', () => {
    const validURLs: DictionaryURLs = {
      leadmineURL: 'https://leadmine.wopr.inf.mdc',
      compoundConverterURL: 'https://compound-converter.wopr.inf.mdc/convert',
      unichemURL: 'http://unichem-plus.wopr.inf.mdc/x-ref'
    };

    expect(service.validURLs(validURLs)).toBeTruthy();
  });

  it('should return false given invalid dictionary URL keys', () => {

    const invalidJsonString = "{\"leadmineURL\": \"https://leadmine.wopr.inf.mdc\", " +
      "\"compoundConverterUrL\": \"https://compound-converter.wopr.inf.mdc/convert\"," +
      "\"unichemURL\": \"http://unichem-plus.wopr.inf.mdc/x-ref\"}"

    const validURLs = JSON.parse(invalidJsonString) as DictionaryURLs;

    expect(service.validURLs(validURLs)).toBeFalse();
  });
});
