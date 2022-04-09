class Ticker {
  constructor() {
    this.prevCount = 0
    this.count = 0
    this.rate = 1

    this.timer = setInterval(this.tock.bind(this), 1000)
  }

  tick() {
    this.count++
  }

  tock() {
    this.rate = this.count - this.prevCount
    this.prevCount = this.count
  }

  stop() {
    this.tock()

    clearInterval(this.timer)
  }
}

class Progress {
  constructor({ total }) {
    // this.cursor = cursor || 0
    this.total = total || 0
    this.startTime = Date.now()
    this.ticker = new Ticker()
  }

  up() {
    this.ticker.tick()

    if (this.ticker.count == this.total) {
      return this.end()
    }

    return this.value()
  }

  end() {
    this.ticker.stop()

    return this.value()
  }

  value() {
    const cursor = this.ticker.count
    const percent = Math.min(cursor, this.total) / this.total
    const rate = this.ticker.rate
    const spendTime = (Date.now() - this.startTime) / 1000
    const leftTime =
      percent !== 1 ? Math.round((this.total - cursor) / rate) : 0

    return {
      percent: percent,
      speed: Number(rate.toFixed(1)), // 速率，次/秒
      size: {
        total: this.total,
        cursor: cursor,
      },
      left: this.total - cursor,
      time: {
        spend: Math.round(spendTime), // 已执行时间
        left: Math.round(leftTime), // 剩余时间
      },
    }
  }
}

export default Progress
