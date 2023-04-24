const chai = require('chai')
const chaihttp = require('chai-http')
const server = require('../../index')

chai.should()
const expect = chai.expect;
chai.use(chaihttp)
const assert = require('assert');

describe('Register', function () {
    // it('TC-201-1- Server should return valid error on empty necessary input', (done) => {
    //     chai
    //         .request(server)
    //         .post('/api/user')
    //         .end((err, res) => {
    //             expect(res.body.data).to.be.an('object')
    //             expect(res.body.data).to.be.empty
    //             expect(res).to.have.status(400)
    //             expect(res.body.message).to.equal('firstName (string) is invalid!')
    //             done()
    //         });
    // });

    // it('TC-201-2- Server should return valid error on wrong formatted email', (done) => {
    //     const invalidEmail = 'invalid-email';
    //     chai
    //         .request(server)
    //         .post('/api/user')
    //         .send({ firstName: 'Kenan', lastName: 'van der Heijden', email: invalidEmail, password: 'yes' })
    //         .end((err, res) => {
    //             expect(res).to.have.status(400)
    //             expect(res.body.message).to.equal('Invalid email format!')
    //             done()
    //         });
    // });

    // it('TC-201-3- Server should return valid error on wrong formatted password', (done) => {
    //     const invalidPassword = 'invalid-password';
    //     chai
    //         .request(server)
    //         .post('/api/user')
    //         .send({ firstName: 'Kenan', lastName: 'van der Heijden', email: 'kenanvdh@ziggo.nl', password: invalidPassword })
    //         .end((err, res) => {
    //             expect(res).to.have.status(400)
    //             expect(res.body.message).to.equal('Invalid phone number format!')
    //             done()
    //         });
    // });

    // it('TC-201-4- Server should return valid error on existing user', (done) => {
    //     const user =
    //     {
    //         firstname: 'Kenan',
    //         lastname: 'van der Heijden',
    //         email: 'kenanvdh@ziggo.nl',
    //         password: 'Welkom01!',
    //         phoneNumber: '0642108889',
    //         active: true
    //     }
    //     chai
    //         .request(server)
    //         .post('/api/user')
    //         .send(user)
    //         .end((err, res) => {
    //             assert(err === null)
    //             expect(res).to.have.status(403);
    //             expect(res.body.message).to.equal('User email adres already exists!');
    //             done();
    //         });
    // });

    it('TC-201-5- Server should return succes on user registered', (done) => {
        const newUser = {
            firstName: 'Jan',
            lastName: 'Steen',
            email: 'Testemail@gmail.nl',
            password: 'Welkom04!',
            phoneNumber: '0698754321',
            active: true
        };

        chai
            .request(server)
            .post('/api/register')
            .send(newUser)
            .end((err, res) => {
                assert(err === null)

                res.body.should.be.an('object')
                let { data, message, status } = res.body

                status.should.equal(201)
                message.should.be.a('string').that.contains('User added with id ')
                data.should.be.an('object')

                data.should.have.property('id')
                data.firstName.should.equal('Jan')
                data.lastName.should.equal('Steen')

                done();
            });
    });
});
