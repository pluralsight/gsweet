const envCreate = require('env-create')
const driveOps = require('./Drive/driveOps')
const sheetOps = require('./sheets/sheetOps')


class GSweet {
  /**
   * @param {{pathOrVarName:string, useExistingEnvVar:boolean}} param 
   */
  constructor(param) {
    const {pathOrVarName, useExistingEnvVar} = param
    if (useExistingEnvVar) {
      process.env.gsweet = process.env[pathOrVarName]
    } else {
      envCreate.load({path:pathOrVarName})
    }
    
    this.sheetOps = sheetOps
    this.driveOps = driveOps
    this.sheetOps.autoInit()
    this.driveOps.autoInit()
  }
}

module.exports = GSweet

