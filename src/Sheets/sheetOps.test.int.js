/**
 * @module Sheet/sheetOps Integration Tests
 * @author Tod Gentille <tod-gentille@pluralsight.com>
 */
const chai = require('chai')
const should = chai.should()
const Gsweet = require('../main')
// const ss = require('./sheetService')
// const sheetOps = require('./sheetOps')
const logger = require('../utils/logger')
// require('env-create').load({path: '/Users/tod-gentille/dev/node/ENV_VARS/gsweet.env.json'})
const testData = require('../test-data/integration.json')
const testSheet = testData.sheet

const gsweet = new Gsweet('/Users/tod-gentille/dev/node/ENV_VARS/gsweet.env.json')
const {sheetOps} = gsweet

before(() => {logger.level = 'info'})
after(() => {logger.level = 'debug'})

/** @see sheetOps module */
describe('INTEGRATION TESTS sheetOps module', function () {
  this.timeout(10000)
  // const sheetService = ss.init()
  // sheetOps.init(sheetService)

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
      sheetRange.data = [['Row1Col1Test', 'Row1Col2Test'], ['Row2Col1Test', 'Row2Col2Test']]
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
    const setTestData = async (data) => {
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
})