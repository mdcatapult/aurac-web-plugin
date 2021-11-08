import { Entity, Link, ExternalLinks} from './../../types';
import { Injectable } from '@angular/core';


@Injectable({
  providedIn: 'root'
})
export class LinksService {

  constructor() { }

  getLinks(entity: Entity): Link[] {
    let entityLinks: Array<Link>
    const links = ExternalLinks
    const entityGroup = entity.metadata['entityGroup']
    const entityType = entity.metadata['RecognisingDict']['entityType']

    const geneAndProtein = 'Gene or Protein';
    const disease = 'Biological';
    const chemical = 'Chemical';
    console.log(entity)

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
      case chemical: {
        entityLinks = [links.pubchem, links.drugBank, links.pubmed,
          links.dimensions, links.patents, links.geneProteinChemicalClinicalTrial];
        break;
      }
      default: entityLinks = []
    }
    return entityLinks;

  }
}
