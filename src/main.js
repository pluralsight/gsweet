const envCreate = require("env-create")

module.exports = function (envJsonPath) {
  envCreate.load({path: envJsonPath})
  const driveOps = require("./Drive/driveOps")
  const sheetOps = require("./sheets/sheetOps")
  return module.exports = {
    driveOps,
    sheetOps,
  }
}
