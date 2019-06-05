const envCreate = require('env-create')
const driveOps = require('./drive/driveOps')
const sheetOps = require('./sheets/sheetOps')
const sheetFormatOps = require('./sheets/sheetFormatOps')


class GSweet {
  /**
   * @param {{pathOrVarName:string, useExistingEnvVar:boolean}} param 
   */
  constructor(param = {pathOrVarName:'', useExistingEnvVar:false}) {
    if (param.useExistingEnvVar == undefined) {
      param.useExistingEnvVar = false
    }
    const {pathOrVarName, useExistingEnvVar} = param
    if (useExistingEnvVar) {
      console.log('LOADING from pre-existing env var', pathOrVarName)
      process.env.GSWEET = process.env[pathOrVarName]
    } else {
      envCreate.load({path:pathOrVarName})
    }
    
    this.sheetOps = sheetOps
    this.sheetFormatOps = sheetFormatOps 
    this.driveOps = driveOps
    this.sheetOps.autoInit()
    this.driveOps.autoInit()
  }
}

module.exports = GSweet

