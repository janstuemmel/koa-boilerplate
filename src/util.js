const jwt = require('jsonwebtoken')

const { secret } = require('./config')

module.exports.sign = id => jwt.sign({ id }, secret)

module.exports.verify = async token => await jwt.verify(token, secret)
