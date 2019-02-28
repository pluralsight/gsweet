
let _sheetAccess;

const init = (sheetAccess) => {
  _sheetAccess = sheetAccess;
};

const setColumnData = async (sheetId, range, data) => {
  const resource = {
    values: data,
  };
  try {
    const result = await _sheetAccess.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range,
      valueInputOption: "USER_ENTERED",
      resource,
    });
    console.log(`${result.data.updatedCells} cells updated at range: ${result.data.updatedRange}`);
    return result; // only needed for testing
  } catch (err) {
    console.log(err);
  }
};


const getSheetValues = async (spreadsheetId, range) => {
  try {
    const result = await _sheetAccess.spreadsheets.values.get(
      {
        spreadsheetId,
        range,
      }
    );
    return result.data.values;
  } catch (err) {
    console.log("Error trying to get range values\n", err);
  }
};

const setSheetCell = async (spreadsheetId, cell, newValue) => {
  const resource = {
    values: [[newValue]],
  };
  try {
    const result = await _sheetAccess.spreadsheets.values.update({
      spreadsheetId,
      range: cell,
      valueInputOption: "USER_ENTERED",
      resource,
    });
    console.log(`${result.data.updatedCells} cells updated at range: ${result.data.updatedRange} updated with ${newValue}`);
    return result; // only needed for testing
  } catch (err) {
    console.log(err);
  }
};
module.exports = {
  init,
  getSheetValues,
  setColumnData,
  setSheetCell,
};