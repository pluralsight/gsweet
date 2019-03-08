const driveOps = require("./Drive/driveOps")
const sheetOps = require("./sheets/sheetOps")
const envCreate = require("env-create")

const auth = (filePath) => {
  envCreate.load({path: filePath})
}
module.exports = {
  driveOps,
  sheetOps,
  auth,
}
