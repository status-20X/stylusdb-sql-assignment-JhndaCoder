const parseQuery = require ('./queryParser');
const readCSV = require ('./csvReader');

async function executeSELECTQuery (query) {
  try {
    const {fields, table} = parseQuery (query);
    const data = await readCSV (`${table}.csv`);

    // Check if the requested fields exist in the data
    const headers = Object.keys (data[0] || {});
    const missingFields = fields.filter (field => !headers.includes (field));
    if (missingFields.length > 0) {
      throw new Error (
        `The following fields do not exist in the data: ${missingFields.join (', ')}`
      );
    }

    return data.map (row => {
      const filteredRow = {};
      fields.forEach (field => {
        filteredRow[field] = row[field];
      });
      return filteredRow;
    });
  } catch (error) {
    // error handling
    if (err.code === 'ENOENT') {
      console.error (`Error: File not found (${table}.csv)`);
    } else if (err.message.includes ('Invalid query')) {
      console.error (`Error: Invalid query syntax (${query})`);
    } else {
      console.error (`Error: ${err.message}`);
    }
    return [];
  }
}

module.exports = executeSELECTQuery;
