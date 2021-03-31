
/**
 * @file Rolls up the Gsuite services into one class
 * [GPL License Full Text](https://spdx.org/licenses/GPL-3.0-or-later.html)
 *
 * @author Tod Gentille <tod-gentille@pluralsight.com>
 * @license GPL-3.0-or-later
 * @module GSweet
 */
const envCreate = require('env-create')
const driveOps = require('./drive/driveOps')
const sheetOps = require('./sheets/sheetOps')
const sheetFormatOps = require('./sheets/sheetFormatOps')
/**
 * @typedef {object} PathOrExisting
 * @property {string} pathOrVarName
 * @property {boolean} useExistingEnvVar
 */
class GSweet {
  /**
   * @param {PathOrExisting} param
   */
  constructor(param = {pathOrVarName:'', useExistingEnvVar:false}) {
    if (param.useExistingEnvVar == undefined) {
      param.useExistingEnvVar = false
    }
    const {pathOrVarName, useExistingEnvVar} = param
    if (useExistingEnvVar) {
      process.env.GSWEET = process.env[pathOrVarName]
    } else {
      envCreate.load({path:pathOrVarName})
    }
    
    this.sheetOps = sheetOps
    this.sheetFormatOps = sheetFormatOps 
    this.driveOps = driveOps
    this.sheetOps.autoInit()
    this.driveOps.autoInit()
    this.sheetFormatOps.autoInit()
  }
}

module.exports = GSweet

