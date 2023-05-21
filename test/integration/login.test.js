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


describe("UC 101 - Inloggen", () => {
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

    it("TC-101-1 - Verplicht veld ontbreekt", (done) => {
        chai
            .request(server)
            .post("/api/login")
            .send({ emailAdress: "johan.doe@example.com" })
            .end((err, res) => {
                assert(err === null);
                let { data, message, status } = res.body;
                expect(status).to.equal(400);
                expect(message).to.equal("Not authorized");
                expect(res.body.data).to.be.an('object');
                expect(data).to.be.empty;
                done();
            });
    });

    it("TC-101-2 - Verkeerd wachtwoord", (done) => {
        chai
            .request(server)
            .post("/api/login")
            .send({ emailAdress: "john.doe@example.com", password: "password12" })
            .end((err, res) => {
                assert(err === null);
                let { data, message, status } = res.body;
                expect(status).to.equal(400);
                expect(message).to.equal("Not authorized");
                expect(res.body.data).to.be.an('object');
                expect(data).to.be.empty;
                done();
            });
    });

    it("TC-101-3 - Gebruiker bestaat niet", (done) => {
        chai
            .request(server)
            .post("/api/login")
            .send({ emailAdress: "j.doe@example.com", password: "Welkom123" })
            .end((err, res) => {
                assert(err === null);
                let { data, message, status } = res.body;
                expect(status).to.equal(404);
                expect(message).to.equal("User not found");
                expect(res.body.data).to.be.an('object');
                expect(data).to.be.empty;
                done();
            });
    });

    it("TC-101-4 - Gebruiker succesvol ingelogd", (done) => {
        chai
            .request(server)
            .post("/api/login")
            .send({
                emailAdress: "john.doe@example.com",
                password: "Password12",
            })
            .end((err, res) => {
                assert(err === null);
                let { data, message, status } = res.body;
                expect(status).to.equal(200);
                expect(message).to.equal("Login endpoint");
                expect(res.body.data).to.be.an('object');
                expect(data).to.have.property("id").to.equal(7);
                expect(data).to.have.property("firstName").to.equal("john");
                expect(data).to.have.property("lastName").to.equal("doe");
                expect(data).to.have.property("emailAdress").to.equal("john.doe@example.com");
                expect(data).to.have.property("token");
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