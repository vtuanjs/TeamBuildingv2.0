'use strict'
const expect = require('chai').expect
const request = require('supertest')
const app = require('../../../app')

let ownerCommentTokenKey = ''
let projectId = ''
let jobId = ''
let listComments

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
            ownerCommentTokenKey = body.user.tokenKey
            done()
        }).catch((error) => done(error))
    })
    it('OK, get project id', done => {
        request(app).get('/project').set({
            'x-access-token': ownerCommentTokenKey
        }).then(res => {
            const body = res.body
            expect(res.statusCode).to.equals(200)
            expect(body).to.contain.property('projects')
            projectId = body.projects[0]._id
            done()
        }).catch((error) => done(error))
    })
    it('OK, get job Id', done => {
        request(app).get(`/job?projectId=${projectId}`).set({
            'x-access-token': ownerCommentTokenKey
        }).then(res => {
            const body = res.body
            expect(res.statusCode).to.equals(200)
            expect(body).to.contain.property('jobs')
            const listJobs = body.jobs
            jobId = listJobs[0]._id
            done()
        }).catch((error) => done(error))
    })
})

describe('POST /comment', () => {
    it('OK, create comment 1', done => {
        request(app).post(`/comment?jobId=${jobId}`)
            .set({ 'x-access-token': ownerCommentTokenKey })
            .send({ body: 'Comment 1' })
            .then(res => {
                const body = res.body
                expect(res.statusCode).to.equals(200)
                expect(body).to.contain.property('comment')
                done()
            })
            .catch((error) => done(error))
    })
    it('OK, create comment 2', done => {
        request(app).post(`/comment?jobId=${jobId}`)
            .set({ 'x-access-token': ownerCommentTokenKey })
            .send({ body: 'Comment 2' })
            .then(res => {
                const body = res.body
                expect(res.statusCode).to.equals(200)
                expect(body).to.contain.property('comment')
                done()
            })
            .catch((error) => done(error))
    })
    it('OK, create comment 3', done => {
        request(app).post(`/comment?jobId=${jobId}`)
            .set({ 'x-access-token': ownerCommentTokenKey })
            .send({ body: 'Comment 3' })
            .then(res => {
                const body = res.body
                expect(res.statusCode).to.equals(200)
                expect(body).to.contain.property('comment')
                done()
            })
            .catch((error) => done(error))
    })
    it('OK, create comment 4', done => {
        request(app).post(`/comment?jobId=${jobId}`)
            .set({ 'x-access-token': ownerCommentTokenKey })
            .send({ body: 'Comment 4' })
            .then(res => {
                const body = res.body
                expect(res.statusCode).to.equals(200)
                expect(body).to.contain.property('comment')
                done()
            })
            .catch((error) => done(error))
    })
})

describe('GET /comment?jobId=', () => {
    it('OK, get all comment in job', done => {
        request(app).get(`/comment?jobId=${jobId}`)
            .set({ 'x-access-token': ownerCommentTokenKey })
            .then(res => {
                const body = res.body
                expect(res.statusCode).to.equals(200)
                expect(body).to.contain.property('comments')
                listComments = body.comments
                done()
            })
            .catch((error) => done(error))
    })
})

describe('GET /comment/:commentId', () => {
    it('OK, get detail comment', done => {
        request(app).get(`/comment/${listComments[0]._id}`)
            .set({ 'x-access-token': ownerCommentTokenKey })
            .then(res => {
                const body = res.body
                expect(res.statusCode).to.equals(200)
                expect(body).to.contain.property('comment')
                done()
            })
            .catch((error) => done(error))
    })
})

describe('PUT /comment/:commentId', () => {
    it('OK, edit comment comment', done => {
        request(app).put(`/comment/${listComments[0]._id}`)
            .set({ 'x-access-token': ownerCommentTokenKey })
            .send({body: 'Comment Edited'})
            .then(res => {
                const body = res.body
                expect(res.statusCode).to.equals(200)
                expect(body).to.contain.property('comment')
                done()
            })
            .catch((error) => done(error))
    })
})

describe('DELETE /comment/:commentId', () => {
    it('OK, delete comment comment', done => {
        request(app).delete(`/comment/${listComments[0]._id}`)
            .set({ 'x-access-token': ownerCommentTokenKey })
            .then(res => {
                const body = res.body
                expect(res.statusCode).to.equals(200)
                done()
            })
            .catch((error) => done(error))
    })
})

