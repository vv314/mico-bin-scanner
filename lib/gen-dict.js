function getHexBlock(start, end, block = 2) {
  const sDec = parseInt(start, 16)
  const eDec = parseInt(end, 16)
  const len = eDec - sDec
  const mid = sDec + (len % block ? (len + 1) / block : len / block)
  const midNext = mid + 1
  let res = [[start, mid.toString(16)]]

  if (block == 1) return res

  res = res.concat(getHexBlock(midNext.toString(16), end, --block))

  return res
}

/**
 * 生成 hash 字典
 * @param  {HexString} start 16进制字符串，起始点
 * @param  {HexString|Number} end   16 字符串时表示结束点，数字类型时表示起始后的偏移长度
 * @return {[type]}       [description]
 */
function createHashDic(start, end = 100) {
  const endNum = parseInt(end, 16)
  const isHex = (n) => /^[A-Fa-f0-9]+$/.test(n)
  let res = ''

  start = parseInt(start, 16)

  if (typeof end == 'string' && isHex(endNum)) {
    // end 为 16 进制
    end = endNum
  } else if (typeof end == 'number') {
    end = start + end
  }

  for (let i = start; i <= end; i++) {
    res += `,${Number(i).toString(16)}`
  }

  return res.substring(1)
}

function genDict(start, end, chunk) {
  const block = getHexBlock(start, end, chunk)

  return block.map(([start, end]) => createHashDic(start, end).split(','))
}

export default genDict
