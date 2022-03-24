export function allSpecies(): Species[] {
    return ALL_SPECIES.map(e => e)
  }
  
  const ALL_SPECIES = [
    'Homo sapiens',
    'Rattus norvegicus',
    'Mus musculus',
    'Saccharomyces cerevisiae',
    'Drosophila melanogaster',
    'Caenorhabditis elegans',
    'Xenopus tropicalis',
    'Danio rerio'
  ] as const
  type SpeciesTuple = typeof ALL_SPECIES
  export type Species = SpeciesTuple[number]
  