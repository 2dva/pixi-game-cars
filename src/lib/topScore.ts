type ScorePair = [string, number]

export const TOP_RESULTS_LIMIT = 6

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

export function getTopScore(): ScorePair[] {
  const results = loadTopFromStorage()
  return results.length ? results : mockData
}

function loadTopFromStorage(): ScorePair[] {
  const stringData = localStorage[storageKey]
  const data = JSON.parse(stringData || '[]') as ScorePair[]
  return data
}

export function isRecordScore(score: number) {
  if (score <= 0) return false
  const results = loadTopFromStorage()
  results.sort((a, b) => a[1] - b[1])
  return score > results[0][1]
}

export function saveMyScore(name: string, score: number) {
  if (score <= 0) return
  const stringData = localStorage[storageKey]
  let data = JSON.parse(stringData || '[]') as ScorePair[]
  data.push([name, score])
  data.sort((a, b) => b[1] - a[1])
  data = data.slice(0, TOP_RESULTS_LIMIT)
  
  localStorage[storageKey] = JSON.stringify(data)
}
