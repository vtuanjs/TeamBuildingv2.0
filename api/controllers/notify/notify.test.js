'use strict'
const expect = require('chai').expect
const request = require('supertest')
const app = require('../../../app')

let signedInUser = ''

describe('PREPARE TESTING NOTIFY', () => {
    it('Ok, login user account', done => {
        request(app).post(`/auth/login`).send({
            email: 'ngocancsdl@gmail.com',
            password: '12345678d'
        }).then(res => {
            const body = res.body
            expect(res.statusCode).to.equals(200)
            expect(body).to.contain.property('user')
            expect(body.user).to.contain.property('tokenKey')
            signedInUser = body.user
            done()
        }).catch((error) => done(error))
    })
})

describe('GET /notify', () => {
    it('Ok, get notify', done => {
        request(app).get(`/notify`).set({
            'x-access-token': signedInUser.tokenKey
        }).then(res => {
            const body = res.body
            expect(res.statusCode).to.equals(200)
            expect(body).to.contain.property('notifies')
            done()
        }).catch((error) => done(error))
    })
})