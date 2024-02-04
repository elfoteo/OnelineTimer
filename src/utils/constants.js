// constants.js
const SECRET_KEY = 'abcd1234';
const path = require('path');
const dataFilePath = path.join(__dirname, '../data.json');

module.exports = { SECRET_KEY, dataFilePath };