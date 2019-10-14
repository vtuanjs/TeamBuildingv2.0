'use strict'
const expect = require('chai').expect
const request = require('supertest')
const app = require('../../../app')
const redis = require('../../middlewares/redis')

let owner
let projectId = ''
let member
let listJobs = '' // Use to update, delete this company with Id
let userIds // Array user will add to job
let userId

describe('PREPARE TESTING JOB', () => {
    it('Ok, login user account', done => {
        request(app).post(`/auth/login`).send({
            email: 'kien.nguyen@amavi.asia',
            password: '12345678c'
        }).then(res => {
            const body = res.body
            expect(res.statusCode).to.equals(200)
            expect(body).to.contain.property('user')
            expect(body.user).to.contain.property('tokenKey')
            owner = body.user
            done()
        }).catch((error) => done(error))
    })
    it('OK, get project Id', done => {
        redis.get('listProjects').then(data => {
            projectId = JSON.parse(data)[0]._id
            done()
        }).catch(error => done(error))
    })
})

describe('POST /job?projectId=', () => {
    it('OK, create Job 1', done => {
        request(app).post(`/job?projectId=${projectId}`).set({
            'x-access-token': owner.tokenKey
        }).send({
            title: 'Job 1',
            description: 'Job 1 Description',
            isAllowMemberAddMember: 0
        }).then(res => {
            const body = res.body
            expect(res.statusCode).to.equals(200)
            expect(body).to.contain.property('job')
            expect(body.job.title).to.equals('Job 1')
            expect(body.job.description).to.equals('Job 1 Description')
            done()
        }).catch((error) => done(error))
    })
    it('OK, create Job 2', done => {
        request(app).post(`/job?projectId=${projectId}`).set({
            'x-access-token': owner.tokenKey
        }).send({
            title: 'Job 2',
            description: 'Job 2 Description'
        }).then(res => {
            const body = res.body
            expect(res.statusCode).to.equals(200)
            expect(body).to.contain.property('job')
            expect(body.job.title).to.equals('Job 2')
            expect(body.job.description).to.equals('Job 2 Description')
            done()
        }).catch((error) => done(error))
    })
    it('OK, create Job 3', done => {
        request(app).post(`/job?projectId=${projectId}`).set({
            'x-access-token': owner.tokenKey
        }).send({
            title: 'Job 3',
            description: 'Job 3 Description'
        }).then(res => {
            const body = res.body
            expect(res.statusCode).to.equals(200)
            expect(body).to.contain.property('job')
            expect(body.job.title).to.equals('Job 3')
            expect(body.job.description).to.equals('Job 3 Description')
            done()
        }).catch((error) => done(error))
    })
    it('OK, create Job 4', done => {
        request(app).post(`/job?projectId=${projectId}`).set({
            'x-access-token': owner.tokenKey
        }).send({
            title: 'Job 4',
            description: 'Job 4 Description'
        }).then(res => {
            const body = res.body
            expect(res.statusCode).to.equals(200)
            expect(body).to.contain.property('job')
            expect(body.job.title).to.equals('Job 4')
            expect(body.job.description).to.equals('Job 4 Description')
            done()
        }).catch((error) => done(error))
    })
    it('OK, create Job 5', done => {
        request(app).post(`/job?projectId=${projectId}`).set({
            'x-access-token': owner.tokenKey
        }).send({
            title: 'Job 5',
            description: 'Job 5 Description'
        }).then(res => {
            const body = res.body
            expect(res.statusCode).to.equals(200)
            expect(body).to.contain.property('job')
            expect(body.job.title).to.equals('Job 5')
            expect(body.job.description).to.equals('Job 5 Description')
            done()
        }).catch((error) => done(error))
    })
    it('FAIL, missing title', done => {
        request(app).post(`/job?projectId=${projectId}`).set({
            'x-access-token': owner.tokenKey
        }).send({
            description: 'Job FAIL Description'
        }).then(res => {
            expect(res.statusCode).to.equals(400)
            done()
        }).catch((error) => done(error))
    })
})

describe('GET /job', () => {
    it('OK, Query list of jobs', done => {
        request(app).get(`/job?projectId=${projectId}`).set({
            'x-access-token': owner.tokenKey
        }).then(res => {
            const body = res.body
            expect(res.statusCode).to.equals(200)
            expect(body).to.contain.property('jobs')
            expect(body.jobs.length).to.equals(5)
            listJobs = body.jobs
            // Save to redis store to re-use
            redis.setex('listJobs', 3600, JSON.stringify(listJobs))
            done()
        }).catch((error) => done(error))
    })
})

describe('GET /job/:jobId', () => {
    it('OK, Get detail job', done => {
        request(app).get(`/job/${listJobs[0]._id}`).set({
            'x-access-token': owner.tokenKey
        }).then(res => {
            const body = res.body
            expect(res.statusCode).to.equals(200)
            expect(body).to.contain.property('job')
            done()
        }).catch((error) => done(error))
    })
})

describe('POST /job?jobId=', () => {
    it('OK, create sub job 1', done => {
        request(app).post(`/job/sub-job?jobId=${listJobs[0]._id}`).set({
            'x-access-token': owner.tokenKey
        }).send({
            title: 'Sub Job 1',
            description: 'Sub Job 1 Description'
        }).then(res => {
            const body = res.body
            expect(res.statusCode).to.equals(200)
            expect(body).to.contain.property('job')
            expect(body.job.title).to.equals('Sub Job 1')
            expect(body.job.description).to.equals('Sub Job 1 Description')
            done()
        }).catch((error) => done(error))
    })
    it('OK, create sub job 2', done => {
        request(app).post(`/job/sub-job?jobId=${listJobs[0]._id}`).set({
            'x-access-token': owner.tokenKey
        }).send({
            title: 'Sub Job 2',
            description: 'Sub Job 2 Description'
        }).then(res => {
            const body = res.body
            expect(res.statusCode).to.equals(200)
            expect(body).to.contain.property('job')
            expect(body.job.title).to.equals('Sub Job 2')
            expect(body.job.description).to.equals('Sub Job 2 Description')
            done()
        }).catch((error) => done(error))
    })
    it('OK, create sub job 3', done => {
        request(app).post(`/job/sub-job?jobId=${listJobs[0]._id}`).set({
            'x-access-token': owner.tokenKey
        }).send({
            title: 'Sub Job 3',
            description: 'Sub Job 3 Description'
        }).then(res => {
            const body = res.body
            expect(res.statusCode).to.equals(200)
            expect(body).to.contain.property('job')
            expect(body.job.title).to.equals('Sub Job 3')
            expect(body.job.description).to.equals('Sub Job 3 Description')
            done()
        }).catch((error) => done(error))
    })
    it('OK, create sub job 4', done => {
        request(app).post(`/job/sub-job?jobId=${listJobs[0]._id}`).set({
            'x-access-token': owner.tokenKey
        }).send({
            title: 'Sub Job 4',
            description: 'Sub Job 4 Description'
        }).then(res => {
            const body = res.body
            expect(res.statusCode).to.equals(200)
            expect(body).to.contain.property('job')
            expect(body.job.title).to.equals('Sub Job 4')
            expect(body.job.description).to.equals('Sub Job 4 Description')
            done()
        }).catch((error) => done(error))
    })
})

describe('POST /job/:jobId/delete', () => {
    it('OK, send to trash job', done => {
        request(app).post(`/job/${listJobs[0]._id}/delete`).set({
            'x-access-token': owner.tokenKey
        }).then(res => {
            const body = res.body
            expect(res.statusCode).to.equals(200)
            expect(body).to.contain.property('job')
            expect(body.job.isDeleted).to.equals(1)
            done()
        }).catch((error) => done(error))
    })
})


describe('POST /job/:jobId/restore', () => {
    it('OK, restore job', done => {
        request(app).post(`/job/${listJobs[0]._id}/restore`).set({
            'x-access-token': owner.tokenKey
        }).then(res => {
            const body = res.body
            expect(res.statusCode).to.equals(200)
            expect(body).to.contain.property('job')
            expect(body.job.isDeleted).to.equals(0)
            done()
        }).catch((error) => done(error))
    })
})

describe('POST /job/:jobId/completed', () => {
    it('OK, completed job', done => {
        request(app).post(`/job/${listJobs[0]._id}/completed`).set({
            'x-access-token': owner.tokenKey
        }).then(res => {
            const body = res.body
            expect(res.statusCode).to.equals(200)
            expect(body).to.contain.property('job')
            expect(body.job.isCompleted).to.equals(1)
            done()
        }).catch((error) => done(error))
    })
})

describe('POST /job/:jobId/undoCompleted', () => {
    it('OK, undo completed job', done => {
        request(app).post(`/job/${listJobs[0]._id}/undoCompleted`).set({
            'x-access-token': owner.tokenKey
        }).then(res => {
            const body = res.body
            expect(res.statusCode).to.equals(200)
            expect(body).to.contain.property('job')
            expect(body.job.isCompleted).to.equals(0)
            done()
        }).catch((error) => done(error))
    })
})

describe('DELETE /job/:jobId', () => {
    it('OK, delete immediately job', done => {
        request(app).delete(`/job/${listJobs[4]._id}/`).set({
            'x-access-token': owner.tokenKey
        }).then(res => {
            const body = res.body
            expect(res.statusCode).to.equals(200)
            expect(body).to.contain.property('raw')
            expect(body.raw.ok).to.equals(1)
            done()
        }).catch((error) => done(error))
    })
    it('OK, check job already deleted ?', done => {
        request(app).get(`/job/${listJobs[4]._id}`).set({
            'x-access-token': owner.tokenKey
        }).then(res => {
            const body = res.body
            expect(res.statusCode).to.equals(403)
            expect(body).to.not.contain.property('job')
            done()
        }).catch((error) => done(error))
    })
})

describe('PUT /job/:jobId/', () => {
    it('OK, edit job', done => {
        request(app).put(`/job/${listJobs[0]._id}/`).set({
            'x-access-token': owner.tokenKey
        }).send({
            title: 'Job Edit',
            description: 'Description Edit',
            isAllowMemberAddMember: 0
        }).then(res => {
            const body = res.body
            expect(res.statusCode).to.equals(200)
            expect(body).to.contain.property('job')
            expect(body.job.title).to.equals('Job Edit')
            expect(body.job.description).to.equals('Description Edit')
            expect(body.job.allowed.isAllowMemberAddMember).to.equals(0)
            done()
        }).catch((error) => done(error))
    })
})

describe('PREPARE ADD MEMBER TO JOB', () => {
    it('Get userIds will add to project', done => {
        // userIds cache from project
        redis.get('userIds').then(data => {
            userIds = JSON.parse(data)
            done()
        }).catch(error => done(error))
    })
    it('Get userId will add to project', done => {
        request(app).get('/user/get-by-email/' + "ngocancsdl@gmail.com").then(res => {
            const body = res.body
            expect(res.statusCode).to.equals(200)
            expect(body).to.contain.property('user')
            userId = body.user._id
            done()
        }).catch(error => done(error))
    })
})

describe('POST /job/:jobId/add-members', () => {
    it('OK, add list members to job', done => {
        request(app).post(`/job/${listJobs[2]._id}/add-members`).set({
            'x-access-token': owner.tokenKey
        }).send({
            userIds
        }).then(res => {
            expect(res.statusCode).to.equals(200)
            done()
        }).catch((error) => done(error))
    })
    it('OK, add single member to job', done => {
        request(app).post(`/job/${listJobs[0]._id}/add-members`).set({
            'x-access-token': owner.tokenKey
        }).send({
            userIds: userId
        }).then(res => {
            const body = res.body
            expect(res.statusCode).to.equals(200)
            done()
        }).catch((error) => done(error))
    })
    it('OK, add single member to job', done => {
        request(app).post(`/job/${listJobs[1]._id}/add-members`).set({
            'x-access-token': owner.tokenKey
        }).send({
            userIds: userId
        }).then(res => {
            const body = res.body
            expect(res.statusCode).to.equals(200)
            done()
        }).catch((error) => done(error))
    })
})

describe('POST /job/:jobId/agree-join-job', () => {
    before(done => {
        request(app).post(`/auth/login`).send({
            email: 'ngocancsdl@gmail.com',
            password: '12345678d'
        }).then(res => {
            const body = res.body
            expect(res.statusCode).to.equals(200)
            member = body.user
            done()
        }).catch(error => done(error))
    })
    it('OK, agree join job', done => {
        request(app).post(`/job/${listJobs[0]._id}/agree-join-job`).set({
            'x-access-token': member.tokenKey
        }).then(res => {
            expect(res.statusCode).to.equals(200)
            done()
        }).catch(error => done(error))
    })
    it('OK, disagree join job', done => {
        request(app).post(`/job/${listJobs[1]._id}/disagree-join-job`).set({
            'x-access-token': member.tokenKey
        }).then(res => {
            expect(res.statusCode).to.equals(200)
            done()
        }).catch(error => done(error))
    })
})

describe('POST /job/:jobId/remove-members', () => {
    it('OK, remove members in job', done => {
        request(app).post(`/job/${listJobs[0]._id}/remove-members`).set({
            'x-access-token': owner.tokenKey
        }).send({
            userIds: userIds[1]
        }).then(res => {
            expect(res.statusCode).to.equals(200)
            done()
        }).catch((error) => done(error))
    })
})

describe('POST /job/:jobId/change-user-role', () => {
    it('OK, change user role', done => {
        request(app).post(`/job/${listJobs[0]._id}/change-user-role`).set({
            'x-access-token': owner.tokenKey
        }).send({
            userId: userId,
            role: 'admin'
        }).then(res => {
            const body = res.body
            expect(res.statusCode).to.equals(200)
            done()
        }).catch((error) => done(error))
    })
})

describe('POST /job/:jobId/leave-job', () => {
    before(done => {
        request(app).post(`/auth/login`).send({
            email: 'ngocancsdl@gmail.com',
            password: '12345678d'
        }).then(res => {
            const body = res.body
            expect(res.statusCode).to.equals(200)
            member = body.user
            done()
        }).catch(error => done(error))
    })
    it('OK, leave job', done => {
        request(app).post(`/job/${listJobs[0]._id}/leave-job`).set({
            'x-access-token': member.tokenKey
        }).then(res => {
            expect(res.statusCode).to.equals(200)
            done()
        }).catch(error => done(error))
    })
})