const basicAuth = require('basic-auth')
const { User } = require('../model')
const { verify, sign } = require('../util')

module.exports.login = ctx => ctx.body = { token: sign(ctx.user.id) }

module.exports.authenticated = ctx => ctx.body = ctx.user

module.exports.basic = async (ctx, next) => {

  const cred = basicAuth(ctx.request)

  if (!cred) return ctx.throw(400)

  const { name: email, pass } = cred

  const user = await User.findOne({
    where: { email },
    attributes: { include: 'password' }
  })

  if (!user) return ctx.throw(401)

  const isMatch = await user.verifyPassword(pass)
  
  if (!isMatch) return ctx.throw(401)

  ctx.user = user

  await next()
}

module.exports.jwt = async (ctx, next) => {

  const auth = ctx.request.headers.authorization

  if (!auth) return ctx.throw(400, 'Authorization header missing')

  const match = auth.match(/^Bearer ([\w.-]+)$/)

  if (!match || match.length < 2) return ctx.throw(400)
  
  const token = match[1]
  
  let id;

  try {

    let { id: tokenId } = await verify(token)
    
    id = tokenId

  } catch(err) {

    return ctx.throw(400, 'Token verify failed')
  }

  if (!id) return ctx.throw(401)

  const user = await User.findByPk(id)

  if (!user) return ctx.throw(401)

  ctx.user = user

  await next()
}
