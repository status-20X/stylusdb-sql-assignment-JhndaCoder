const readCSV = require ('../../src/csvReader');
const parseQuery = require ('../../src/queryParser');
const executeSELECTQuery = require ('../../src/index');

test ('Read CSV File', async () => {
  const data = await readCSV ('./sample.csv');
  expect (data.length).toBeGreaterThan (0);
  expect (data.length).toBe (3);
  expect (data[0].name).toBe ('John');
  expect (data[0].age).toBe ('30'); //ignore the string type here, we will fix this later
});

test ('Parse SQL Query', () => {
  const query = 'SELECT id, name FROM sample';
  const parsed = parseQuery (query);
  expect (parsed).toEqual ({
    fields: ['id', 'name'],
    table: 'sample',
    whereClause: null,
  });
});

test ('Execute SQL Query', async () => {
  const query = 'SELECT id, name FROM sample';
  const result = await executeSELECTQuery (query);
  expect (result.length).toBeGreaterThan (0);
  expect (result[0]).toHaveProperty ('id');
  expect (result[0]).toHaveProperty ('name');
  expect (result[0]).not.toHaveProperty ('age');
  expect (result[0]).toEqual ({id: '1', name: 'John'});
});

test ('Parse SQL Query with WHERE Clause', () => {
  const query = 'SELECT id, name FROM sample WHERE age = 25';
  const parsed = parseQuery (query);
  expect (parsed).toEqual ({
    fields: ['id', 'name'],
    table: 'sample',
    whereClause: 'age = 25',
  });
});

test ('Execute SQL Query with WHERE Clause', async () => {
  const query = 'SELECT id, name FROM sample WHERE age = 25';
  const result = await executeSELECTQuery (query);
  expect (result.length).toBe (1);
  expect (result[0]).toHaveProperty ('id');
  expect (result[0]).toHaveProperty ('name');
  expect (result[0].id).toBe ('2');
});
test ('Parse SQL Query with Invalid Field Name', () => {
  const query = 'SELECT invalid, name FROM sample';
  const parsed = parseQuery (query);
  expect (parsed).toEqual ({
    fields: ['invalid', 'name'],
    table: 'sample',
    whereClause: null,
  });
});

test ('Execute SQL Query with Invalid Field Name', async () => {
  const query = 'SELECT invalid, name FROM sample';
  await expect (executeSELECTQuery (query)).rejects.toThrow ();
});

test ('Parse SQL Query with Invalid Table Name', () => {
  const query = 'SELECT id, name FROM invalidTable';
  const parsed = parseQuery (query);
  expect (parsed).toEqual ({
    fields: ['id', 'name'],
    table: 'invalidTable',
    whereClause: null,
  });
});

test ('Execute SQL Query with Invalid Field Name', async () => {
  const query = 'SELECT invalid, name FROM sample';
  await expect (executeSELECTQuery (query)).rejects.toThrowError (
    'The following fields do not exist in the data: invalid'
  );
});
test ('Parse SQL Query with Mixed Case', () => {
  const query = 'SELECT Id, NAME FROM sample';
  const parsed = parseQuery (query);
  expect (parsed).toEqual ({
    fields: ['Id', 'NAME'],
    table: 'sample',
    whereClause: null,
  });
});
