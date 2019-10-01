'use strict'
const expect = require('chai').expect
const request = require('supertest')
const app = require('../../../app')

let ownerProjectTokenKey = ''
let userTokenKey = ''
let listProjects = '' // Use to update, delete this company with Id
let userIds // Array user will add to project
let userId

describe('POST /project', () => {
    before(done => {
        request(app).post(`/auth/login`)
            .send({ 
                email: 'tuan.nv@amavi.asia', 
                password: '12345678c' })
            .then(res => {
                const body = res.body
                expect(res.statusCode).to.equals(200)
                expect(body).to.contain.property('user')
                expect(body.user).to.contain.property('tokenKey')
                ownerProjectTokenKey = body.user.tokenKey
                done()
            })
            .catch((error) => done(error))
    })

    it('OK, create Project 1', done => {
        request(app).post('/project')
            .set({ 'x-access-token': ownerProjectTokenKey })
            .send({ 
                title: 'Project 1', 
                description: 'Project 1 Description' })
            .then(res => {
                const body = res.body
                expect(res.statusCode).to.equals(200)
                expect(body).to.contain.property('project')
                expect(body.project.title).to.equals('Project 1')
                expect(body.project.description).to.equals('Project 1 Description')
                done()
            })
            .catch((error) => done(error))
    })

    it('OK, create Project 2', done => {
        request(app).post('/project')
            .set({ 'x-access-token': ownerProjectTokenKey })
            .send({ 
                title: 'Project 2', 
                description: 'Project 2 Description' })
            .then(res => {
                const body = res.body
                expect(res.statusCode).to.equals(200)
                expect(body).to.contain.property('project')
                expect(body.project.title).to.equals('Project 2')
                expect(body.project.description).to.equals('Project 2 Description')
                done()
            })
            .catch((error) => done(error))
    })

    it('OK, create Project 3', done => {
        request(app).post('/project')
            .set({ 'x-access-token': ownerProjectTokenKey })
            .send({ 
                title: 'Project 3', 
                description: 'Project 3 Description' })
            .then(res => {
                const body = res.body
                expect(res.statusCode).to.equals(200)
                expect(body).to.contain.property('project')
                expect(body.project.title).to.equals('Project 3')
                expect(body.project.description).to.equals('Project 3 Description')
                done()
            })
            .catch((error) => done(error))
    })

    it('OK, create Project 4', done => {
        request(app).post('/project')
            .set({ 'x-access-token': ownerProjectTokenKey })
            .send({ 
                title: 'Project 4', 
                description: 'Project 4 Description' })
            .then(res => {
                const body = res.body
                expect(res.statusCode).to.equals(200)
                expect(body).to.contain.property('project')
                expect(body.project.title).to.equals('Project 4')
                expect(body.project.description).to.equals('Project 4 Description')
                done()
            })
            .catch((error) => done(error))
    })

    it('OK, create Project 5', done => {
        request(app).post('/project')
            .set({ 'x-access-token': ownerProjectTokenKey })
            .send({ 
                title: 'Project 5', 
                description: 'Project 5 Description' })
            .then(res => {
                const body = res.body
                expect(res.statusCode).to.equals(200)
                expect(body).to.contain.property('project')
                expect(body.project.title).to.equals('Project 5')
                expect(body.project.description).to.equals('Project 5 Description')
                done()
            })
            .catch((error) => done(error))
    })

    it('Fail, missing title', done => {
        request(app).post('/project')
            .set({ 'x-access-token': ownerProjectTokenKey })
            .send({ description: 'Project Fail Description' })
            .then(res => {
                expect(res.statusCode).to.equals(400)
                done()
            })
            .catch((error) => done(error))
    })
})

describe('GET /project', () => {
    it('OK, Query list of projects', done => {
        request(app).get('/project')
            .set({ 'x-access-token': ownerProjectTokenKey })
            .then(res => {
                const body = res.body
                expect(res.statusCode).to.equals(200)
                expect(body).to.contain.property('projects')
                expect(body.projects.length).to.equals(5)
                listProjects = body.projects
                done()
            })
            .catch((error) => done(error))
    })
})

describe('GET /project/:projectId', () => {
    it('OK, Get detail project', done => {
        request(app).get(`/project/${listProjects[0]._id}`)
            .set({ 'x-access-token': ownerProjectTokenKey })
            .then(res => {
                const body = res.body
                expect(res.statusCode).to.equals(200)
                expect(body).to.contain.property('project')
                done()
            })
            .catch((error) => done(error))
    })
})

describe('POST /project/:projectId/add-members', () => {
    before(done => {
        request(app).get('/user')
            .then(res => {
                const body = res.body
                expect(res.statusCode).to.equals(200)
                userIds = body.users.map(user => user._id).slice(0, 4)
            })
            .catch(error => done(error))

        request(app).get('/user/get-by-email/' + "ngocancsdl@gmail.com")
            .then(res => {
                const body = res.body
                expect(res.statusCode).to.equals(200)
                expect(body).to.contain.property('user')
                userId = body.user._id
                done()
            })
            .catch(error => done(error))
    })

    it('OK, add list members to project', done => {
        request(app).post(`/project/${listProjects[0]._id}/add-members`)
            .set({ 'x-access-token': ownerProjectTokenKey })
            .send({ userIds })
            .then(res => {
                const body = res.body
                expect(res.statusCode).to.equals(200)
                expect(body).to.contains.property('project')
                expect(body.project).to.contains.property('members')
                expect(body.project.members.length).to.equals(4)
                done()
            })
            .catch((error) => done(error))
    })

    it('OK, add single member to project', done => {
        request(app).post(`/project/${listProjects[0]._id}/add-members`)
            .set({ 'x-access-token': ownerProjectTokenKey })
            .send({ userIds: userId })
            .then(res => {
                const body = res.body
                expect(res.statusCode).to.equals(200)
                expect(body).to.contains.property('project')
                expect(body.project).to.contains.property('members')
                expect(body.project.members.length).to.equals(5)
                done()
            })
            .catch((error) => done(error))
    })

    it('OK, add single member to project', done => {
        request(app).post(`/project/${listProjects[1]._id}/add-members`)
            .set({ 'x-access-token': ownerProjectTokenKey })
            .send({ userIds: userId })
            .then(res => {
                const body = res.body
                expect(res.statusCode).to.equals(200)
                expect(body).to.contains.property('project')
                expect(body.project).to.contains.property('members')
                expect(body.project.members.length).to.equals(2)
                done()
            })
            .catch((error) => done(error))
    })
})

describe('POST /project/:projectId/agree-join-project', () => {
    before(done => {
        request(app).post(`/auth/login`)
        .send({email: 'ngocancsdl@gmail.com', password: '12345678d'})
        .then(res => {
            const body= res.body
            expect(res.statusCode).to.equals(200)
            userTokenKey = body.user.tokenKey
            done()
        })
        .catch(error => done(error))
    })

    it('OK, agree join project', done => {
        request(app).post(`/project/${listProjects[0]._id}/agree-join-project`)
        .set({'x-access-token': userTokenKey})
        .then(res => {
            expect(res.statusCode).to.equals(200)
            done()
        })
        .catch(error => done(error))
    })

    it('OK, disagree join project', done => {
        request(app).post(`/project/${listProjects[1]._id}/disagree-join-project`)
        .set({'x-access-token': userTokenKey})
        .then(res => {
            expect(res.statusCode).to.equals(200)
            done()
        })
        .catch(error => done(error))
    })
})

describe('POST /project/:projectId/remove-members', () => {
    it('OK, remove members in project', done => {
        request(app).post(`/project/${listProjects[0]._id}/remove-members`)
            .set({ 'x-access-token': ownerProjectTokenKey })
            .send({userIds: userIds[1]})
            .then(res => {
                expect(res.statusCode).to.equals(200)
                expect(res.body.project.members).to.not.include(userIds[1])
                done()
            })
            .catch((error) => done(error))
    })
})

describe('POST /project/:projectId/send-to-trash', () => {
    it('OK, send to trash project', done => {
        request(app).post(`/project/${listProjects[0]._id}/send-to-trash`)
            .set({ 'x-access-token': ownerProjectTokenKey })
            .then(res => {
                const body = res.body
                expect(res.statusCode).to.equals(200)
                expect(body).to.contain.property('project')
                done()
            })
            .catch((error) => done(error))
    })

    it('OK, check isDeleted = 1 ?', done => {
        request(app).get(`/project/${listProjects[0]._id}`)
            .set({ 'x-access-token': ownerProjectTokenKey })
            .then(res => {
                const body = res.body
                expect(res.statusCode).to.equals(200)
                expect(body).to.contain.property('project')
                expect(body.project.isDeleted).to.equals(1)
                done()
            })
            .catch((error) => done(error))
    })
})


describe('POST /project/:projectId/restore', () => {
    it('OK, restore project', done => {
        request(app).post(`/project/${listProjects[0]._id}/restore`)
            .set({ 'x-access-token': ownerProjectTokenKey })
            .then(res => {
                const body = res.body
                expect(res.statusCode).to.equals(200)
                expect(body).to.contain.property('project')
                done()
            })
            .catch((error) => done(error))
    })

    it('OK, check isDeleted = 0 ?', done => {
        request(app).get(`/project/${listProjects[0]._id}`)
            .set({ 'x-access-token': ownerProjectTokenKey })
            .then(res => {
                const body = res.body
                expect(res.statusCode).to.equals(200)
                expect(body).to.contain.property('project')
                expect(body.project.isDeleted).to.equals(0)
                done()
            })
            .catch((error) => done(error))
    })
})

describe('DELETE /project/:projectId', () => {
    it('OK, delete immediately project', done => {
        request(app).delete(`/project/${listProjects[4]._id}/`)
            .set({ 'x-access-token': ownerProjectTokenKey })
            .then(res => {
                const body = res.body
                expect(res.statusCode).to.equals(200)
                expect(body).to.contain.property('raw')
                expect(body.raw.ok).to.equals(1)
                done()
            })
            .catch((error) => done(error))
    })

    it('OK, check project already deleted ?', done => {
        request(app).get(`/project/${listProjects[4]._id}`)
            .set({ 'x-access-token': ownerProjectTokenKey })
            .then(res => {
                const body = res.body
                expect(res.statusCode).to.equals(403)
                expect(body).to.not.contain.property('project')
                done()
            })
            .catch((error) => done(error))
    })
})

describe('PUT /project/:projectId/', () => {
    it('OK, edit project', done => {
        request(app).put(`/project/${listProjects[0]._id}/`)
            .set({ 'x-access-token': ownerProjectTokenKey })
            .send({ title: 'Project Edit', description: 'Description Edit' })
            .then(res => {
                const body = res.body
                expect(res.statusCode).to.equals(200)
                expect(body).to.contain.property('project')
                expect(body.project.title).to.equals('Project Edit')
                expect(body.project.description).to.equals('Description Edit')
                done()
            })
            .catch((error) => done(error))
    })
})

describe('POST /project/:projectId/change-user-role', () => {
    it('OK, change user role', done => {
        request(app).post(`/project/${listProjects[0]._id}/change-user-role`)
            .set({ 'x-access-token': ownerProjectTokenKey })
            .send({userId: userId, role: 'admin'})
            .then(res => {
                const body = res.body
                body.user.projects.every(project => {
                    expect(project).to.contain.property('role', 'admin')
                })
                expect(res.statusCode).to.equals(200)
                done()
            })
            .catch((error) => done(error))
    })
})
