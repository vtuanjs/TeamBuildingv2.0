const expect = require('chai').expect
const request = require('supertest')

const database = require('../../../database')
const app = require('../../../app')

let adminTokenKey = '' // Save token key after login
let userTokenKey
let listUsers = '' // Use to update, delete this userId

describe('POST /user', () => {
    before(done => {
        database.connect()
            .then(() => done())
            .catch((error) => done(error));
    })

    it('OK, create new user with email dung.van@gmail.com', done => {
        request(app).post('/user')
            .send({ name: 'Nguyen Van Dung', email: 'dung.van@gmail.com', password: '12345678a' })
            .then(res => {
                const body = res.body
                expect(res.statusCode).to.equals(200)
                expect(body).to.contain.property('user')
                expect(body.user.name).to.equals('Nguyen Van Dung')
                expect(body.user.email).to.equals('dung.van@gmail.com')
                done()
            })
            .catch((error) => done(error))
    })

    it('OK, create new user with email kien.tran@hot.com', done => {
        request(app).post('/user')
            .send({ name: 'Luck', email: 'luck@hot.com', password: '12345678b' })
            .then(res => {
                const body = res.body
                expect(res.statusCode).to.equals(200)
                expect(body).to.contain.property('user')
                expect(body.user.name).to.equals('Luck')
                expect(body.user.email).to.equals('luck@hot.com')
                done()
            })
            .catch((error) => done(error))
    })

    it('OK, create new user with email smith@exo.com', done => {
        request(app).post('/user')
            .send({ name: 'Smith', email: 'smith@exo.com', password: '12345678c' })
            .then(res => {
                const body = res.body
                expect(res.statusCode).to.equals(200)
                expect(body).to.contain.property('user')
                expect(body.user.name).to.equals('Smith')
                expect(body.user.email).to.equals('smith@exo.com')
                done()
            })
            .catch((error) => done(error))
    })

    it('OK, create new user with email tuan.nv@amavi.asia', done => {
        request(app).post('/user')
            .send({ name: 'Nguyen Van Tuan', email: 'tuan.nv@amavi.asia', password: '12345678c' })
            .then(res => {
                const body = res.body
                expect(res.statusCode).to.equals(200)
                expect(body).to.contain.property('user')
                expect(body.user.name).to.equals('Nguyen Van Tuan')
                expect(body.user.email).to.equals('tuan.nv@amavi.asia')
                done()
            })
            .catch((error) => done(error))
    })

    it('OK, create new user with email kien.nguyen@amavi.asia', done => {
        request(app).post('/user')
            .send({ name: 'Nguyen Kien', email: 'kien.nguyen@amavi.asia', password: '12345678c' })
            .then(res => {
                const body = res.body
                expect(res.statusCode).to.equals(200)
                expect(body).to.contain.property('user')
                expect(body.user.name).to.equals('Nguyen Kien')
                expect(body.user.email).to.equals('kien.nguyen@amavi.asia')
                done()
            })
            .catch((error) => done(error))
    })

    it('OK, create new user with email phu.tran@amavi.asia', done => {
        request(app).post('/user')
            .send({ name: 'Tran Phu', email: 'phu.tran@amavi.asia', password: '12345678c' })
            .then(res => {
                const body = res.body
                expect(res.statusCode).to.equals(200)
                expect(body).to.contain.property('user')
                expect(body.user.name).to.equals('Tran Phu')
                expect(body.user.email).to.equals('phu.tran@amavi.asia')
                done()
            })
            .catch((error) => done(error))
    })

    it('OK, create new user with email giang.nguyen@amavi.asia', done => {
        request(app).post('/user')
            .send({ name: 'Nguyen Giang', email: 'giang.nguyen@amavi.asia', password: '12345678c' })
            .then(res => {
                const body = res.body
                expect(res.statusCode).to.equals(200)
                expect(body).to.contain.property('user')
                expect(body.user.name).to.equals('Nguyen Giang')
                expect(body.user.email).to.equals('giang.nguyen@amavi.asia')
                done()
            })
            .catch((error) => done(error))
    })

    it('OK, create new user with email mai.huong@amavi.asia', done => {
        request(app).post('/user')
            .send({ name: 'Huong Mai', email: 'mai.huong@amavi.asia', password: '12345678c' })
            .then(res => {
                const body = res.body
                expect(res.statusCode).to.equals(200)
                expect(body).to.contain.property('user')
                expect(body.user.name).to.equals('Huong Mai')
                expect(body.user.email).to.equals('mai.huong@amavi.asia')
                done()
            })
            .catch((error) => done(error))
    })

    it('OK, create new user with email ngocancsdl@gmail.com', done => {
        request(app).post('/user')
            .send({ name: 'Lê Thị Ngọc An', email: 'ngocancsdl@gmail.com', password: '12345678d' })
            .then(res => {
                const body = res.body
                expect(res.statusCode).to.equals(200)
                expect(body).to.contain.property('user')
                expect(body.user.name).to.equals('Lê Thị Ngọc An')
                expect(body.user.email).to.equals('ngocancsdl@gmail.com')
                done()
            })
            .catch((error) => done(error))
    })

    it('Fail, Password must be eight characters or longer, must contain at least 1 numeric character, 1 lowercase charater', done => {
        request(app).post('/user')
            .send({ name: 'PWS Join', email: 'pwdjoin@gmail.com', password: '1234567' })
            .then(res => {
                const body = res.body
                expect(res.statusCode).to.equals(400)
                expect(body).to.not.contain.property('user')
                done()
            })
            .catch((error) => done(error))
    })

    it('Fail, duplicate email', done => {
        request(app).post('/user')
            .send({ name: 'Nguyen Van Dung', email: 'dung.van@gmail.com', password: '12345678e' })
            .then(res => {
                const body = res.body
                expect(res.statusCode).to.equals(400)
                expect(body).to.contain.property('message')
                expect(body).to.not.contain.property('user')
                done()
            })
            .catch((error) => done(error))
    })

    it('Fail, wrong email format', done => {
        request(app).post('/user')
            .send({ name: 'Taylor Swift', email: 'taylorgmail.com', password: '12345678f' })
            .then(res => {
                const body = res.body
                expect(res.statusCode).to.equals(400)
                expect(body).to.contain.property('message')
                expect(body).to.not.contain.property('user')
                done()
            })
            .catch((error) => done(error))
    })

    it('Fail, missing email', done => {
        request(app).post('/user')
            .send({ name: 'Taylor Swift', password: '12345678g' })
            .then(res => {
                const body = res.body
                expect(res.statusCode).to.equals(400)
                expect(body).to.contain.property('message')
                expect(body).to.not.contain.property('user')
                done()
            })
            .catch((error) => done(error))
    })

    it('Fail, missing password', done => {
        request(app).post('/user')
            .send({ name: 'Taylor Swift', email: 'taylorgmail.com' })
            .then(res => {
                const body = res.body
                expect(res.statusCode).to.equals(400)
                expect(body).to.contain.property('message')
                expect(body).to.not.contain.property('user')
                done()
            })
            .catch((error) => done(error))
    })
})

describe('GET /user', () => {
    it('OK, get list users', done => {
        request(app).get('/user')
            .then(res => {
                const body = res.body
                expect(res.statusCode).to.equals(200)
                expect(body).to.contain.property('users')
                expect(body.users.length).to.equals(9)
                listUsers = body.users
                done()
            })
            .catch(error => done(error))
    })
})

describe('GET /user/get-by-email/:email', () => {
    it('OK, find user by email', done => {
        request(app).get('/user/get-by-email/' + "smith@exo.com")
            .then(res => {
                const body = res.body
                expect(res.statusCode).to.equals(200)
                expect(body).to.contain.property('user')
                done()
            })
            .catch(error => done(error))
    })
})

describe('GET /user/:userId', () => {
    it('OK, get detail user', done => {
        request(app).get('/user/' + listUsers[0]._id)
            .then(res => {
                const body = res.body
                expect(res.statusCode).to.equals(200)
                expect(body).to.contain.property('user')
                expect(body.user).to.contain.property('name')
                expect(body.user).to.contain.property('email')
                done()
            })
            .catch(error => done(error))
    })
})

describe('POST /user/admin', () => {
    it('OK, create admin with email vantuan130393@gmail.com', done => {
        request(app).post('/user/admin')
            .send({ name: 'Nguyễn Văn Tuấn', email: 'vantuan130393@gmail.com', password: '12345678a' })
            .then(res => {
                const body = res.body
                expect(res.statusCode).to.equals(200)
                expect(body).to.contain.property('user')
                expect(body.user.name).to.equals('Nguyễn Văn Tuấn')
                expect(body.user.email).to.equals('vantuan130393@gmail.com')
                done()
            })
            .catch((error) => done(error))
    })

    it('Fail, only create admin once time', done => {
        request(app).post('/user/admin')
            .send({ name: 'Admin 2', email: 'admin2@gmail.com', password: '12345678a' })
            .then(res => {
                const body = res.body
                expect(res.statusCode).to.equals(400)
                expect(body).to.contain.property('message')
                expect(body).to.not.contain.property('user')
                done()
            })
            .catch((error) => done(error))
    })
})

describe('POST /auth/login', () => {
    it('Ok, login admin account', done => {
        request(app).post(`/auth/login`)
            .send({ email: 'vantuan130393@gmail.com', password: '12345678a' })
            .then(res => {
                const body = res.body
                expect(res.statusCode).to.equals(200)
                expect(body).to.contain.property('user')
                expect(body.user).to.contain.property('tokenKey')
                adminTokenKey = body.user.tokenKey
                // Save token key to global variable and use it in other test
                done()
            })
            .catch((error) => done(error))
    })

    it('Ok, login user account', done => {
        request(app).post(`/auth/login`)
            .send({ email: 'tuan.nv@amavi.asia', password: '12345678c' })
            .then(res => {
                const body = res.body
                expect(res.statusCode).to.equals(200)
                expect(body).to.contain.property('user')
                expect(body.user).to.contain.property('tokenKey')
                userTokenKey = body.user.tokenKey
                // Save token key to global variable and use it in other test
                done()
            })
            .catch((error) => done(error))
    })
})

describe('POST /user/admin/:userIds/block', () => {
    it('OK, block user by admin', done => {
        request(app).post(`/user/admin/${listUsers[0]._id}/block`)
            .set({ "x-access-token": adminTokenKey })
            .then(res => {
                const body = res.body
                expect(res.statusCode).to.equals(200)
                expect(body).to.contain.property('raw')
                expect(body.raw.ok).to.greaterThan(0)
                done()
            })
            .catch((error) => done(error))
    })

    it('Fail, user not permistion', done => {
        request(app).post(`/user/admin/${listUsers[1]._id}/block`)
            .set({ "x-access-token": userTokenKey })
            .then(res => {
                const body = res.body
                expect(res.statusCode).to.equals(403)
                expect(body).to.contain.property('message')
                done()
            })
            .catch((error) => done(error))
    })
})

describe('POST /user/admin/:userIds/unlock', () => {
    it('OK, unlock user by admin', done => {
        request(app).post(`/user/admin/${listUsers[0]._id}/unlock`)
            .set({ "x-access-token": adminTokenKey })
            .then(res => {
                const body = res.body
                expect(res.statusCode).to.equals(200)
                expect(body).to.contain.property('raw')
                expect(body.raw.ok).to.greaterThan(0)
                done()
            })
            .catch((error) => done(error))
    })

    it('Fail, user not permistion', done => {
        request(app).post(`/user/admin/${listUsers[1]._id}/unlock`)
            .set({ "x-access-token": userTokenKey })
            .then(res => {
                const body = res.body
                expect(res.statusCode).to.equals(403)
                expect(body).to.contain.property('message')
                done()
            })
            .catch((error) => done(error))
    })
})

describe('PUT /user/:userId', () => {
    it('OK, update user by admin', done => {
        request(app).put(`/user/${listUsers[0]._id}`)
            .set({ "x-access-token": adminTokenKey })
            .send({
                name: 'Smith',
                gender: 'male',
                phone: '0335578022',
                address: 'Ho Chi Minh'
            })
            .then(res => {
                const body = res.body
                expect(res.statusCode).to.equals(200)
                expect(body).to.contain.property('user')
                expect(body.user.name).to.equals('Smith')
                expect(body.user.gender).to.equals('male')
                expect(body.user.phone).to.equals('0335578022')
                expect(body.user.address).to.equals('Ho Chi Minh')
                done()
            })
            .catch((error) => done(error))
    })

    it('OK, update user with change password', done => {
        request(app).put(`/user/${listUsers[0]._id}`)
            .set({ "x-access-token": adminTokenKey })
            .send({
                name: 'Smith',
                gender: 'male',
                phone: '0335578022',
                address: 'Ho Chi Minh',
                password: '12345678new',
                oldPassword: '12345678a'
            })
            .then(res => {
                const body = res.body
                expect(res.statusCode).to.equals(200)
                expect(body).to.contain.property('user')
                expect(body.user.name).to.equals('Smith')
                expect(body.user.gender).to.equals('male')
                expect(body.user.phone).to.equals('0335578022')
                expect(body.user.address).to.equals('Ho Chi Minh')
                done()
            })
            .catch((error) => done(error))
    })

    it('Fail, update user wrong old password', done => {
        request(app).put(`/user/${listUsers[0]._id}`)
            .set({ "x-access-token": adminTokenKey })
            .send({
                name: 'Smith',
                gender: 'male',
                phone: '0335578022',
                address: 'Ho Chi Minh',
                password: '1234567ee',
                oldPassword: '12345678c'
            })
            .then(res => {
                expect(res.statusCode).to.equals(400)
                done()
            })
            .catch((error) => done(error))
    })

    it('Fail, user not permistion', done => {
        request(app).put(`/user/${listUsers[0]._id}`)
            .set({ "x-access-token": userTokenKey })
            .send({
                name: 'Smith',
                gender: 'male',
                phone: '0335578022',
                address: 'Ho Chi Minh',
            })
            .then(res => {
                expect(res.statusCode).to.equals(403)
                done()
            })
            .catch((error) => done(error))
    })
})

describe('DELETE /user/admin/:userIds/', () => {
    it('OK, delete user by admin', done => {
        request(app).delete(`/user/admin/${listUsers[0]._id}/`)
            .set({ "x-access-token": adminTokenKey })
            .then(res => {
                const body = res.body
                expect(res.statusCode).to.equals(200)
                expect(body).to.contain.property('raw')
                expect(body.raw.ok).to.greaterThan(0)
                done()
            })
            .catch((error) => done(error))
    })

    it('Fail, user not permistion', done => {
        request(app).delete(`/user/admin/${listUsers[0]._id}/`)
            .set({ "x-access-token": userTokenKey })
            .then(res => {
                const body = res.body
                expect(res.statusCode).to.equals(403)
                done()
            })
            .catch((error) => done(error))
    })
})
