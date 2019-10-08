'use strict'
const User = require('../api/controllers/user/user.model')
const Project = require('../api/controllers/project/project.model')
const Job = require('../api/controllers/job/job.model')
const Notify = require('../api/controllers/notify/notify.model')

const database = require('../database')

before(done => {
    database.connect().then(() => {
        if (process.env.NODE_ENV === 'dbtest'){
            Promise.all([
                User.remove(),
                Project.remove(),
                Job.remove(),
                Notify.remove(),
            ])
        }
        done()
    }).catch((error) => done(error));
})