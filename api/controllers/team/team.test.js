'use strict'
const expect = require('chai').expect
const request = require('supertest')
const app = require('../../../app')

let ownerTeamTokenKey = '' // Save token key after login
let userTokenKey
let listTeams
let userIds = ''
let userId

describe('PREPARE TESTING TEAM', () => {
    it('Ok, login user account', done => {
        request(app).post(`/auth/login`).send({
            email: 'tuan.nv@amavi.asia',
            password: '12345678c'
        }).then(res => {
            const body = res.body
            expect(res.statusCode).to.equals(200)
            expect(body).to.contain.property('user')
            expect(body.user).to.contain.property('tokenKey')
            ownerTeamTokenKey = body.user.tokenKey
            done()
        }).catch((error) => done(error))
    })
})

describe('POST /team', () => {
    it('OK, create team', done => {
        request(app).post('/team').set({
            'x-access-token': ownerTeamTokenKey
        }).send({
            name: 'Team Secret',
            description: 'Team Secret Description'
        }).then(res => {
            const body = res.body
            expect(res.statusCode).to.equals(200)
            expect(body).to.contain.property('team')
            done()
        }).catch(error => done(error))
    })
    it('OK, create team', done => {
        request(app).post('/team').set({
            'x-access-token': ownerTeamTokenKey
        }).send({
            name: 'Team Director',
            description: 'Team Director Description'
        }).then(res => {
            const body = res.body
            expect(res.statusCode).to.equals(200)
            expect(body).to.contain.property('team')
            done()
        }).catch(error => done(error))
    })
    it('OK, create team', done => {
        request(app).post('/team').set({
            'x-access-token': ownerTeamTokenKey
        }).send({
            name: 'Team X'
        }).then(res => {
            const body = res.body
            expect(res.statusCode).to.equals(200)
            expect(body).to.contain.property('team')
            done()
        }).catch(error => done(error))
    })
})

describe('GET /team', () => {
    it('OK, get team', done => {
        request(app).get('/team').then(res => {
            const body = res.body
            expect(res.statusCode).to.equals(200)
            expect(body).to.contain.property('teams')
            done()
        }).catch(error => done(error))
    })
})

describe('GET /team/get-by-user', () => {
    it('OK, get team', done => {
        request(app).get('/team/get-by-user').set({
            'x-access-token': ownerTeamTokenKey
        }).then(res => {
            const body = res.body
            expect(res.statusCode).to.equals(200)
            expect(body).to.contain.property('teams')
            listTeams = body.teams
            done()
        }).catch(error => done(error))
    })
})

describe('GET /team/:teamId', () => {
    it('OK, get detail team', done => {
        request(app).get(`/team/${listTeams[0]._id}`).set({
            'x-access-token': ownerTeamTokenKey
        }).then(res => {
            const body = res.body
            expect(res.statusCode).to.equals(200)
            expect(body).to.contain.property('team')
            done()
        }).catch(error => done(error))
    })
})

describe('PUT /team/:teamId', () => {
    it('OK, update team', done => {
        request(app).put(`/team/${listTeams[0]._id}`).set({
            'x-access-token': ownerTeamTokenKey
        }).send({
            name: 'Team Edit',
            description: 'Team Edit Description'
        }).then(res => {
            const body = res.body
            expect(res.statusCode).to.equals(200)
            expect(body).to.contain.property('team')
            done()
        }).catch(error => done(error))
    })
})

describe('PREPARE ADD MEMBER TO JOB', () => {
    it('Get userIds will add to project', done => {
        request(app).get('/user').then(res => {
            const body = res.body
            expect(res.statusCode).to.equals(200)
            userIds = body.users.map(user => user._id).slice(0, 4)
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

describe('POST /team/:teamId/add-members', () => {
    it('OK, add list members to team', done => {
        request(app).post(`/team/${listTeams[2]._id}/add-members`).set({
            'x-access-token': ownerTeamTokenKey
        }).send({
            userIds
        }).then(res => {
            const body = res.body
            debugger
            expect(res.statusCode).to.equals(200)
            done()
        }).catch((error) => done(error))
    })
    it('OK, add single member to team', done => {
        request(app).post(`/team/${listTeams[0]._id}/add-members`).set({
            'x-access-token': ownerTeamTokenKey
        }).send({
            userIds: userId
        }).then(res => {
            const body = res.body
            expect(res.statusCode).to.equals(200)
            done()
        }).catch((error) => done(error))
    })
    it('OK, add single member to team', done => {
        request(app).post(`/team/${listTeams[1]._id}/add-members`).set({
            'x-access-token': ownerTeamTokenKey
        }).send({
            userIds: userId
        }).then(res => {
            const body = res.body
            expect(res.statusCode).to.equals(200)
            done()
        }).catch((error) => done(error))
    })
})

describe('POST /team/:teamId/agree-join-team', () => {
    before(done => {
        request(app).post(`/auth/login`).send({
            email: 'ngocancsdl@gmail.com',
            password: '12345678d'
        }).then(res => {
            const body = res.body
            expect(res.statusCode).to.equals(200)
            userTokenKey = body.user.tokenKey
            done()
        }).catch(error => done(error))
    })
    it('OK, agree join team', done => {
        request(app).post(`/team/${listTeams[0]._id}/agree-join-team`).set({
            'x-access-token': userTokenKey
        }).then(res => {
            expect(res.statusCode).to.equals(200)
            done()
        }).catch(error => done(error))
    })
    it('OK, disagree join team', done => {
        request(app).post(`/team/${listTeams[1]._id}/disagree-join-team`).set({
            'x-access-token': userTokenKey
        }).then(res => {
            expect(res.statusCode).to.equals(200)
            done()
        }).catch(error => done(error))
    })
})

describe('POST /team/:teamId/remove-members', () => {
    it('OK, remove members in team', done => {
        request(app).post(`/team/${listTeams[0]._id}/remove-members`).set({
            'x-access-token': ownerTeamTokenKey
        }).send({
            userIds: userIds[1]
        }).then(res => {
            expect(res.statusCode).to.equals(200)
            done()
        }).catch((error) => done(error))
    })
})

describe('POST /team/:teamId/change-user-role', () => {
    it('OK, change user role', done => {
        request(app).post(`/team/${listTeams[0]._id}/change-user-role`).set({
            'x-access-token': ownerTeamTokenKey
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

describe('POST /team/:teamId/leave-team', () => {
    before(done => {
        request(app).post(`/auth/login`).send({
            email: 'ngocancsdl@gmail.com',
            password: '12345678d'
        }).then(res => {
            const body = res.body
            expect(res.statusCode).to.equals(200)
            userTokenKey = body.user.tokenKey
            done()
        }).catch(error => done(error))
    })
    it('OK, leave team', done => {
        request(app).post(`/team/${listTeams[0]._id}/leave-team`).set({
            'x-access-token': userTokenKey
        }).then(res => {
            expect(res.statusCode).to.equals(200)
            done()
        }).catch(error => done(error))
    })
})