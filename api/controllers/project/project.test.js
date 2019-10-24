'use strict'
const expect = require('chai').expect
const request = require('supertest')
const app = require('../../../app')
const redis = require('../../middlewares/redis')

let owner
let member
let nonMember
let listProjects // Use to update, delete this company with Id
let userIds // Array user will add to project
let userId


describe('PREPARE TESTING PROJECT', () => {
    it('OK, login user', done => {
        request(app).post(`/auth/login`).send({
            email: 'tuan.nv@amavi.asia',
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
})

describe('POST /project', () => {
    it('OK, create Project 1', done => {
        request(app).post('/project').set({
            'x-access-token': owner.tokenKey
        }).send({
            title: 'Project 1',
            description: 'curae donec pharetra magna vestibulum aliquet ultrices erat tortor sollicitudin mi sit',
            isAllowMemberAddMember: 0
        }).then(res => {
            const body = res.body
            expect(res.statusCode).to.equals(200)
            expect(body).to.contain.property('project')
            expect(body.project.title).to.equals('Project 1')
            expect(body.project.description).to.equals('curae donec pharetra magna vestibulum aliquet ultrices erat tortor sollicitudin mi sit')
            done()
        }).catch((error) => done(error))
    })
    it('OK, create Project 2', done => {
        request(app).post('/project').set({
            'x-access-token': owner.tokenKey
        }).send({
            title: 'Project 2',
            description: 'a libero nam dui proin leo odio porttitor id consequat'
        }).then(res => {
            const body = res.body
            expect(res.statusCode).to.equals(200)
            expect(body).to.contain.property('project')
            expect(body.project.title).to.equals('Project 2')
            expect(body.project.description).to.equals('a libero nam dui proin leo odio porttitor id consequat')
            done()
        }).catch((error) => done(error))
    })
    it('OK, create Project 3', done => {
        request(app).post('/project').set({
            'x-access-token': owner.tokenKey
        }).send({
            title: 'Project 3',
            description: 'ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae duis faucibus'
        }).then(res => {
            const body = res.body
            expect(res.statusCode).to.equals(200)
            expect(body).to.contain.property('project')
            expect(body.project.title).to.equals('Project 3')
            expect(body.project.description).to.equals('ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae duis faucibus')
            done()
        }).catch((error) => done(error))
    })
    it('OK, create Project 4', done => {
        request(app).post('/project').set({
            'x-access-token': owner.tokenKey
        }).send({
            title: 'Project 4',
            description: 'eget eleifend luctus ultricies eu nibh quisque id justo sit amet sapien dignissim'
        }).then(res => {
            const body = res.body
            expect(res.statusCode).to.equals(200)
            expect(body).to.contain.property('project')
            expect(body.project.title).to.equals('Project 4')
            expect(body.project.description).to.equals('eget eleifend luctus ultricies eu nibh quisque id justo sit amet sapien dignissim')
            done()
        }).catch((error) => done(error))
    })
    it('OK, create Project 5', done => {
        request(app).post('/project').set({
            'x-access-token': owner.tokenKey
        }).send({
            title: 'Project 5',
            description: 'vitae consectetuer eget rutrum at lorem integer tincidunt ante vel ipsum praesent blandit lacinia erat vestibulum sed magna at nunc'
        }).then(res => {
            const body = res.body
            expect(res.statusCode).to.equals(200)
            expect(body).to.contain.property('project')
            expect(body.project.title).to.equals('Project 5')
            expect(body.project.description).to.equals('vitae consectetuer eget rutrum at lorem integer tincidunt ante vel ipsum praesent blandit lacinia erat vestibulum sed magna at nunc')
            done()
        }).catch((error) => done(error))
    })
    it('FAIL, missing title', done => {
        request(app).post('/project').set({
            'x-access-token': owner.tokenKey
        }).send({
            description: 'Project FAIL Description'
        }).then(res => {
            expect(res.statusCode).to.equals(400)
            done()
        }).catch((error) => done(error))
    })
})

describe('GET /project', () => {
    it('OK, Query list of projects', done => {
        request(app).get('/project').set({
            'x-access-token': owner.tokenKey
        }).then(res => {
            const body = res.body
            expect(res.statusCode).to.equals(200)
            expect(body).to.contain.property('projects')
            expect(body.projects.length).to.equals(5)
            listProjects = body.projects
            redis.setex('listProjects', 3600, JSON.stringify(listProjects))
            done()
        }).catch((error) => done(error))
    })
})

describe('GET /project/:projectId', () => {
    it('OK, Get detail project', done => {
        request(app).get(`/project/${listProjects[0]._id}`).set({
            'x-access-token': owner.tokenKey
        }).then(res => {
            const body = res.body
            expect(res.statusCode).to.equals(200)
            expect(body).to.contain.property('project')
            done()
        }).catch((error) => done(error))
    })
})

describe('PREPARE ADD MEMBERS', () => {
    it('OK, get users will add to project', done => {
        request(app).get('/user').then(res => {
            const body = res.body
            expect(res.statusCode).to.equals(200)
            userIds = body.users.map(user => user._id).slice(0, 4)
            // Save to redis store to re-use
            redis.setex('userIds', 3600, JSON.stringify(userIds))
            done()
        }).catch(error => done(error))
    })
    it('OK, get single user will add to project', done => {
        request(app).get('/user/get-by-email/' + "ngocancsdl@gmail.com").then(res => {
            const body = res.body
            expect(res.statusCode).to.equals(200)
            expect(body).to.contain.property('user')
            userId = body.user._id
            done()
        }).catch(error => done(error))
    })
    it('OK, login non-member project to test permistion', done => {
        request(app).post(`/auth/login`).send({
            email: 'mai.huong@amavi.asia',
            password: '12345678c'
        }).then(res => {
            const body = res.body
            expect(res.statusCode).to.equals(200)
            nonMember = body.user
            done()
        }).catch(error => done(error))
    })
})

describe('POST /project/:projectId/add-members', () => {
    it('OK, add list members to project', done => {
        request(app).post(`/project/${listProjects[0]._id}/add-members`).set({
            'x-access-token': owner.tokenKey
        }).send({
            userIds: userIds.slice(0, 4)
        }).then(res => {
            const body = res.body
            expect(res.statusCode).to.equals(200)
            done()
        }).catch((error) => done(error))
    })
    it('OK, add single member to project', done => {
        request(app).post(`/project/${listProjects[0]._id}/add-members`).set({
            'x-access-token': owner.tokenKey
        }).send({
            userIds: userId
        }).then(res => {
            const body = res.body
            expect(res.statusCode).to.equals(200)
            done()
        }).catch((error) => done(error))
    })
    it('OK, add single member to project', done => {
        request(app).post(`/project/${listProjects[1]._id}/add-members`).set({
            'x-access-token': owner.tokenKey
        }).send({
            userIds: userId
        }).then(res => {
            const body = res.body
            expect(res.statusCode).to.equals(200)
            done()
        }).catch((error) => done(error))
    })
    it('FAIL, add wrong userId', done => {
        request(app).post(`/project/${listProjects[1]._id}/add-members`).set({
            'x-access-token': owner.tokenKey
        }).send({
            userIds: '5d9468959767571303701cf8'
        }).then(res => {
            expect(res.statusCode).to.equals(400)
            done()
        }).catch((error) => done(error))
    })
    it('FAIL, wrong projectId', done => {
        request(app).post(`/project/5d9468959767571303701cf8/add-members`).set({
            'x-access-token': owner.tokenKey
        }).send({
            userIds: '5d9468959767571303701cf8'
        }).then(res => {
            expect(res.statusCode).to.satisfy(status => {
                if (status === 400 || status === 403) {
                    return true
                }
            })
            done()
        }).catch((error) => done(error))
    })
    it('FAIL, not permistion add member to project', done => {
        request(app).post(`/project/${listProjects[2]._id}/add-members`).set({
            'x-access-token': nonMember.tokenKey
        }).send({
            userIds: userId
        }).then(res => {
            expect(res.statusCode).to.equals(403)
            done()
        }).catch((error) => done(error))
    })
})

describe('POST /project/:projectId/agree-join-project', () => {
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
    it('OK, agree join project', done => {
        request(app).post(`/project/${listProjects[0]._id}/agree-join-project`).set({
            'x-access-token': member.tokenKey
        }).then(res => {
            expect(res.statusCode).to.equals(200)
            done()
        }).catch(error => done(error))
    })
    it('FAIL, test user add members', done => {
        request(app).post(`/project/${listProjects[0]._id}/add-members`).set({
            'x-access-token': member.tokenKey
        }).send({
            userIds: userIds[4]
        }).then(res => {
            const body = res.body
            expect(res.statusCode).to.equals(400)
            done()
        }).catch((error) => done(error))
    })
    it('OK, disagree join project', done => {
        request(app).post(`/project/${listProjects[1]._id}/disagree-join-project`).set({
            'x-access-token': member.tokenKey
        }).then(res => {
            expect(res.statusCode).to.equals(200)
            done()
        }).catch(error => done(error))
    })
})

describe('POST /project/:projectId/agree-join-project', () => {
    before(done => {
        request(app).post(`/auth/login`).send({
            email: 'kien.nguyen@amavi.asia',
            password: '12345678c'
        }).then(res => {
            const body = res.body
            expect(res.statusCode).to.equals(200)
            member = body.user
            done()
        }).catch(error => done(error))
    })
    it('OK, kien.nguyen@amavi.asia agree join project', done => {
        request(app).post(`/project/${listProjects[0]._id}/agree-join-project`).set({
            'x-access-token': member.tokenKey
        }).then(res => {
            expect(res.statusCode).to.equals(200)
            done()
        }).catch(error => done(error))
    })
})

describe('POST /project/:projectId/remove-members', () => {
    it('OK, remove members in project', done => {
        request(app).post(`/project/${listProjects[0]._id}/remove-members`).set({
            'x-access-token': owner.tokenKey
        }).send({
            userIds: userIds[1]
        }).then(res => {
            expect(res.statusCode).to.equals(200)
            done()
        }).catch((error) => done(error))
    })
})

describe('GET /project/:projectId/show-members', () => {
    it('OK, show members in project', done => {
        request(app).get(`/project/${listProjects[0]._id}/show-members`).set({
            'x-access-token': owner.tokenKey
        }).then(res => {
            const body = res.body
            expect(res.statusCode).to.equals(200)
            expect(body).to.contain.property('members')
            done()
        }).catch((error) => done(error))
    })
})

describe('POST /project/:projectId/delete', () => {
    it('OK, send to trash project', done => {
        request(app).post(`/project/${listProjects[0]._id}/delete`).set({
            'x-access-token': owner.tokenKey
        }).then(res => {
            const body = res.body
            expect(res.statusCode).to.equals(200)
            expect(body).to.contain.property('project')
            expect(body.project.isDeleted).to.equals(1)
            done()
        }).catch((error) => done(error))
    })
})


describe('POST /project/:projectId/restore', () => {
    it('OK, restore project', done => {
        request(app).post(`/project/${listProjects[0]._id}/restore`).set({
            'x-access-token': owner.tokenKey
        }).then(res => {
            const body = res.body
            expect(res.statusCode).to.equals(200)
            expect(body).to.contain.property('project')
            expect(body.project.isDeleted).to.equals(0)
            done()
        }).catch((error) => done(error))
    })
})

describe('DELETE /project/:projectId', () => {
    it('OK, delete immediately project', done => {
        request(app).delete(`/project/${listProjects[4]._id}/`).set({
            'x-access-token': owner.tokenKey
        }).then(res => {
            const body = res.body
            expect(res.statusCode).to.equals(200)
            expect(body).to.contain.property('raw')
            expect(body.raw.ok).to.equals(1)
            done()
        }).catch((error) => done(error))
    })
    it('OK, check project already deleted ?', done => {
        request(app).get(`/project/${listProjects[4]._id}`).set({
            'x-access-token': owner.tokenKey
        }).then(res => {
            const body = res.body
            expect(res.statusCode).to.satisfy(status => {
                if (status === 400 || status === 403) {
                    return true
                }
            })
            expect(body).to.not.contain.property('project')
            done()
        }).catch((error) => done(error))
    })
})

describe('PUT /project/:projectId/', () => {
    it('OK, edit project, set member can add member', done => {
        request(app).put(`/project/${listProjects[0]._id}/`).set({
            'x-access-token': owner.tokenKey
        }).send({
            title: 'Project Edit',
            description: 'Description Edit',
            isAllowMemberAddMember: 1
        }).then(res => {
            const body = res.body
            expect(res.statusCode).to.equals(200)
            expect(body).to.contain.property('project')
            expect(body.project.title).to.equals('Project Edit')
            expect(body.project.description).to.equals('Description Edit')
            expect(body.project.allowed.isAllowMemberAddMember).to.equals(1)
            done()
        }).catch((error) => done(error))
    })
})

describe('POST /project/:projectId/change-user-role', () => {
    it('OK, change user role', done => {
        request(app).post(`/project/${listProjects[0]._id}/change-user-role`).set({
            'x-access-token': owner.tokenKey
        }).send({
            userId: userId,
            role: 'admin'
        }).then(res => {
            const body = res.body
            body.user.projects.every(project => {
                expect(project).to.contain.property('role', 'admin')
            })
            expect(res.statusCode).to.equals(200)
            done()
        }).catch((error) => done(error))
    })
})

describe('POST /project/:projectId/leave-project', () => {
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
    it('OK, leave project', done => {
        request(app).post(`/project/${listProjects[0]._id}/leave-project`).set({
            'x-access-token': member.tokenKey
        }).then(res => {
            expect(res.statusCode).to.equals(200)
            done()
        }).catch(error => done(error))
    })
    it('OK, add member again to project', done => {
        request(app).post(`/project/${listProjects[0]._id}/add-members`).set({
            'x-access-token': owner.tokenKey
        }).send({
            userIds: member._id
        }).then(res => {
            const body = res.body
            expect(res.statusCode).to.equals(200)
            done()
        }).catch((error) => done(error))
    })
})