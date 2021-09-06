export type Link = {
  name: string,
  createUrl: (id: string) => string
}

export module ExternalLinks {
  // genes and proteins

  export const geneNames: Link = {
    name: 'HGNC',
    createUrl: (identifier: string) =>
      `https://www.genenames.org/data/gene-symbol-report/#!/hgnc_id/${identifier}`
  }

  export const ncbi: Link = {
    name: 'NCBI',
    createUrl: (identifier: string) =>
      `https://www.ncbi.nlm.nih.gov/search/all/?term=${identifier}`
  }

  export const antibodies: Link = {
    name: 'Antibodies',
    createUrl: (identifier: string) => `https://www.antibodies.com/products/search=${identifier}`
  }

  export const addGene: Link = {
    name: 'Addgene',
    createUrl: (identifier: string) => `https://www.addgene.org/search/catalog/plasmids/?q=${identifier}`,
  }

  // chemistry

  export const pubchem: Link = {
    name: 'Pubchem',
    createUrl: (identifier: string) => `https://pubchem.ncbi.nlm.nih.gov/#query=${identifier}`,
  }

  // general

  export const pubmed: Link = {
    name: 'Articles',
    createUrl: (identifier: string) => `https://pubmed.ncbi.nlm.nih.gov/?term=${identifier}&sort=date`,
  }

  export const dimensions: Link = {
    name: 'Top Cited Articles',
    createUrl: (identifier: string) => `https://app.dimensions.ai/discover/publication?search_mode=content&search_text=${identifier}&search_type=kws&search_field=text_search&order=times_cited`,
  }

  export const patents: Link = {
    name: 'Patents',
    createUrl: (identifier: string) => `https://patents.google.com/?q=${identifier}`
  }

  export const geneProteinChemicalClinicalTrial: Link = {
    name: 'Clinical Trial',
    createUrl: (identifier: string) => `https://clinicaltrials.gov/ct2/results?cond=&term=${identifier}&cntry=&state=&city=&dist=`
  }

  // disease

  export const drugBank: Link = {
    name: 'Drug Bank',
    createUrl: (identifier: string) => `https://go.drugbank.com/unearth/q?utf8=%E2%9C%93&searcher=drugs&query=${identifier}`
  }

  export const diseaseClinicalTrial: Link = {
    name: 'Clinical Trial',
    createUrl: (identifier: string) => `https://clinicaltrials.gov/ct2/results?cond=${identifier}&term=&cntry=&state=&city=&dist=`
  }


}
