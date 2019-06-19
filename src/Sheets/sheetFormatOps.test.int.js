const chai = require('chai')
chai.should()
const Gsweet = require('../main')
const testData = require('../test-data/integration.json')
const testSheet = testData.sheet


const gsweet = new Gsweet({
  pathOrVarName: '/Users/tod-gentille/dev/node/ENV_VARS/gsweet.env.json',
  useExistingEnvVar: false,
})
const {sheetFormatOps} = gsweet


describe('INTEGRATION TESTS sheetFormatOps module', function() {
  this.timeout(10000)
  const sheetRange = {}

  beforeEach(() => {
    sheetRange.id = testSheet.id
    sheetRange.range = `${testSheet.tabName}!A1`
    sheetRange.value = ''
    sheetRange.data = [['Row1Test'], ['Row2Test']]
  })

  describe('formatting command',   () => {
    let baseOptions
    beforeEach(() => {
      baseOptions = {
        sheetId:0,   // the default sheet always has an id of 0 - other sheets have real ids
        row:2,
        col:0,
      }
    })
  
    it('formatCellsBgColor() should set the desired cells to the specified color', async () => {
      const formatOptions = {...baseOptions, numRows:1, numCols:2, color:{r:1.0, g:0.67, b:1.0},
      }
      const result = await sheetFormatOps.formatCellsBgColor({id:sheetRange.id, formatOptions})
      result.isValid.should.be.true
    })

    it('formatSingleBgColor() should set a single cell to the specified color', async () => {
      const formatOptions = {...baseOptions, color:{r:1.0, g:0.67, b:1.0}}
      const result = await sheetFormatOps.formatSingleBgColor({id:sheetRange.id, singleCellOptions:formatOptions})
      result.isValid.should.be.true
    })

    it('addNoteToCell() should add a note to the specified cell', async () => {
      const noteOptions = {...baseOptions,  note:'Adding a note through the API'}
      const result = await sheetFormatOps.addNoteToCell({id:sheetRange.id, noteOptions})
      result.isValid.should.be.true
    })


    it('makeBatchRequest() should format and submit multiple requests ', async () => {
      const noteOptions = {...baseOptions,  note:'Adding a note through the API'}
      const requests = []
      requests.push(sheetFormatOps.getAddNoteRequest(noteOptions))
      const bgColorOptions = {...baseOptions, color:{r:1.0, g:0.67, b:1.0}}
      requests.push(sheetFormatOps.getBgColorRequest(bgColorOptions))
      const result = await sheetFormatOps.makeBatchRequest({id:sheetRange.id, requestArray:requests})
      result.isValid.should.be.true
    })
  })

  it('renameSheet() should rename the sheet with the given id', async () => {
    const id = '1pLB4AmPpInCpHy3A_lCwqWkt2jc_itif3gNMyhIy4Do'

    const result = await sheetFormatOps.renameSheet({id, newName:'rename me', sheetId:0})
    console.log(result)
  })
})