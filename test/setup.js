jest.mock('../src/config', () => {
  const config = require.requireActual('../src/config')
  return Object.assign({}, config, {
    secret: 'foo',
    db: { driver: 'sqlite', storage: ':memory:' }
  })
})

require('../src/model')
