import { Entity } from "./types";

export module Card {

// Creates a card for `information`
  export function create(information: Entity): HTMLDivElement {
    const card: HTMLDivElement = document.createElement('div');
    renderArrowButtonElements(card, information);
    renderOccurrenceCounts(card, information);
    renderRemoveEntityFromSidebarButtonElement(card, information);

    // TODO move style
    card.id = 'sidebar-text';
    card.style.border = '1px solid black';
    card.style.padding = '2px';
    card.style.marginBottom = '5px';
    card.style.backgroundColor = information.recognisingDict.htmlColor;

    card.insertAdjacentHTML('beforeend', `<p>Term: ${information.entityText}</p>`);
    if (information.resolvedEntity) {
      card.insertAdjacentHTML('beforeend', `<p>Resolved entity: ${information.resolvedEntity}</p>`);

      if (information.entityGroup === 'Gene or Protein') {
        const geneNameLink = createGeneNameLink(information.resolvedEntity);
        card.insertAdjacentHTML('beforeend', geneNameLink);
      }
    }

    card.insertAdjacentHTML('beforeend', `<p>Entity Type: ${information.recognisingDict.entityType}</p>`);

    const xrefHTML: HTMLDivElement = document.createElement('div')

    xrefHTML.className = information.entityText;
    card.appendChild(xrefHTML);
    // sidebarTexts.appendChild(sidebarText);
    return card;
  }

  // if the entity group is 'Gene or Protein' add a genenames url link to the sidebarText element
  function createGeneNameLink(resolvedEntity: string): string {
    const id = resolvedEntity.split(':').pop();
    const geneNameUrl = `https://www.genenames.org/data/gene-symbol-report/#!/hgnc_id/${id}`;
    return `<p id=${geneNameUrl}>Genenames link: <a href=${geneNameUrl} target="_blank">${geneNameUrl}</a></p>`;
  }
}
