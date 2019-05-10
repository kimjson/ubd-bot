const dotenv = require('dotenv');

const result = dotenv.config({ path: `./.env.${process.env.NODE_ENV}` });

if (result.error) throw result.error;

module.exports = process.env;