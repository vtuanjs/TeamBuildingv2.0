'use strict'
const User = require('../api/controllers/user/user.model')
const Project = require('../api/controllers/project/project.model')
const Job = require('../api/controllers/job/job.model')
const Notify = require('../api/controllers/notify/notify.model')
const Comment = require('../api/controllers/comment/comment.model')
const Team = require('../api/controllers/team/team.model')

const database = require('../database')
const redis = require('../api/middlewares/redis')

before(done => {
    console.log('Loading test...')
    database.connect().then(() => {
        if (process.env.NODE_ENV === 'dbtest'){
            Promise.all([
                User.remove(),
                Project.remove(),
                Job.remove(),
                Notify.remove(),
                Comment.remove(),
                Team.remove(),
            ])
        }
        done()
    }).catch((error) => done(error));
})

after(() => {
    redis.flushdb()
    console.log('Test completed')
})

require('../api/controllers/user/user.test')
require('../api/controllers/project/project.test')
require('../api/controllers/job/job.test')
require('../api/controllers/notify/notify.test')
require('../api/controllers/comment/comment.test')
require('../api/controllers/team/team.test')