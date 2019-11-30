const faker = require('faker');

const user = { id: 1, email: 'foo@example.com', password: 'foo' }

let users = [2,3,4,5].map(id => ({
  id,
  email: faker.internet.exampleEmail(),
  password: 'foo'  
}))

module.exports.users = [ ...users, user ]

module.exports.TEST_USER = user
