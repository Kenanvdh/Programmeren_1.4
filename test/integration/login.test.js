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
    "VALUES (6, 'john', 'doe', 1, 'johan.doe@example.com', 'Welkom123', 123901272, 'admin', 'Dorpsstraatstraat', 'Breda'), " +
    "(7, 'jane', 'smith', 1, 'jane.smith@example.com', 'Password123', 987654321, 'user', '42 avenue', 'New York') ";

describe("UC 101 - inloggen", () => {
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
                const { body } = res;
                res.should.have.status(422);
                body.should.be.an("object");
                body.should.have
                    .property("error")
                    .to.be.equal(
                        "AssertionError [ERR_ASSERTION]: password must be a string."
                    );
                body.should.have.property("datetime");
                done();
            });
    });

    it("TC-101-2 - Verkeerd wachtwoord", (done) => {
        chai
            .request(server)
            .post("/api/login")
            .send({ emailAdress: "johan.doe@example.com", password: "password12" })
            .end((err, res) => {
                assert(err === null);
                const { body } = res;
                res.should.have.status(400);
                body.should.be.an("object");
                body.should.have.property("code").to.be.equal(400);
                body.should.have.property("message").to.be.equal("Not authorized");
                body.should.have.property("data");
                const { data } = body;
                data.should.be.an("object");
                done();
            });
    });

    it("TC-101-3 - gebruiker bestaat niet", (done) => {
        chai
            .request(server)
            .post("/api/login")
            .send({ emailAdress: "j.doe@example.com", password: "Welkom123" })
            .end((err, res) => {
                assert(err === null);
                const { body } = res;
                res.should.have.status(404);
                body.should.be.an("object");
                body.should.have.property("code").to.be.equal(404);
                body.should.have.property("message").to.be.equal("User not found");
                body.should.have.property("data");
                const { data } = body;
                data.should.be.an("object");
                done();
            });
    });

    it("TC-101-4 - Gebruiker succesvol ingelogd", (done) => {
        chai
            .request(server)
            .post("/api/login")
            .send({
                emailAdress: "johan.doe@example.com",
                password: "Welkom123",
            })
            .end((err, res) => {
                assert(err === null);
                res.should.have.status(200);
                res.body.should.be.an("object");
                res.body.should.have.property("code").to.be.equal(200);
                res.body.should.have.property("message").to.be.equal("Login endpoint");
                res.body.should.have.property("data");
                const { data } = res.body;
                data.should.be.an("object");
                data.should.have.property("token");
                data.should.have.property("id");
                data.should.have.property("firstName");
                data.should.have.property("lastName");
                data.should.have.property("emailAdress");
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