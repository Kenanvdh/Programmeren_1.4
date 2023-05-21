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
    "INSERT INTO user (id, firstName, lastName, isActive, emailAdress, password, phoneNumber, roles, street, city) " +
    "VALUES (6, 'John', 'deere', 1, 'john.deere@example.com', 'Password12', 0634567890, 'admin', 'dorpsstraat', 'Breda'), (7, 'john', 'doe', 1, 'john.doe@example.com', 'Password12', 0612345678, 'guest', 'Straat 12', 'Nur Sultan')";


describe("UC 202 - Opvragen van overzicht van users", () => {
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

    it('TC-202-1 - Toon alle gebruikers (minimaal 2)', (done) => {
        chai
            .request(server)
            .get('/api/user')
            .end((err, res) => {
                assert(err === null)
                let { status, message, data } = res.body
                expect(status).to.equal(200)
                expect(message).to.equal('User getAll endpoint')
                expect(data).to.be.an('array')
                expect(data.length).to.be.at.least(2)
                data.forEach((user) => {
                    expect(user).to.be.an("object");
                    expect(user).to.have.property("id");
                    expect(user).to.have.property("firstName");
                    expect(user).to.have.property("lastName");
                    expect(user).to.have.property("emailAdress");
                    expect(user).to.have.property("password");
                    expect(user).to.have.property("phoneNumber");
                    expect(user).to.have.property("roles");
                    expect(user).to.have.property("street");
                    expect(user).to.have.property("city");
                    expect(user).to.have.property("isActive");
                  });
                done()
            })
    })

    it('TC-202-2 - Toon gebruikers met zoekterm op niet-bestaande velden', (done) => {
        const filter = "password";
        chai
            .request(server)
            .get(`/api/user?${filter}`)
            .end((err, res) => {
                assert(err === null)
                let { status, message, data } = res.body
                expect(status).to.equal(200)
                expect(message).to.equal('Invalid filter(s) used')
                expect(data).to.be.an('object')
                expect(data).to.be.empty
                done()
            })
    })

    it('TC-202-3 - Toon gebruikers met gebruik van de zoekterm op het veld isActive=false', (done) => {
        const filter = "isActive=false";
        chai
            .request(server)
            .get(`/api/user?${filter}`)
            .end((err, res) => {
                assert(err === null)
                let { status, message, data } = res.body
                expect(status).to.equal(200)
                expect(message).to.equal('User getAll endpoint')
                expect(data).to.be.an('array')
                data.forEach((user) => {
                    expect(user).to.be.an("object");
                    expect(user).to.have.property("id");
                    expect(user).to.have.property("firstName");
                    expect(user).to.have.property("lastName");
                    expect(user).to.have.property("emailAdress");
                    expect(user).to.have.property("password");
                    expect(user).to.have.property("phoneNumber");
                    expect(user).to.have.property("roles");
                    expect(user).to.have.property("street");
                    expect(user).to.have.property("city");
                    expect(user).to.have.property("isActive");
                  });
                done()
            })
    })

    it('TC-202-4 - Toon gebruikers met gebruik van de zoekterm op het veld isActive=true', (done) => {
        const filter = "isActive=true";
        chai
            .request(server)
            .get(`/api/user?${filter}`)
            .end((err, res) => {
                assert(err === null);
                let { status, message, data } = res.body;
                expect(status).to.equal(200);
                expect(message).to.equal('User getAll endpoint');
                expect(data).to.be.an('array');
                expect(data.length).to.be.at.least(2);
                data.forEach((user) => {
                    expect(user).to.be.an("object");
                    expect(user).to.have.property("id");
                    expect(user).to.have.property("firstName");
                    expect(user).to.have.property("lastName");
                    expect(user).to.have.property("emailAdress");
                    expect(user).to.have.property("password");
                    expect(user).to.have.property("phoneNumber");
                    expect(user).to.have.property("roles");
                    expect(user).to.have.property("street");
                    expect(user).to.have.property("city");
                    expect(user).to.have.property("isActive");
                });
                done();
            });
    });
    
    it('TC-202-5 - Toon gebruikers met zoektermen op bestaande velden (maximaal op 2 velden filteren)', (done) => {
        chai
            .request(server)
            .get(`/api/user`)
            .query({ isActive: 'true' })
            .end((err, res) => {
                assert(err === null)
                let { status, message, data } = res.body
                expect(status).to.equal(200)
                expect(message).to.equal('User getAll endpoint')
                expect(data).to.be.an('array')
                expect(data.length).to.be.at.least(2)
                data.forEach((user) => {
                    expect(user).to.be.an("object");
                    expect(user).to.have.property("id");
                    expect(user).to.have.property("firstName");
                    expect(user).to.have.property("lastName");
                    expect(user).to.have.property("emailAdress");
                    expect(user).to.have.property("password");
                    expect(user).to.have.property("phoneNumber");
                    expect(user).to.have.property("roles");
                    expect(user).to.have.property("street");
                    expect(user).to.have.property("city");
                    expect(user).to.have.property("isActive");
                  });
                done()
            })
    })

    after((done) => {
        // Clear the database after testing
        pool.query(CLEAR_DB, (err, result) => {
            assert(err === null);
            done();
        });
    });
})
