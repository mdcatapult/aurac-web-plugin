import * as links from './links';
import { Injectable } from '@angular/core';
import { Entity } from 'src/types/entity';


@Injectable({
  providedIn: 'root'
})
export class LinksService {

  constructor() { }

  getLinks(entity: Entity, synonym: string): links.Link[] {
    let entityLinks: Array<links.Link>
    const entityGroup = entity.metadata['entityGroup']
    const entityType = entity.metadata['RecognisingDict']['entityType']

    const geneAndProtein = 'Gene or Protein';
    const disease = 'Biological';
    const chemical = 'Chemical';
    
    switch (entityGroup || entityType) {
      case geneAndProtein: {
        entityLinks = [links.ncbi, links.geneNames, links.genecards, links.ensembl,
          links.antibodies, links.pubmed, links.dimensions, links.addGene, links.patents, links.geneProteinChemicalClinicalTrial];
        break;
      }
      case disease: {
        entityLinks = [links.drugBank, links.pubmed, links.dimensions, links.patents, links.diseaseClinicalTrial];
        break;
      }
      case chemical: 
      case "DictMol": {
        entityLinks = [links.pubchem, links.drugBank, links.pubmed,
          links.dimensions, links.patents, links.geneProteinChemicalClinicalTrial];
        break;
      }
      default: entityLinks = []
    }

    entityLinks.map(link => 
      link.url = link.createUrl(synonym))
    return entityLinks;

  }
}
