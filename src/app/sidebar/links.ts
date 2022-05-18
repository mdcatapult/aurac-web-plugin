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

export type Link = {
  resourceName: string
  url?: string
  label?: string
  createUrl: (id: string) => string
}

export const hgnc: Link = {
  resourceName: 'HGNC',
  createUrl: (identifier: string) =>
    `https://www.genenames.org/data/gene-symbol-report/#!/hgnc_id/${identifier}`
}

export const ncbi: Link = {
  //KEGG uses ncbi identifier appended to the end of it (hsa:55737) and NCBI isn't a resourceName returned from Swissprot
  //, so take only the ncbi identifier from KEGG with a regex to remove anything except numbers
  resourceName: 'KEGG',
  label: 'NCBI',
  createUrl: (identifier: string) => {
    const returnNCBIIdentifier = identifier.replace(/[^0-9\.]+/g, '')

    return `https://www.ncbi.nlm.nih.gov/gene/${returnNCBIIdentifier}`
  }
}

export const antibodies: Link = {
  resourceName: 'Antibodies',
  createUrl: (identifier: string) => `https://www.antibodies.com/products/search=${identifier}`
}

export const antibodypedia: Link = {
  resourceName: 'Antibodypedia',
  createUrl: (identifier: string) => `https://www.antibodypedia.com/gene/${identifier}`
}

export const addGene: Link = {
  resourceName: 'Addgene',
  createUrl: (identifier: string) =>
    `https://www.addgene.org/search/catalog/plasmids/?q=${identifier}`
}

export const genecards: Link = {
  resourceName: 'Genecards',
  createUrl: (identifier: string) =>
    `https://www.genecards.org/cgi-bin/carddisp.pl?gene=${identifier}`
}

export const ensembl: Link = {
  resourceName: 'Ensembl',
  createUrl: (identifier: string) => `https://www.ensembl.org/Gene/Summary?g=${identifier}`
}

export const bioGrid: Link = {
  resourceName: 'BioGRID',
  createUrl: (identifier: string) => `https://thebiogrid.org/${identifier}`
}

export const intAct: Link = {
  resourceName: 'IntAct',
  createUrl: (identifier: string) => `https://www.ebi.ac.uk/intact/search?query=${identifier}`
}

export const openTargets: Link = {
  resourceName: 'OpenTargets',
  createUrl: (identifier: string) => `http`
}

export const disGeNet: Link = {
  resourceName: 'DisGeNET',
  createUrl: (identifier: string) => `https://www.disgenet.org/browser/1/1/0/${identifier}`
}

export const proteomicsDB: Link = {
  resourceName: 'ProteomicsDB',
  createUrl: (identifier: string) =>
    `https://www.proteomicsdb.org/proteomicsdb/#protein/proteinDetails/${identifier}/summary`
}

export const antibodyPedia: Link = {
  resourceName: 'AntibodyPedia',
  createUrl: (identifier: string) => `http`
}

export const pfam: Link = {
  resourceName: 'Pfam',
  createUrl: (identifier: string) => `http://pfam.xfam.org/family/${identifier}`
}

export const refSeq: Link = {
  resourceName: 'RefSeq',
  createUrl: (identifier: string) => `https://www.ncbi.nlm.nih.gov/search/all/?term=${identifier}`
}

export const kegg: Link = {
  resourceName: 'KEGG',
  createUrl: (identifier: string) => `https://www.genome.jp/entry/${identifier}`
}

export const interPro: Link = {
  resourceName: 'InterPro',
  createUrl: (identifier: string) => `https://www.ebi.ac.uk/interpro/entry/InterPro/${identifier}/`
}

export const uniProt: Link = {
  resourceName: 'Accession',
  label: 'Uniprot',
  createUrl: (identifier: string) => `https://www.uniprot.org/uniprot/${identifier}`
}

// general

export const pubmed: Link = {
  resourceName: 'Articles',
  createUrl: (identifier: string) => `https://pubmed.ncbi.nlm.nih.gov/?term=${identifier}&sort=date`
}

export const dimensions: Link = {
  resourceName: 'Top Cited Articles',
  createUrl: (identifier: string) =>
    `https://app.dimensions.ai/discover/publication?search_mode=content&search_text=${identifier}&search_type=kws&search_field=text_search&order=times_cited`
}

export const patents: Link = {
  resourceName: 'Patents',
  createUrl: (identifier: string) => `https://patents.google.com/?q=${identifier}`
}

export const geneProteinChemicalClinicalTrial: Link = {
  resourceName: 'Clinical Trial',
  createUrl: (identifier: string) =>
    `https://clinicaltrials.gov/ct2/results?cond=&term=${identifier}&cntry=&state=&city=&dist=`
}

// disease

export const drugBank: Link = {
  resourceName: 'Drug Bank',
  createUrl: (identifier: string) =>
    `https://go.drugbank.com/unearth/q?utf8=%E2%9C%93&searcher=drugs&query=${identifier}`
}

export const diseaseClinicalTrial: Link = {
  resourceName: 'Clinical Trial',
  createUrl: (identifier: string) =>
    `https://clinicaltrials.gov/ct2/results?cond=${identifier}&term=&cntry=&state=&city=&dist=`
}

export const expressionAtlas: Link = {
  resourceName: 'OpenTargets',
  label: 'Expression Atlas',
  createUrl: (identifier: string) => `https://www.ebi.ac.uk/gxa/genes/${identifier}`
}

export const geneTree: Link = {
  resourceName: 'GeneTree',
  createUrl: (identifier: string) => `https://www.ensembl.org/Multi/GeneTree/Image?gt=${identifier}`
}
