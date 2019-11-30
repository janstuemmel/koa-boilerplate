const Sequelize = require('sequelize')
const bcrypt = require('bcrypt')
const db = require('../db')

const User = db.define('user', {
  email: {
    type: Sequelize.STRING,
    unique: true,
    validate: { isEmail: true },
    allowNull: false
  },
  password: { type: Sequelize.STRING, allowNull: false }
}, {
  defaultScope: { attributes: { exclude: [ 'password' ] } }
})

module.exports = User

// hash password before User creation
User.beforeCreate(async user => user.password = await bcrypt.hash(user.password, 5))

// method to verify password
User.prototype.verifyPassword = async function(password) {
  return await bcrypt.compare(password, this.password)
}