const envCreate = require('env-create')
const driveOps = require('./Drive/driveOps')
const sheetOps = require('./sheets/sheetOps')


class GSweet {
  constructor(pathString) {
    envCreate.load({path: pathString})
    this.sheetOps = sheetOps
    this.driveOps = driveOps
    this.sheetOps.autoInit()
    this.driveOps.autoInit()
  }
}

module.exports = GSweet

