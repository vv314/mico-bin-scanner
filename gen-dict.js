import genDict from './lib/gen-dict.js'
import { getPath, writeJSON, getJsonSize } from './lib/utils.js'

const dict = genDict('10000', 'fffff', 20)
const dest = getPath(import.meta.url, 'data/dict.json')
const total = dict.reduce((sum, chunk) => sum + chunk.length, 0)

writeJSON(dest, dict)

console.log({
  path: dest,
  bucket: dict.map((chunk) => chunk.length),
  size: getJsonSize(dict),
  total: total,
})
