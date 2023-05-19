process.env["DB_DATABASE"] = process.env.DB_DATABASE || "shareamealtest";

const chai = require("chai");
const chaiHttp = require("chai-http");
const server = require("../../index");
const assert = require("assert");
const pool = require("../../src/util/mysql-db");
const jwt = require("jsonwebtoken");
const { jwtSecretKey, logger } = require("../../src/util/utils");
require("tracer").setLevel("trace");

chai.should();
const expect = chai.expect;
chai.use(chaiHttp);

const CLEAR_MEAL_TABLE = "DELETE IGNORE FROM meal;";
const CLEAR_PARTICIPANTS_TABLE = "DELETE IGNORE FROM meal_participants_user;";
const CLEAR_USERS_TABLE = "DELETE IGNORE FROM user;";
const CLEAR_DB =
    CLEAR_MEAL_TABLE + CLEAR_PARTICIPANTS_TABLE + CLEAR_USERS_TABLE;

const INSERT_USER =
    "INSERT INTO user (id, firstName, lastName, isActive, emailAdress, password, phoneNumber, roles, street, city)" +
    "VALUES (6, 'John', 'deere', 1, 'john.deere@example.com', 'Password12', 0634567890, 'manager', 'dorpsstraat', 'Breda'), (7, 'john', 'doe', 1, 'john.doe@example.com', 'Password12', 0612345678, 'user', 'Straat 12', 'Nur Sultan')";

describe("UC 201 - create user", () => {
    before((done) => {
        // Clear the database and insert a user for testing
        pool.query(CLEAR_DB, (err, result) => {
            assert(err === null);
            pool.query(INSERT_USER, (err, result) => {
                assert(err === null);
                done();
            });
        });
    });

    it('TC-201-1- Verplicht veld ontbreekt', (done) => {
        chai
            .request(server)
            .post('/api/user')
            .send({ lastName: 'van Pol', emailAdress: "jellevanpol@gmail.com", password: 'Password1' })
            .end((err, res) => {
                assert(err === null)
                expect(res).to.have.status(400);
                expect(res.body.data).to.be.an('object');
                expect(res.body.data).to.be.empty;
                expect(res.body.message).to.contain('is invalid!');
                done();
            });
    });

    it('TC-201-2- Niet-valide emailadres', (done) => {
        const invalidEmail = 'invalid-email';
        chai
            .request(server)
            .post('/api/user')
            .send({ firstName: 'Kenan', lastName: 'van der Heijden', emailAdress: invalidEmail, password: 'K' })
            .end((err, res) => {
                assert(err === null)
                expect(res).to.have.status(400);
                expect(res.body.data).to.be.an('object');
                expect(res.body.data).to.be.empty;
                expect(res.body.message).to.contain('is invalid!');
                done();
            });
    });

    it('TC-201-3- Niet-valide wachtwoord', (done) => {
        const invalidPassword = 'invalid-password';
        chai
            .request(server)
            .post('/api/user')
            .send({ firstName: 'Kenan', lastName: 'van der Heijden', emailAdress: 'kenanvdh@ziggo.nl', password: invalidPassword, phoneNumber: '06 98765432' })
            .end((err, res) => {
                assert(err === null)
                expect(res).to.have.status(400);
                expect(res.body.data).to.be.an('object');
                expect(res.body.data).to.be.empty;
                expect(res.body.message).to.contain('is invalid!');
                done();
            });
    });

    it('TC-201-4- Gebruiker bestaat al', (done) => {
        const newUser = {
            firstName: 'John',
            lastName: 'Deere',
            emailAdress: 'john.deere@example.com',
            password: 'Password12!',
            phoneNumber: '0634567890',
            isActive: 1
        }
        chai
            .request(server)
            .post('/api/user')
            .send(newUser)
            .end((err, res) => {
                assert(err === null)
                expect(res).to.have.status(403);
                expect(res.body.message).to.contain('is already registered!');
                done();
            });
    });

    it('TC-201-5- Gebruiker succesvol geregistreerd', (done) => {
        const newUser = {
            firstName: 'Kenan',
            lastName: 'van der Heijden',
            emailAdress: 'kenanvdh@gmail.nl',
            password: 'Welkom01',
            phoneNumber: '0642108889',
            roles: "admin,guest",
            street: "",
            city: ""
        };

        chai
            .request(server)
            .post('/api/user')
            .send(newUser)
            .end((err, res) => {
                assert(err === null)

                res.body.should.be.an('object')
                let { data, message, status } = res.body

                expect(status).to.equal(200)
                expect(message).to.be.a('string').that.contains('User added with id ')
                expect(data).to.be.an('object')

                expect(data).to.have.property('id')
                expect(data.firstName).to.equal('Kenan')
                expect(data.lastName).to.equal('van der Heijden')

                done();
            });
    });

    after((done) => {
        // Clear the database after testing
        pool.query(CLEAR_DB, (err, result) => {
            assert(err === null);
            done();
        });
    });
});