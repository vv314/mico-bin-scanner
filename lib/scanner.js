import ora from 'ora'
import pLimit from 'p-limit'
import headFetch from './headFetch.js'
import Archive from './Archive.js'
import Progress from './Progress.js'
import { findLeft, findRight, flattenDeep, secondFormat } from './utils.js'

const applyLimit = pLimit(30)

function getUrl(hardware = '', version, hash) {
  return `http://bigota.miwifi.com/xiaoqiang/rom/${hardware.toLowerCase()}/mico_all_${hash}_${version}.bin`
}

function printProgress(state, record) {
  const percent = `${(state.percent * 100).toFixed(2)}%`
  const speed = `${state.speed}/sec`
  const count = `${state.size.cursor}/${state.size.total}`
  const info = `${record.hash} => ${record.status}`
  const spendTime = secondFormat(state.time.spend)
  const leftTime = secondFormat(state.time.left)

  return `[${percent} ${count} ${leftTime} ${speed}] ${info} - ${spendTime}`
}

function search(getUrl, bucket, { progress, spinner, archive, context }) {
  const matchPath = async (hash, i) => {
    const shouldStop = context.isFind || context.cache.find((e) => e == hash)

    if (shouldStop) return 'BREAK'

    context.cache.push(hash)

    // 查找存档
    if (archive) {
      const record = archive.find((e) => e.hash == hash)

      if (record) {
        const progText = printProgress(progress.up(), record) + ' (skip)'

        spinner.text = progText

        return new Promise((resolve) => {
          // 强制插入事件队列
          setTimeout(resolve, 0, false)
        })
      }
    }

    let status

    try {
      status = await applyLimit(headFetch, getUrl(hash))
    } catch (e) {
      spinner.text = `Retry ${hash}`

      status = await applyLimit(headFetch, getUrl(hash))
    }

    const record = { hash, status }

    spinner.text = printProgress(progress.up(), record)

    if (status == 200) {
      context.isFind = true

      return true
    }

    // 存档里仅记录未成功数据
    archive?.add(record)

    // throw new Error(111)

    return false
  }

  async function nextTick(e, i) {
    return new Promise((resolve) => {
      process.nextTick(() => resolve(matchPath(e, i)))
    })
  }

  return [findLeft(bucket, nextTick), findRight(bucket, nextTick)]
}

async function scan(hardware, version, { dict = [], archivePath }) {
  const urlFn = getUrl.bind(null, hardware, version)
  const total = dict.reduce((sum, chunk) => sum + chunk.length, 0)
  const progress = new Progress({ total: total })
  const context = {
    isFind: false,
    cache: [],
  }
  const spinner = ora('Finding hash...')
  let archive

  console.log('Total count:', total)

  if (archivePath) {
    console.log('Use archive:', archivePath)
  }

  // just new line
  console.log()
  spinner.start()

  if (archivePath) {
    archive = new Archive(archivePath)

    spinner.text = 'Loading archive...'

    await archive.load()

    // Ctrl + C 触发
    // 程序退出时将存档写入磁盘
    ;['SIGINT', 'SIGTERM'].forEach((sig) => {
      process.on(sig, () => {
        const percent = `${(progress.value().percent * 100).toFixed(2)}%`

        archive.save()
        spinner.info(`[Archive] Save at ${percent}`)

        process.exit(0)
      })
    })
  }

  process.on('uncaughtException', (err) => {
    const percent = `${(progress.value().percent * 100).toFixed(2)}%`

    if (archive) {
      archive.save()

      spinner.fail(`[Archive] Save at ${percent}`)
    }

    throw err
  })

  const hash = await Promise.all(
    flattenDeep(
      dict.map((bucket) =>
        search(urlFn, bucket, { progress, spinner, archive, context })
      )
    )
  ).then((res) => res.find(Boolean))

  spinner.stop()
  progress.end()
  archive.save()

  return hash ? urlFn(hash) : null
}

export default scan
