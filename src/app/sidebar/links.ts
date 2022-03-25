export type Link = {
  resourceName: string
  url?: string
  label?: string
  createUrl: (id: string) => string
}

export const geneNames: Link = {
  resourceName: 'HGNC',
  createUrl: (identifier: string) =>
    `https://www.genenames.org/data/gene-symbol-report/#!/hgnc_id/${identifier}`
}

export const ncbi: Link = {
  resourceName: 'NCBI',
  createUrl: (identifier: string) => `https://www.ncbi.nlm.nih.gov/search/all/?term=${identifier}`
}

export const antibodies: Link = {
  resourceName: 'Antibodies',
  createUrl: (identifier: string) => `https://www.antibodies.com/products/search=${identifier}`
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
  createUrl: (identifier: string) =>
    `https://www.ensembl.org/Homo_sapiens/Gene/Summary?g=${identifier}`
}

export const bioGrid: Link = {
  resourceName: 'BioGRID',
  createUrl: (identifier: string) =>
    `https://thebiogrid.org/${identifier}`
}

export const intAct: Link = {
  resourceName: 'IntAct',
  createUrl: (identifier: string) =>
    `https://www.ebi.ac.uk/intact/search?query=${identifier}`
}

export const openTargets: Link = {
  resourceName: 'OpenTargets',
  createUrl: (identifier: string) =>
    `http`
}

export const disGeNet: Link = {
  resourceName: 'DisGeNET',
  createUrl: (identifier: string) =>
    `http`
}

export const proteomicsDB: Link = {
  resourceName: 'ProteomicsDB',
  createUrl: (identifier: string) =>
    `https://www.proteomicsdb.org/proteomicsdb/#protein/proteinDetails/${identifier}/summary`
}

export const antibodyPedia: Link = {
  resourceName: 'AntibodyPedia',
  createUrl: (identifier: string) =>
    `http`
}

export const pfam: Link = {
  resourceName: 'Pfam',
  createUrl: (identifier: string) =>
    `http://pfam.xfam.org/family/${identifier}`
}

export const refSeq: Link = {
  resourceName: 'RefSeq',
  createUrl: (identifier: string) =>
    `https://www.ncbi.nlm.nih.gov/search/all/?term=${identifier}`
}

export const kegg: Link = {
  resourceName: 'KEGG',
  createUrl: (identifier: string) =>
    `https://www.genome.jp/entry/${identifier}`
}

export const interPro: Link = {
  resourceName: 'InterPro',
  createUrl: (identifier: string) =>
    `https://www.ebi.ac.uk/interpro/entry/InterPro/${identifier}/`
}

export const expressionAtlas: Link = {
  resourceName: 'ExpressionAtlas',
  createUrl: (identifier: string) =>
    `http`
}
  
export const uniProt: Link = {
  resourceName: 'Accession',
  label: 'Uniprot',
  createUrl: (identifier: string) =>
    `https://www.uniprot.org/uniprot/${identifier}`
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
