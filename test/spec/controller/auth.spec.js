const jsonwebtoken = require('jsonwebtoken')

const { prepareDb } = require('../../util')
const { User } = require('../../../src/model')
const { sign } = require('../../../src/util')
const { secret } = require('../../../src/config')

const { basic, login, jwt } = require('../../../src/controller/auth')


describe('auth controller test', () => {

  beforeEach(async () => await prepareDb())

  describe('basic', () => {

    beforeEach(async () => await User.create({ email: 'foo@example.com', password: 'foo' }))
  
  
    it('should authenticate basic', async () => {
  
      // given
      const next = jest.fn()
      const ctx = KoaMockObject(basicAuth('foo@example.com', 'foo'))
  
      // when
      await basic(ctx, next)
  
      // then
      expect(next).toHaveBeenCalled()
      expect(ctx.user).toMatchObject({ email: 'foo@example.com' })
    })
  
  
    it('should throw on bad password', async () => {
  
      // given
      const ctx = KoaMockObject(basicAuth('foo@example.com', 'bad_pw'))

      // when
      await basic(ctx, jest.fn())

      // then
      expect(ctx.throw).toHaveBeenCalledWith(401)
    })
  
  
    it('should throw on user not found', async () => {
  
      // given
      const ctx = KoaMockObject(basicAuth('not_exists@example.com', 'bad_pw'))

      // when
      await basic(ctx, jest.fn())

      // then
      expect(ctx.throw).toHaveBeenCalledWith(401)
    })
  
  
    it('should throw on wrong header', async () => {
  
      // given
      const ctx = KoaMockObject('Basic foo')
  
      // when
      await basic(ctx, jest.fn())

      // then
      expect(ctx.throw).toHaveBeenCalledWith(400)
    })
  
  
    it('should throw on auth header empty', async () => {
  
      // given
      const ctx = KoaMockObject('')
  
      // when
      await basic(ctx, jest.fn())

      // then
      expect(ctx.throw).toHaveBeenCalledWith(400)
    })
  
    it('should throw on auth header missing', async () => {
  
      // given
      const ctx = { request: { headers: [] }, throw: jest.fn() }
  
      // when
      await basic(ctx, jest.fn())

      // then
      expect(ctx.throw).toHaveBeenCalledWith(400)
    })
  })

  describe('login', () => {

    it('should response with token', async () => {

      // given
      const ctx = { user: { id: 1 } }

      // when
      login(ctx)

      // then
      expect(ctx.body.token).toEqual(expect.any(String))
    })

  })

  describe('jsonwebtoken', () => {

    it('should authenticate jwt', async () => {
    
      // given 
      await User.create({ email: 'foo@example.com', password: 'foo' })
      const next = jest.fn()

      const ctx = KoaMockObject('Bearer ' + sign(1))

      // when
      await jwt(ctx, next)

      // then
      expect(next).toHaveBeenCalled()
      expect(ctx.user).toBeInstanceOf(Object)
    })


    it('should throw on verify token error parsing json', async () => {
    
      // given 
      const ctx = KoaMockObject(
        'Bearer ' +
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
          'b4dp4yl0ad.' + // bad payload
          'LbGLaeH8wawNdyQ3G9FZJmitKOoTc3Sm9fZLwPYwn7I'
      )

      // when
      await jwt(ctx)

      // then
      expect(ctx.throw).toHaveBeenCalledWith(400, 'Token verify failed')
    })


    it('should throw on verify token error invalid signatur', async () => {
    
      // given 
      const ctx = KoaMockObject(
        'Bearer ' +
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
          'eyJpZCI6MSwiaWF0IjoxNTE2MjM5MDIyfQ.' + 
          'inv4lid_sign4tur'
      )

      // when
      await jwt(ctx)

      // then
      expect(ctx.throw).toHaveBeenCalledWith(400, 'Token verify failed')
    })


    it('should throw on verify token error parsing json', async () => {
    
      // given 
      const ctx = KoaMockObject('Bearer ' + jsonwebtoken.sign({ foo: 1 }, secret)) 

      // when
      await jwt(ctx)

      // then
      expect(ctx.throw).toHaveBeenCalledWith(401)
    })


    it('should throw on auth header missing', async () => {
  
      // given
      const ctx = { request: { headers: {} }, throw: jest.fn() }
  
      // when
      await jwt(ctx, jest.fn())

      // then
      expect(ctx.throw).toHaveBeenCalledWith(400, 'Authorization header missing')
    })
  })
})

// helper

function KoaMockObject(authorization, object = {}) {
  return Object.assign({}, object, {
    request: { headers: { authorization } },
    throw: jest.fn(),
    assert: jest.fn(),
  })
}

function basicAuth(username, password) {
  return 'Basic ' + Buffer.from(username + ':' + password).toString('base64')
}