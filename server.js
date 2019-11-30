const app = require('./src')
const db = require('./src/db')

const { User } = require('./src/model')

const exampleData = require('./test/exampleData')

app.listen(1337)

// setup db with test data
; (async function () {

  await db.sync({ force: true })
  await asyncForEach(exampleData.users, async data => await User.create(data))

})()

// helper
async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}