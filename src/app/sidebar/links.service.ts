import * as links from './links'
import { Injectable } from '@angular/core'
import { Entity } from 'src/types/entity'
import { SidebarCard } from './types'

@Injectable({
  providedIn: 'root'
})
export class LinksService {
  constructor() {}

  getLinks(card: SidebarCard): links.Link[] {
    let entityLinks: Array<links.Link> = []

    switch (card.recogniser) {
      case 'leadmine-chemical-entities':
      case 'leadmine-diseases':
      case 'leadmine-proteins':
        if (!card.entity.metadata) {
          return entityLinks
        }

        const entityGroup = card.entity.metadata['entityGroup']
        const entityType = card.entity.metadata['RecognisingDict']['entityType']

        const geneAndProtein = 'Gene or Protein'
        const disease = 'Biological'
        const chemical = 'Chemical'

        switch (entityGroup || entityType) {
          case geneAndProtein: {
            entityLinks = [
              links.ncbi,
              links.geneNames,
              links.genecards,
              links.ensembl,
              links.antibodies,
              links.pubmed,
              links.dimensions,
              links.addGene,
              links.patents,
              links.geneProteinChemicalClinicalTrial
            ]
            break
          }
          case disease: {
            entityLinks = [
              links.drugBank,
              links.pubmed,
              links.dimensions,
              links.patents,
              links.diseaseClinicalTrial
            ]
            break
          }
          case chemical:
          case 'DictMol': {
            entityLinks = [
              links.pubchem,
              links.drugBank,
              links.pubmed,
              links.dimensions,
              links.patents,
              links.geneProteinChemicalClinicalTrial
            ]
            break
          }
          default:
            entityLinks = []
        }

        entityLinks.map(link => (link.url = link.createUrl(card.clickedSynonymName)))

        break
    }

    return entityLinks
  }
}
