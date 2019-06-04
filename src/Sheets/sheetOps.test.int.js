/**
 * @module Sheet/sheetOps Integration Tests
 * @author Tod Gentille <tod-gentille@pluralsight.com>
 */
const chai = require('chai')
const should = chai.should()
const Gsweet = require('../main')
const logger = require('../utils/logger')
const testData = require('../test-data/integration.json')
const testSheet = testData.sheet

const gsweet = new Gsweet({
  pathOrVarName: '/Users/tod-gentille/dev/node/ENV_VARS/gsweet.env.json',
  useExistingEnvVar: false,
})
const {sheetOps} = gsweet

before(() => {
  logger.level = 'info'
})
after(() => {
  logger.level = 'debug'
})

/** @see sheetOps module */
describe('INTEGRATION TESTS sheetOps module', function() {
  this.timeout(10000)
  const SINGLE_CELL = `${testSheet.tabName}!C1`
  const sheetRange = {}

  beforeEach(() => {
    sheetRange.id = testSheet.id
    sheetRange.range = `${testSheet.tabName}!A1`
    sheetRange.value = ''
    sheetRange.data = [['Row1Test'], ['Row2Test']]
  })

  describe('setRangeData() should', () => {
    it('set a single value when passed a [[oneItem]] 2D array', async () => {
      sheetRange.data = [['Row1TestMe']]
      const result = await sheetOps.setRangeData(sheetRange)
      result.data.updatedCells.should.equal(1)
    })

    it('set multiple rows in a single column', async () => {
      const result = await sheetOps.setRangeData(sheetRange)
      result.data.updatedCells.should.equal(2)
    })

    it('set multiple columns and rows ', async () => {
      sheetRange.data = [
        ['Row1Col1Test', 'Row1Col2Test'],
        ['Row2Col1Test', 'Row2Col2Test']
      ]
      const result = await sheetOps.setRangeData(sheetRange)
      const expected = [].concat(...sheetRange.data).length
      result.data.updatedCells.should.equal(expected)
    })

    it('not overwrite cells that align to empty cells in a sparse array', async () => {
      sheetRange.data = [[], ['Row2Col1Test', 'Row2Col2Test']]
      const result = await sheetOps.setRangeData(sheetRange)
      result.data.updatedCells.should.equal(2)
    })
  })

  describe('setSheetCell() should', () => {
    it('set a single value by just passing in the value in sheetRange.value property', async () => {
      sheetRange.range = SINGLE_CELL
      const result = await sheetOps.setSheetCell(sheetRange)
      result.data.updatedCells.should.equal(1)
    })
  })

  describe('getSheetValues() should', () => {
    beforeEach(() => {
      sheetRange.range = `${testSheet.tabName}!A1:C2`
    })
    const setTestData = async data => {
      sheetRange.data = data
      await sheetOps.setRangeData(sheetRange)
      return [].concat(...data).length
    }

    it('return a single value for a range that is one cell', async () => {
      sheetRange.value = 'oneValue'
      sheetRange.range = SINGLE_CELL
      await sheetOps.setSheetCell(sheetRange)
      const result = await sheetOps.getSheetValues(sheetRange)
      console.log(result[0][0])
      console.log(sheetRange.value)
      result[0][0].should.equal(sheetRange.value)
    })

    it('return multiple values, one for each cell with data in range', async () => {
      const data = [[1, 2, 3], [4, 5, 6]]
      const expectedNumCells = await setTestData(data)
      const result = await sheetOps.getSheetValues(sheetRange)
      const numCells = [].concat(...result).length
      numCells.should.equal(expectedNumCells)
    })

    it('return a shortened array when a row ends with a blank cell', async () => {
      const data = [[1, 2, ''], [4, 5, 6]]
      const expectedNumCells = await setTestData(data)
      const result = await sheetOps.getSheetValues(sheetRange)
      const numCells = [].concat(...result).length
      numCells.should.equal(expectedNumCells - 1)
    })

    it('return a full array when a row has a blank cell in the middle', async () => {
      const data = [[1, '', 3], [4, 5, 6]]
      const expectedNumCells = await setTestData(data)
      const result = await sheetOps.getSheetValues(sheetRange)
      const numCells = [].concat(...result).length
      numCells.should.equal(expectedNumCells)
    })

    it('return a shortened array when the final row has no data ', async () => {
      const data = [[1, '', 3], ['', '', '']]
      await setTestData(data)
      const result = await sheetOps.getSheetValues(sheetRange)
      should.not.exist(result[1])
    })
  })

  describe('Meta Data functions', () => {
    beforeEach(() => {})
    it('getSheetProperties() should return some meta data.', async () => {
      const result = await sheetOps.getSheetProperties(sheetRange.id)
      // console.log('>>>', JSON.stringify(result.data, null, 2))
      result.data.sheets.should.exist
      // console.log(result.data.sheets[0].properties.gridProperties.rowCount)
    })

    it('getSheetGridProperties() with good index should return grid data', async () => {
      const sheetInfo = {sheetId:sheetRange.id, sheetIndex:0}
      const result = await sheetOps.getSheetGridProperties(sheetInfo)
      result.isValid.should.be.true
      result.message.should.equal('')
    })
    it('getSheetGridProperties() with bad index should return error', async () => {
      const sheetInfo = {sheetId:sheetRange.id, sheetIndex:1}
      const result = await sheetOps.getSheetGridProperties(sheetInfo)
      result.isValid.should.be.false
      result.message.should.contain('Error')
    })

    it('getSheetGridProperties() with good sheet name should return grid data', async () => {
      const sheetInfo = {sheetId:sheetRange.id, sheetName:testSheet.tabName}
      const result = await sheetOps.getSheetGridProperties(sheetInfo)
      result.message.should.equal('')
      result.isValid.should.be.true
    })

    it('getSheetGridProperties() with bad sheet name should return grid data', async () => {
      const sheetInfo = {sheetId:sheetRange.id, sheetName:'NonexistentSheetName'}
      const result = await sheetOps.getSheetGridProperties(sheetInfo)
      result.message.should.contain('Error')
      result.isValid.should.be.false
    })
  })

  describe('formatCellsBgColor',   () => {
    let baseOptions
    beforeEach(() => {
      baseOptions = {
        sheetId:0,
        row:2,
        col:0,
      }
    })
    it('should set the desired cells to the specified color', async () => {
      const formatOptions = {...baseOptions, numRows:1, numCols:2, color:{r:1.0, g:0.67, b:1.0},
      }
      const result = await sheetOps.formatCellsBgColor({id:sheetRange.id, formatOptions})
      result.statusText.should.equal('OK')
    })

    it('should add a note to the specified cell', async () => {
      const noteOptions = {...baseOptions,  note:'Adding a note through the API'}
      const result = await sheetOps.addNoteToCell({id:sheetRange.id, noteOptions})
      result.statusText.should.equal('OK')
    })

    it('should add a note to the specified cell when using the Sheet Name to get Index', async () => {
      const noteOptions = {...baseOptions,  note:'Adding a note through the API'}
      const sheetName = 'Sheet2'
      const findSheet = await sheetOps.getSheetIdByName({id:sheetRange.id, sheetName})
      findSheet.isValid.should.be.true
      noteOptions.sheetId = findSheet.sheetId
      const result = await sheetOps.addNoteToCell({id:sheetRange.id, noteOptions})
      result.statusText.should.equal('OK')
    })
  })
})
