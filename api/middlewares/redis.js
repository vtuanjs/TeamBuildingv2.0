const Redis = require('ioredis')
const REDIS_PORT = process.env.REDIS_PORT || 6379
module.exports = new Redis(REDIS_PORT)