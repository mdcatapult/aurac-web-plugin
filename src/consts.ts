import {Settings} from './types'
import {environment} from './environments/environment';

export const defaultSettings: Settings = {
  urls: {
    leadmineURL: environment.leadmineURL,
    compoundConverterURL: environment.compoundConverterURL,
    unichemURL: environment.unichemURL,
  },
  xRefConfig: {},
  preferences: {
    hideUnresolved: true,
    minEntityLength: 2
  }
};

export const DictionaryURLKeys = {
  leadmineURL : 'leadmineURL',
  compoundConverterURL : 'compoundConverterURL',
  unichemURL : 'unichemURL'
};
