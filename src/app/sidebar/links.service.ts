/*
 * Copyright 2022 Medicines Discovery Catapult
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as links from './links'
import { Injectable } from '@angular/core'
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
