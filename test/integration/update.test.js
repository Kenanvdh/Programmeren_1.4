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

describe("UC-205 Updaten van usergegevens", () => {
    before((done) => {
        pool.query(CLEAR_DB, (err, result) => {
            assert(err === null);
            pool.query(INSERT_USER, (err, result) => {
                assert(err === null);
                done();
            });
        });
    });

    it('TC-205-1- Verplicht veld "emailadres" ontbreekt', (done) => {
        const token = jwt.sign({ userId: 6 }, jwtSecretKey);
        const userId = 6

        const updatedUser = {
            firstName: 'John',
            lastName: 'Doe',
            isActive: true,
            emailAdress: '', // Empty email field
            password: 'password123',
            phoneNumber: '1234567890',
            roles: 'user',
            street: '123Straat',
            city: 'Breda'
        };

        chai
            .request(server)
            .put(`/api/user/${userId}`)
            .set("Authorization", "Bearer " + token)
            .send(updatedUser)
            .end((err, res) => {
                assert(err === null)
                expect(res).to.have.status(400);
                expect(res.body.data).to.be.an('object');
                expect(res.body.data).to.be.empty;
                expect(res.body.message).to.contain('is required');
                done();
            });
    });

    it('TC-205-2- De gebruiker is niet de eigenaar van de data', (done) => {
        const token = jwt.sign({ userId: 6 }, jwtSecretKey);
        const userId = 7

        const updatedUser = {
            firstName: "Kenan",
            lastName: "van der Heijden",
            isActive: 1,
            emailAdress: "kenanvanderheijden@ziggo.nl",
            password: "Kvdh2912",
            phoneNumber: "06 72425475",
            roles: "editor,guest",
            street: "",
            city: "Breda"
        };

        chai
            .request(server)
            .put(`/api/user/${userId}`)
            .set("Authorization", "Bearer " + token)
            .send(updatedUser)
            .end((err, res) => {
                assert(err === null)
                expect(res).to.have.status(403);
                expect(res.body.data).to.be.an('object');
                expect(res.body.data).to.be.empty;
                expect(res.body.message).to.contain('You cannot update someone elses info.');
                done();
            });
    });

    it('TC-205-3- Niet-valide telefoonnummer', (done) => {
        const token = jwt.sign({ userId: 6 }, jwtSecretKey);
        const userId = 6;

        const updatedUser = {
            firstName: 'John',
            lastName: 'Doe',
            isActive: true,
            emailAdress: '', // Empty email field
            password: 'password123',
            phoneNumber: '1234567890',
            roles: 'user',
            street: '123Straat',
            city: 'Breda'
        };

        chai
            .request(server)
            .put(`/api/user/${userId}`)
            .set("Authorization", "Bearer " + token)
            .send({ updatedUser })
            .end((err, res) => {
                assert(err === null)
                expect(res).to.have.status(400);
                expect(res.body.data).to.be.an('object');
                expect(res.body.data).to.be.empty;
                expect(res.body.message).to.contain('is required');
                done();
            });
    });

    it('TC-205-4- Gebruiker bestaat niet', (done) => {
        const token = jwt.sign({ userId: 6 }, jwtSecretKey);
        const userId = -1;
        const updatedUser = {
            firstName: 'John',
            lastName: 'Doe',
            isActive: 1,
            emailAdress: 'john@test.com',
            password: 'Password123',
            phoneNumber: '0638681055',
            roles: 'user',
            street: '123Straat',
            city: 'Breda'
        };
        chai
            .request(server)
            .put(`/api/user/${userId}`)
            .set('Authorization', 'Bearer ' + token)
            .send(updatedUser)
            .end((err, res) => {
                assert(err === null);
                const { data, message, status } = res.body;
                expect(status).to.equal(404);
                expect(message).to.equal('User not found');
                expect(data).to.be.an("object").that.is.empty
                done();
            });
    });
    
    it('TC-205-5- Niet ingelogd', (done) => {
        const token = "";
        const userId = 123;
        const updatedUser = {
            firstName: "John",
            lastName: "Doe",
            isActive: 1,
            emailAddress: "john@mail.com",
            password: "password123",
            phoneNumber: "1234567890",
            street: "123 Main St",
            city: "New York",
            roles: "guest",
        };

        chai
            .request(server)
            .put(`/api/user/${userId}`)
            .set("Authorization", `Bearer ${token}`)
            .send(updatedUser)
            .end((err, res) => {
                assert(err === null);
                expect(res).to.have.status(401);
                expect(res.body.message).to.be.equal("Invalid token!");
                expect(res.body.data).to.be.an('object');
                expect(res.body.data).to.be.empty;
                done();
            });
    });

    it('TC-205-6- Gebruiker succesvol gewijzigd', (done) => {
        const token = jwt.sign({ userId: 6 }, jwtSecretKey);
        const userId = 6
       
        const updatedUser = {
            firstName: 'John',
            lastName: 'Doe',
            isActive: 1,
            emailAdress: 'john@test.com',
            password: 'Password123',
            phoneNumber: '0638681055',
            roles: 'user',
            street: '123Straat',
            city: 'Breda'
        };

        chai
            .request(server)
            .put(`/api/user/${userId}`)
            .set("Authorization", "Bearer " + token)
            .send(updatedUser)
            .end((err, res) => {
                assert(err === null)
                expect(res).to.have.status(200);
                expect(res.body.data).to.be.an('object');
                expect(res.body.message).to.contain('User updated with id');
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