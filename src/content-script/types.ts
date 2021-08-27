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
