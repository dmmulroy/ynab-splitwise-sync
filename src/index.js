require('dotenv').config();

const sync = require('./sync');

(async () => {
  await sync();
  process.exit();
})();
