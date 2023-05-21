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
    "VALUES (6, 'John', 'deere', 1, 'john.deere@example.com', 'Password12', 0634567890, 'admin', 'dorpsstraat', 'Breda'), (7, 'john', 'doe', 1, 'john.doe@example.com', 'Password12', 0612345678, 'guest', 'Straat 12', 'Nur Sultan')";

describe("UC-204 Opvragen van usergegevens bij ID", () => {
    before((done) => {
        pool.query(CLEAR_DB, (err, result) => {
            assert(err === null);
            pool.query(INSERT_USER, (err, result) => {
                assert(err === null);
                done();
            });
        });
    });

    it('TC-204-1 - Ongeldig token', (done) => {
        const token = 1;
        const userId = 6;
        chai
            .request(server)
            .get(`/api/user/${userId}`)
            .set("Authorization", "Bearer " + token)
            .end((err, res) => {
                assert(err === null)
                let { status, message, data } = res.body
                expect(status).to.equal(401)
                expect(message).to.equal('Invalid token!')
                expect(data).to.be.an('object').that.is.empty
                done()
            })
    })

    it('TC-204-2- Gebruiker-ID bestaat niet', (done) => {
        const token = jwt.sign({ userId: 6 }, jwtSecretKey);
        const userId = 1;
        chai
            .request(server)
            .get(`/api/user/${userId}`)
            .set("Authorization", "Bearer " + token)
            .end((err, res) => {
                assert(err === null)
                let { status, message, data } = res.body
                expect(status).to.equal(404)
                expect(message).to.equal('User not found')
                expect(data).to.be.an('object')
                done()
            })
    });

    it('TC-204-3 - Gebruiker-ID bestaat', (done) => {
        const token = jwt.sign({ userId: 6 }, jwtSecretKey);
        const userId = 6;
        chai
            .request(server)
            .get(`/api/user/${userId}`)
            .set("Authorization", "Bearer " + token)
            .end((err, res) => {
                assert(err === null);

                let { data, message, status } = res.body;

                expect(status).to.equal(200);
                expect(message).to.equal('Requested user endpoint')

                expect(data).to.be.an('object')
                expect(data.id).to.equal(userId)
                expect(data.firstName).to.equal('John')
                expect(data.lastName).to.equal('deere')
                expect(data.emailAdress).to.equal('john.deere@example.com')
                expect(data.password).to.equal('Password12')

                done();
            });
    });

    after((done) => {
        pool.query(CLEAR_DB, (err, result) => {
            assert(err === null);
            done();
        });
    });
})