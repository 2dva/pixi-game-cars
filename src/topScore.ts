type ScorePair = [string, number]

export const TOP_SCORE_RESULTS_STORE_LOCAL = 10

const storageKey = 'clines_local_top'

const mockData = [
  ['User4', 18000],
  ['Andrey', 9000],
  ['Spec', 3000],
  ['Vitaly', 1000],
  ['zx', 500],
  ['uiop', 200],
  ['This_should_not_render', 200],
] as ScorePair[]

export function getTopResults(): ScorePair[] {
  const results = loadTopFromStorage()
  return results.length ? results : mockData
}

function loadTopFromStorage(): ScorePair[] {
  const stringData = localStorage[storageKey]
  const data = JSON.parse(stringData || '[]') as ScorePair[]
  return data
}

export function saveMyScore(name: string, score: number) {
  if (score <= 0) return
  const stringData = localStorage[storageKey]
  let data = JSON.parse(stringData || '[]') as ScorePair[]
  data.push([name, score])
  data.sort((a, b) => b[1] - a[1])
  data = data.slice(0, TOP_SCORE_RESULTS_STORE_LOCAL)
  
  localStorage[storageKey] = JSON.stringify(data)
}
