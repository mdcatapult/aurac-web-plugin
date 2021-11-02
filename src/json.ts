function replacer(key: any, value: any): any {
  if(value instanceof Map) {
    return {
      dataType: 'Map',
      value: Array.from(value.entries()).map(([k, v]) => {
        if (v instanceof Map || v instanceof Set) {
          return replacer(k, v)
        }
        return [k,v]
      }), // or with spread: value: [...value]
    }
  } else if (value instanceof Set) {
    return {
      dataType: 'Set',
      value: Array.from(value.values()).map(v => {
        if (v instanceof Map || v instanceof Set) {
          return replacer(v, v)
        }
        return v
      })
    }
  } else {
    return value;
  }
}

function reviver(key: any, value: any) {
  if(typeof value === 'object' && value !== null) {
    if (value.dataType === 'Map') {
      return new Map(value.value)
    }

    if (value.dataType === 'Set') {
      return new Set(value.value)
    }
  }
  return value;
}

export function stringifyWithTypes(thing: any): string {
  return JSON.stringify(thing, replacer)
}

export function parseWithTypes(thing: string): any {
  return JSON.parse(thing, reviver)
}