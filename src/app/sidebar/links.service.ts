import * as links from './links'
import { Injectable } from '@angular/core'
import { SidebarCard } from './types'
import { antibodypedia, bioGrid, disGeNet, expressionAtlas, geneTree } from './links'

@Injectable({
  providedIn: 'root'
})
export class LinksService {
  constructor() {}

  getLinks(card: SidebarCard): links.Link[] {
    let entityLinks: Array<links.Link> = []

    switch (card.recogniser) {
      case 'leadmine-chemical-entities':
      case 'leadmine-disease':
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
              links.hgnc,
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
      case 'swissprot-genes-proteins':
        entityLinks = [
          // links.ncbi,
          links.hgnc,
          links.genecards,
          links.antibodies,
          links.pubmed,
          links.dimensions,
          links.addGene,
          links.patents,
          links.geneProteinChemicalClinicalTrial
        ]
        entityLinks.map(link => (link.url = link.createUrl(card.clickedSynonymName)))

        const speciesIdentifiers = card.entity.identifierSourceToID!.get(card.selectedSpecies!)
        if (!speciesIdentifiers) {
          break
        }

        entityLinks = entityLinks.concat(
          [
            links.intAct,
            links.interPro,
            links.proteomicsDB,
            links.pfam,
            links.uniProt,
            links.kegg,
            links.ncbi,
            links.antibodypedia,
            links.bioGrid,
            links.ensembl,
            links.disGeNet,
            links.expressionAtlas,
            links.geneTree
          ]
            .filter(link => {
              const linkIdentifier = JSON.parse(speciesIdentifiers)[link.resourceName]

              return linkIdentifier && !linkIdentifier.includes(', ') // filter out cases with lists of identifiers
            })
            .map(link => {
              return {
                ...link,
                url: link.createUrl(JSON.parse(speciesIdentifiers)[link.resourceName])
              }
            })
        )
        break
    }

    return entityLinks
  }
}
