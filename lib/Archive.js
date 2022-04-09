import fs from 'fs-extra'
import { writeJSON } from './utils.js'

class Archive {
  constructor(archivePath) {
    this.archive = []
    this.archivePath = archivePath
    this.prevArchive

    if (!archivePath) {
      throw new Error('缺少 archivePath 参数')
    }

    fs.ensureFileSync(this.archivePath)
  }

  async load() {
    try {
      this.prevArchive = await fs.readJSON(this.archivePath)
    } catch (e) {
      this.prevArchive = []
    }

    this.archive = Array.from(this.prevArchive)
  }

  find(record) {
    let fn = (e) => e == record

    if (typeof record == 'function') {
      fn = record
    }

    return this.archive.find(fn)
  }

  add(record) {
    this.archive = this.archive.concat(record)

    return this
  }

  save() {
    writeJSON(this.archivePath, this.archive)

    return this.archivePath
  }
}

export default Archive
