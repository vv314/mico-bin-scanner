import fs from 'fs-extra'
import { fileURLToPath } from 'node:url'
import filesize from 'filesize'

async function findLeft(arr, fn) {
  for (let i = 0, len = arr.length; i < len; i++) {
    const res = await fn(arr[i], i)

    if (res) return res == 'BREAK' ? null : arr[i]
  }

  return null
}

async function findRight(arr, fn) {
  for (let i = arr.length - 1; i >= 0; i--) {
    const res = await fn(arr[i], i)

    if (res) return res == 'BREAK' ? null : arr[i]
  }

  return null
}

function flattenDeep(arr) {
  return arr.reduce(
    (acc, val) =>
      Array.isArray(val) ? acc.concat(flattenDeep(val)) : acc.concat(val),
    []
  )
}

function getPath(base, relative) {
  return fileURLToPath(new URL(relative, base))
}

function writeJSON(dest, json) {
  fs.writeJSONSync(dest, json)
}

function getJsonSize(json) {
  const content = typeof json == 'string' ? json : JSON.stringify(json)

  return filesize(content.length)
}

function secondFormat(sec) {
  const h = parseInt(sec / 3600, 10)
  const m = parseInt((sec % 3600) / 60, 10)
  const s = (sec % 3600) % 60
  const f = (n) => (n > 9 ? n : '0' + n)

  return [h ? f(h) : null, f(m), f(s)].filter(Boolean).join(':')
}

export {
  flattenDeep,
  findLeft,
  findRight,
  getPath,
  writeJSON,
  getJsonSize,
  secondFormat,
}
