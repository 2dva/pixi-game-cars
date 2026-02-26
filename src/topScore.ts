
type ScorePair = [string, number]

const storageKey = 'clines_local_top'

const mockData = [
  ['User1', 18000],
  ['User2', 9000],
  ['User3', 3000],
  ['User4', 1000],
  ['User5', 500],
  ['User6', 200],
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

function saveTopToStorage(name: string, score: number) {
  const stringData = localStorage[storageKey]
  let data = JSON.parse(stringData || '[]') as ScorePair[]
  data.push([name, score])
  data.sort((a, b) => a[1] - b[1])
  data = data.slice(0, 10)

  localStorage[storageKey] = JSON.stringify(data)
}
