const parseQuery = require ('./queryParser');
const readCSV = require ('./csvReader');

async function executeSELECTQuery (query) {
  let missingFields = [];

  try {
    const {fields, table, whereClause} = parseQuery (query);
    const data = await readCSV (`${table}.csv`);

    // Check if the requested fields exist in the data
    const headers = Object.keys (data[0] || {}).map (header =>
      header.toLowerCase ()
    );
    missingFields = fields.filter (
      field => !headers.includes (field.toLowerCase ())
    );
    if (missingFields.length > 0) {
      throw new Error (
        `The following fields do not exist in the data: ${missingFields.join (', ')}`
      );
    }

    const filteredData = whereClause
      ? data.filter (row => {
          const [field, value] = whereClause.split ('=').map (s => s.trim ());
          return row[field] === value;
        })
      : data;

    return filteredData.map (row =>
      fields.reduce ((obj, field) => {
        obj[field] = row[field];
        return obj;
      }, {})
    );
  } catch (error) {
    // error handling
    if (error.code === 'ENOENT') {
      throw new Error (`File not found (${table}.csv)`);
    } else if (missingFields.length > 0) {
      throw new Error (
        `The following fields do not exist in the data: ${missingFields.join (', ')}`
      );
    } else if (error.message.includes ('Invalid query')) {
      console.error (`Error: Invalid query syntax (${query})`);
    } else {
      console.error (`Error: ${error.message}`);
    }
    return [];
  }
}

module.exports = executeSELECTQuery;
