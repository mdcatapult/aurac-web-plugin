import { environment } from '../environments/environment'
import { Recogniser } from './recognisers'
import { Species } from './species'

export type Preferences = {
  minEntityLength: number
  recogniser: Recogniser
  species: Species
}

export type XRefSources = Record<string, boolean>

export type Settings = {
  urls: APIURLs
  xRefSources: XRefSources
  preferences: Preferences
}

export type APIURLs = {
  nerURL: string
  compoundConverterURL: string
  unichemURL: string
  pdfConverterURL: string
}

const devAPIURLs: APIURLs = {
  nerURL: 'http://localhost:8080',
  unichemURL: 'http://localhost:8081',
  compoundConverterURL: 'http://localhost:8082/convert',
  pdfConverterURL: 'http://localhost:8000/html'
}

const productionAPIURLs: APIURLs = {
  nerURL: 'https://ner-api.wopr.inf.mdc',
  compoundConverterURL: 'https://compound-converter.wopr.inf.mdc/convert',
  unichemURL: 'https://unichem-plus.wopr.inf.mdc',
  pdfConverterURL: 'https://pdf-js.wopr.inf.mdc/html'
}

export const defaultSettings: Settings = {
  urls: environment.production ? productionAPIURLs : devAPIURLs,
  xRefSources: {},
  preferences: {
    minEntityLength: 3,
    recogniser: 'leadmine-proteins',
    species: 'Homo sapiens'
  }
}
