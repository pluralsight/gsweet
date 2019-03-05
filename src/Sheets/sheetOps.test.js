/** @module ./sheetOps.test*/
const chai = require("chai");
chai.should();
const ss = require("./sheetService");
const sheetOps = require("./sheetOps");
const logger = require("../utils/logger");

/**
 * Fake the `get` and `update` methods that the sheetService provides in the way
 * that the Google API expects them. Namely `spreadsheets.values.get` and 
 * `spreadsheets.values.update`
 */
const fakeSheetService = {
  spreadsheets: {
    values: {

      get: async ({spreadsheetId: ssID, range}) => ({
        data: {
          id: ssID,
          range,
          values: [["course-1"], ["course-2"]],
        },
      }),

      update: async ({spreadsheetId, range, valueInputOption, resource}) => ({
        data: {
          updatedCells: [].concat(...resource.values).length, // flatten and get length of array
          updatedRange: range,
          valueInputOption,
          resource,
          spreadsheetId,
        },
      }),
    },
  },
};


before(() => {
  logger.level = "info";
  const fakeService = ss.init(fakeSheetService);
  sheetOps.init(fakeService); // will set the sheet service inside sheetOps
});

after(() => {logger.level = "debug";});


describe("sheetOps module", () => {
  const sheetRange = {
    id: "testFakeId",
    range: "TabName!A1",
    value: "$1,234",
    data: [["r1c1Info", "r1c2Info"], ["r2C1Info"]],
  };
  describe("setSheetCell() should ", () => {
    it("invoke fakeSheetService.values.update() with the passed parameters and create resource property", async () => {
      const result = await sheetOps.setSheetCell(sheetRange);
      result.data.updatedCells.should.equal(1);
      result.data.updatedRange.should.equal(sheetRange.range);
      result.data.valueInputOption.should.equal("USER_ENTERED");
      result.data.resource.values[0][0].should.equal(sheetRange.value);
      result.data.spreadsheetId.length.should.equal(sheetRange.id.length);
    });
  });
  describe("setRangeData() should", () => {
    it("invoke fakeSheetService...update() on a range of values", async () => {
      // ES6 spread operator can flatten 2D array into 1D array
      const flatten = [].concat(...sheetRange.data);
      const result = await sheetOps.setRangeData(sheetRange);
      result.data.updatedCells.should.equal(flatten.length); // long way of writing 3
      result.data.updatedRange.should.equal(sheetRange.range);
      result.data.resource.values[0][0].should.equal(sheetRange.data[0][0]);
    });
  });

  describe("geSheetValues() should  ", () => {
    it("invoke fakeSheetService.spreadsheets.values.get() and return 2D array of values", async () => {

    });
  });
});