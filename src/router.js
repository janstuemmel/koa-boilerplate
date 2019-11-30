const Router = require('koa-router')
const bodyParser = require('koa-bodyparser')

const authController = require('./controller/auth')

const auth = new Router
auth.post('/login', authController.basic, authController.login)
auth.get('/authenticated', authController.jwt, authController.authenticated)

const api = new Router
api.use(bodyParser())
api.use('/auth', auth.routes())

const router = new Router
router.use(api.routes())

module.exports = router