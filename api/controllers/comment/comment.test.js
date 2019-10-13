'use strict'
const expect = require('chai').expect
const request = require('supertest')
const app = require('../../../app')
const redis = require('../../middlewares/redis')

let owner
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
            owner = body.user
            done()
        }).catch((error) => done(error))
    })
    it('OK, get job Id', done => {
        redis.get('listJobs').then(data => {
            jobId = JSON.parse(data)[0]._id
            done()
        }).catch(error => done(error))
    })
})

describe('POST /comment', () => {
    it('OK, create comment 1', done => {
        request(app).post(`/comment?jobId=${jobId}`)
            .set({ 'x-access-token': owner.tokenKey })
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
            .set({ 'x-access-token': owner.tokenKey })
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
            .set({ 'x-access-token': owner.tokenKey })
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
            .set({ 'x-access-token': owner.tokenKey })
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
            .set({ 'x-access-token': owner.tokenKey })
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
            .set({ 'x-access-token': owner.tokenKey })
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
    it('OK, edit comment', done => {
        request(app).put(`/comment/${listComments[0]._id}`)
            .set({ 'x-access-token': owner.tokenKey })
            .send({body: 'Comment Edited'})
            .then(res => {
                const body = res.body
                expect(res.statusCode).to.equals(200)
                expect(body).to.contain.property('comment')
                done()
            })
            .catch((error) => done(error))
    })
    it('OK, edit comment again', done => {
        request(app).put(`/comment/${listComments[0]._id}`)
            .set({ 'x-access-token': owner.tokenKey })
            .send({body: 'Comment Edited Again'})
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
        request(app).delete(`/comment/${listComments[1]._id}`)
            .set({ 'x-access-token': owner.tokenKey })
            .then(res => {
                expect(res.statusCode).to.equals(200)
                done()
            })
            .catch((error) => done(error))
    })
})

