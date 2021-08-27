type Link = {
  name: string,
  createUrl: (id: string) => string
}

export module ExternalLinks {

  export const geneNames: Link = {
    name: 'Genenames',
    createUrl: (identifier: string) =>
      `https://www.genenames.org/data/gene-symbol-report/#!/hgnc_id/${identifier}`
  }

  export const antibodies: Link = {
    name: 'Antibodies',
    createUrl: (identifier: string) => `https://www.antibodies.com/products/search=${identifier}`
  }

  export const pubmed: Link = {
    name: 'Pubmed',
    createUrl: (identifier: string) => `https://pubmed.ncbi.nlm.nih.gov/?term=${identifier}&sort=date`,
  }

  export const addGene: Link = {
    name: 'AddGene',
    createUrl: (identifier: string) => `https://www.addgene.org/search/catalog/plasmids/?q=${identifier}`,
  }

  export const patents: Link = {
    name: 'Google patent',
    createUrl: (identifier: string) => `https://patents.google.com/?q=${identifier}`
  }

}
