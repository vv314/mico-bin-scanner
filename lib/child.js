import pLimit from 'p-limit'
import { findLeft, findRight } from './utils.js'

const limit = pLimit(30)
let isFind = false
let count = 0
let total = 0

function progress(curCount) {
  const p = (curCount / total) * 100

  return p.toFixed(1) + '%'
}

function search(getUrl, bucket) {
  const history = []

  const matchPath = async (hash, i) => {
    if (isFind || history.indexOf(i) > -1) return 'break'

    history.push(i)
    const code = await limit(headFetch, getUrl(hash))

    if (code == 200) {
      isFind = true

      return true
    }

    console.log(`[${progress(count++)}] ${hash}:`, code)
  }

  return [findLeft(bucket, matchPath), findRight(bucket, matchPath)]
}

export default search
