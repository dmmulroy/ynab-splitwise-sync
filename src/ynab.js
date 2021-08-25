const ynab = require('ynab');

const client = new ynab.API(process.env.YNAB_API_TOKEN);

module.exports = client;
