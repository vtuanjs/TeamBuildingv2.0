'use strict'
const expect = require('chai').expect
const request = require('supertest')
const app = require('../../../app')

describe('POST /auth/logout', () => {
    it('Ok, logout user', done => {
        request(app).post(`/auth/logout`).then( res => {
            expect(res.statusCode).to.equals(200)
            done()
        }).catch((error) => done(error))
    })
})