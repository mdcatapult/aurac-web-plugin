/*
 * Copyright 2022 Medicines Discovery Catapult
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

function replacer(key: any, value: any): any {
  if (value instanceof Map) {
    return {
      dataType: 'Map',
      value: Array.from(value.entries()).map(([k, v]) => {
        if (v instanceof Map || v instanceof Set) {
          return replacer(k, v)
        }

        return [k, v]
      }) // or with spread: value: [...value]
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
    return value
  }
}

function reviver(key: any, value: any) {
  if (typeof value === 'object' && value !== null) {
    if (value.dataType === 'Map') {
      return new Map(value.value)
    }

    if (value.dataType === 'Set') {
      return new Set(value.value)
    }
  }

  return value
}

export function stringifyWithTypes(thing: any): string {
  return JSON.stringify(thing, replacer)
}

export function parseWithTypes(thing: string): any {
  return JSON.parse(thing, reviver)
}
