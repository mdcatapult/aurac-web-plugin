import {cardClassName, Entity} from './types';
import {ExternalLinks, Link} from './externalLinks';
import {CardButtons} from './cardButtons';
import {Globals} from './globals'

export module Card {

  import links = ExternalLinks;
  import dimensionsLink = ExternalLinks.dimensions;
  const geneAndProtein = 'Gene or Protein';
  const disease = 'Biological';
  const chemical = 'Chemical';
  export const entityBaseClass = 'aurac-entity-text'

  function createListOfLinks(categoryName: string, hrefList: Array<Link>): HTMLUListElement {
    const htmlListOfLinks: HTMLUListElement = Globals.document.createElement('ul');
    htmlListOfLinks.classList.add('aurac-mdc-href-list-style');
    hrefList.forEach(element => {
      const link: string = element.createUrl(categoryName);
      htmlListOfLinks.insertAdjacentHTML('beforeend', `<li><a href=${link} target="_blank"> ${element.name}</a></li>`);
    });
    return htmlListOfLinks;
  }

  export function getEntityClass(entityId: string): string {
    return `${entityBaseClass}-${entityId}`
  }

  // Creates a card for a given entity
  export function create(information: Entity, synonyms: string[], listOfEntities: Entity[]): HTMLDivElement {
    const card: HTMLDivElement = Globals.document.createElement('div');
    card.className = cardClassName;
    card.id = `${cardClassName}.${information.entityText}`;
    card.style.backgroundColor = information.recognisingDict.htmlColor;

    const entity: string = information.entityText.toLowerCase().replace(/\s/g, '%20');

    const entityLinks = getEntityLinks(information);
    const links = createListOfLinks(entity, entityLinks);

    card.appendChild(CardButtons.createCardControls(information, entityLinks, synonyms, listOfEntities));

    const entityId = information.resolvedEntity || information.entityText

    // If possible link directly to the gene/protein using the resolvedEntity from the entityText
    // We could move this to the externalLinks class (or elsewhere) and make them for each type of entity.
    if (information.entityGroup === 'Gene or Protein' && information.resolvedEntity) {
      const geneNameLink = ExternalLinks.geneNames.createUrl(information.resolvedEntity);
      card.insertAdjacentHTML('beforeend', `<p id=${getEntityClass(entityId)}><a target="_blank" href="${geneNameLink}" title="Link to HGNC for this gene/protein">${synonyms.toString()}</a></p>`);
    } else {
      card.insertAdjacentHTML('beforeend', `<p id=${getEntityClass(entityId)}>${synonyms.toString()}</p>`);
    }
    card.insertAdjacentHTML('beforeend', `<p>Links:</p>`);
    card.appendChild(links);

    card.appendChild(createCrossReferences(information.entityText));

    listOfEntities.push(information)
    return card;
  }

  export function createModalOpeningButton(chemblId: string, compoundName: string): HTMLElement {
    const modalButton = document.createElement('button')
    modalButton.insertAdjacentHTML('beforeend', `Structure`)
    modalButton.id = `aurac-modal-open-button-${compoundName}`
    modalButton.className = 'open-modal-button'
    modalButton.addEventListener('click', () => Globals.browser.sendMessage({type: 'open_modal', body: chemblId})
    .catch(e => console.error(e)));

    return modalButton
  }

  export function setXRefHTML(xrefs: { databaseName: string, url: string, compoundName: string }[]): void {
    if (!xrefs.length) {
      return;
    }
    // Remove existing xrefs
    const xrefHolder: HTMLElement = Globals.document.getElementById(xrefs[0].compoundName + '_list')!;
    while (xrefHolder.firstChild) {
      xrefHolder.removeChild(xrefHolder.lastChild!);
    }
    const xrefParent: HTMLElement = Globals.document.getElementById(xrefs[0].compoundName)!;
    // Show the parent div if there are any xrefs
    xrefs.length > 0 ? xrefParent.classList.remove('aurac-mdc-hidden') : '';
    // Then add the xrefs
    xrefs.forEach(xref => {
      const htmlListElement: HTMLLIElement = Globals.document.createElement('li');
      htmlListElement.innerHTML = `<a href=${xref.url} target="_blank" title="Link to ${xref.databaseName} reference for this entity">${xref.databaseName}</a>`;
      xrefHolder.appendChild(htmlListElement);
      const splitURLList: Array<string> = xref.url.split('/')
      const identifier: string = splitURLList[splitURLList.length - 1]
      const regex = /^CHEMBL/
      if (identifier.match(regex)){
        const locationForButton = Globals.document.getElementById(`${xrefs[0].compoundName}`)
        const modalButton = createModalOpeningButton(identifier, xrefs[0].compoundName)
        locationForButton!.append(modalButton)
      }
    });
  }

  export function populateEntityToOccurrences(entityText: string, occurrence: Element): void {
    if (!CardButtons.entityToOccurrence.has(entityText)) {
      CardButtons.entityToOccurrence.set(entityText, [occurrence]);
    } else {
      CardButtons.entityToOccurrence.get(entityText)!.push(occurrence);
    }
  }

  // Area where links to any external info sources will be added
  export function getEntityLinks(entity: Entity): Link[] {
    let entityLinks: Array<Link> = [];
    switch (entity.entityGroup || entity.recognisingDict.entityType) {
      case geneAndProtein: {
        entityLinks = [links.ncbi, links.geneNames, links.genecards, links.ensembl,
          links.antibodies, links.pubmed, dimensionsLink, links.addGene, links.patents, links.geneProteinChemicalClinicalTrial];
        break;
      }
      case disease: {
        entityLinks = [links.drugBank, links.pubmed, dimensionsLink, links.patents, links.diseaseClinicalTrial];
        break;
      }
      case chemical: {
        entityLinks = [links.pubchem, links.drugBank, links.pubmed,
          dimensionsLink, links.patents, links.geneProteinChemicalClinicalTrial];
        break;
      }
    }
    return entityLinks;
  }

  // Div where any cross references will be added
  export function createCrossReferences(entityText: string): HTMLDivElement {
    const xrefHTML: HTMLDivElement = Globals.document.createElement('div');
    xrefHTML.classList.add('aurac-mdc-hidden');
    xrefHTML.title = 'Links direct to pages on external sources for this entity';
    const htmlParagraphElement: HTMLParagraphElement = Globals.document.createElement('p');
    htmlParagraphElement.innerHTML = 'Cross references:';

    xrefHTML.id = entityText;
    xrefHTML.appendChild(htmlParagraphElement);
    const xrefHTMLList: HTMLUListElement = Globals.document.createElement('ul');
    xrefHTMLList.className = 'aurac-mdc-href-list-style';
    xrefHTMLList.id = entityText + '_list';
    xrefHTML.appendChild(xrefHTMLList);
    return xrefHTML;
  }
}
