const { User } = require('../../../src/model')
const { prepareDb } = require('../../util')

describe('user model test', () => {

  beforeEach(async () => await prepareDb())


  it('should create a user', async () => {

    // given
    await User.create({ email: 'foo@example.com', password: 'foobarbaz' })

    // when
    const user = await User.findOne({ attributes: { include: 'password' } })

    // then
    expect(user.dataValues).toEqual({
      id: 1,
      email: 'foo@example.com',
      password: expect.any(String),
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    })
  })


  it('should not expose password field', async () => {

    // given
    await User.create({ email: 'foo@example.com', password: 'foobarbaz' })

    // when
    const user = await User.findOne()

    // then
    expect(user.dataValues.password).toBeUndefined()
  })


  it('should verify password', async () => {

    // given
    const user = await User.create({ email: 'foo@example.com', password: 'foobarbaz' })

    // when
    const isMatch = await user.verifyPassword('foobarbaz')

    // then
    expect(isMatch).toBe(true)
  })


  it('should not verify password', async () => {

    // given
    const user = await User.create({ email: 'foo@example.com', password: 'foobarbaz' })

    // when
    const isMatch = await user.verifyPassword('wrong_pw')

    // then
    expect(isMatch).toBe(false)
  })
  
})

