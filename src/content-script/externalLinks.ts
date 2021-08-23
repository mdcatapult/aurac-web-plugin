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

  export function createLinkHTML(document: Document, link: Link, id: string): HTMLParagraphElement {
    const paragraphElement = document.createElement('p');
    const linkUrl = link.createUrl(id);

    const anchor: HTMLAnchorElement = document.createElement('a');
    anchor.text = `${link.name}: `;
    anchor.href = linkUrl;
    anchor.target = '_blank';

    paragraphElement.id = linkUrl;
    paragraphElement.appendChild(anchor)

    return paragraphElement;

    // return `<p id=${link.url}>${link.name}: <a href=${link.url} target="_blank">${link.url}</a></p>`;
  }

  // if the entity group is 'Gene or Protein' add a genenames url link to the sidebarText element
  // export function createGeneNameLink(resolvedEntity: string): string {
  //   const id = resolvedEntity.split(':').pop();
  //   const geneNameUrl = Urls.genenames(id);
  //   return `<p id=${geneNameUrl}>Genenames link: <a href=${geneNameUrl} target="_blank">${geneNameUrl}</a></p>`;
  // }

}
