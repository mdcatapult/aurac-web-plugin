import { Link } from "./externalLinks"

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

export type SavedCard = Entity & {
  time: string,
  originalURL: string,
  links: Link[]
}
