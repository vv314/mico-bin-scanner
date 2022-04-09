import fs from 'fs-extra'
import scan from './lib/scanner.js'
import { getPath } from './lib/utils.js'

const dict = await fs.readJSON('./data/dict.json')
const archivePath = getPath(import.meta.url, './data/archive.json')

// @TODO
// 多线程同步进度
// 异步写文件

scan('lx04', '2.36.107', { dict: [dict[1]], archivePath }).then((res) => {
  if (res) {
    console.log('\nFIND:', res)
  } else {
    console.log('\nNOT FIND :(')
  }
})
