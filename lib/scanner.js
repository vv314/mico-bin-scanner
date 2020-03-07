const pLimit = require('p-limit')
const {
  genHashDic,
  getHexBlock,
  headFetch,
  findLeft,
  findRight,
  flattenDeep
} = require('./utils')

const limit = pLimit(30)
let isFind = false
let total = 0
let count = 0

function progress(curCount) {
  const p = (curCount / total) * 100

  return p.toFixed(1) + '%'
}

function getUrl(romType = '', version, hash) {
  return `http://bigota.miwifi.com/xiaoqiang/rom/${romType.toLowerCase()}/mico_all_${hash}_${version}.bin`
}

function search(getUrl, start, end) {
  const hashDir = genHashDic(start, end).split(',')
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

  return [findLeft(hashDir, matchPath), findRight(hashDir, matchPath)]
}

async function scan(romType, version) {
  const start = '10000'
  const end = 'fffff'
  const hexBlock = getHexBlock(start, end)
  const urlFn = getUrl.bind(null, romType, version)

  total = parseInt(end, 16) - parseInt(start, 16)

  console.log('\nTotal count', total, '\n')

  const res = await Promise.all(
    flattenDeep(hexBlock.map(block => search(urlFn, ...block)))
  )
  const hash = res.find(Boolean)

  // 置于调用栈最后
  setTimeout(() => {
    if (hash) {
      console.log('\nFIND:', urlFn(hash))
    } else {
      console.log('\nNOT FIND')
    }
  }, 0)
}

module.exports = scan
