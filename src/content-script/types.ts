export type Entity = {
  entityText: string,
  resolvedEntity: string,
  entityGroup: string,
  recognisingDict: {
    htmlColor: string,
    entityType: string,
    source: string,
  },
}

export type ElementProperties = {
  element: HTMLElement,
  position: {
    expanding: number,
    collapsing: number
  },
  property: 'left' | 'marginLeft' | 'width',
  isReversed?: boolean
};
