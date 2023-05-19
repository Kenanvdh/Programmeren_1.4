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

describe("UC-203 Opvragen van gebruikersprofiel (ingelogde gebruiker)", () => {
    before((done) => {
        pool.query(CLEAR_DB, (err, result) => {
            assert(err === null);
            pool.query(INSERT_USER, (err, result) => {
                assert(err === null);
                done();
            });
        });
    });

    it('TC-203-1 - Ongeldig token', (done) => {
        const token = 1;
        chai
            .request(server)
            .get('/api/user/profile')
            .set("Authorization", "Bearer " + token)
            .end((err, res) => {
                assert(err === null)
                let { code, message, data } = res.body
                expect(code).to.equal(401)
                expect(message).to.equal('Invalid token!')
                expect(data).to.be.an('object').that.is.empty
                done()
            })
    })

    //need to check on data
    it("TC-203-2 - Should return user profile", (done) => {
        const token = jwt.sign({ userId: 6 }, jwtSecretKey);
        chai
            .request(server)
            .get("/api/user/profile")
            .set("Authorization", "Bearer " + token)
            .end((err, res) => {
                assert(err === null);
                let {data, message, code} = res.body;
                res.body.should.be.an("object");
                res.body.should.have.property("code").to.be.equal(200);
                res.body.should.have.property("message");
                res.body.should.have.property("data");

                expect(data).to.have.property('id')
                expect(data.firstName).to.equal('John')
                expect(data.lastName).to.equal('deere')
                done();
            });
    });

    after((done) => {
        pool.query(CLEAR_DB, (err, result) => {
            assert(err === null);
            done();
        });
    });
});
