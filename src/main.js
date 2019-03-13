const envCreate = require('env-create')
const driveOps = require('./Drive/driveOps')
const sheetOps = require('./sheets/sheetOps')
const authHelper = require('./googleAuthHelper')

const auth = (path) => {
  console.log('running auth', path)
  envCreate.load({path}) // make path into an object 
}
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
// module.exports = {
//   auth,
//   driveOps,
//   sheetOps,
// }

// This is how you could return both a function that runs and some properties
// however when I did this I lost the intellisense on driveOps and sheetOps
// module.exports = function (envJsonPath) {
//   envCreate.load({path: envJsonPath})
//   const driveOps = require("./Drive/driveOps")
//   const sheetOps = require("./sheets/sheetOps")
//   return module.exports = {
//     driveOps,
//     sheetOps,
//   }
// }
