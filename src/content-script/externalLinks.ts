type Link = {
  name: string,
  createUrl: (id: string) => string
}

export module ExternalLinks {

  export const ncbi: Link = {
    name: 'NCBI',
    createUrl: (identifier: string) =>
      `https://www.ncbi.nlm.nih.gov/search/all/?term=${identifier}`
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
