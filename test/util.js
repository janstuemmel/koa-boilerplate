const db = require('../src/db')

module.exports.prepareDb = async () => {
  await db.sync({ force: true })
} 