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

const CLEAR_MEAL_TABLE = "DELETE IGNORE FROM `meal`;";
const CLEAR_PARTICIPANTS_TABLE = "DELETE IGNORE FROM `meal_participants_user`;";
const CLEAR_USERS_TABLE = "DELETE IGNORE FROM `user`;";
const CLEAR_DB =
    CLEAR_MEAL_TABLE + CLEAR_PARTICIPANTS_TABLE + CLEAR_USERS_TABLE;

//   insert 2 meals
// id	isActive	isVega	isVegan	isToTakeHome	dateTime	maxAmountOfParticipants	price	imageUrl	cookId	createDate	updateDate	name	description	allergenes
const INSERT_USER =
    "INSERT INTO user (id, firstName, lastName, isActive, emailAdress, password, phoneNumber, roles, street, city) VALUES (1, 'john', 'doe', 1, 'johan.doe@example.com', 'Welkom123', '123901272', 'admin', '28 straat', 'Eindhoven'), (2, 'jane', 'smith', 0, 'jane.smith@example.com', 'Password123', '987654321', 'guest', '42 avenue', 'New York');";
const INSERT_MEAL =
    "INSERT INTO meal (id, isActive, isVega, isVegan, isToTakeHome, dateTime, maxAmountOfParticipants, price, imageUrl, cookId, createDate, updateDate, name, description, allergenes) VALUES (1, 1, 1, 0, 0, '2023-05-20 18:30:00', 8, 15.99, 'https://example.com/image1.jpg', 1, '2023-05-18', '2023-05-18', 'Meal 1', 'This is the description for Meal 1', 'lactose'), (2, 1, 1, 0, 0, '2023-05-20 18:30:00', 8, 12.99, 'https://example.com/image2.jpg', 2, '2023-05-19', '2023-05-19', 'Meal 2', 'This is the description for Meal 2', 'gluten,noten');";
const INSERT = INSERT_USER + INSERT_MEAL;

describe("UC-305 Verwijderen van maaltijd", () => {
    before((done) => {
        // Clear the database and insert a user for testing
        pool.query(CLEAR_DB, (err, result) => {
            console.log("clear_db: " + err);
            assert(err === null);
            pool.query(INSERT, (err, result) => {
                console.log("insert_meal: " + err);
                assert(err === null);
                done();
            });
        });
    });

    it("TC-305-1 Niet ingelogd", (done) => {
        const token = "";
        const mealId = 1
        chai
            .request(server)
            .delete(`/api/meal/${mealId}`)
            .set("Authorization", `Bearer ${token}`)
            .end((err, res) => {
                assert(err === null);
                let { data, message, status } = res.body;
                expect(status).to.equal(401);
                expect(message).to.be.equal("Invalid token!");
                expect(data).to.be.an('object');
                expect(data).to.be.empty;
                done();
            });
    });

    it("TC-305-2 Niet de eigenaar van de data", (done) => {
        const token = jwt.sign({ userId: 1 }, jwtSecretKey);
        const id = 2;
        chai
            .request(server)
            .delete(`/api/user/${id}`)
            .set("Authorization", "Bearer " + token)
            .end((err, res) => {
                assert(err === null)
                let { data, message, status } = res.body;
                expect(status).to.equal(403);
                expect(message).to.contain('You cannot delete someone elses info.');
                expect(data).to.be.an('object');
                expect(data).to.be.empty;
                done();
            });
    });

    it("TC-305-3 Maaltijd bestaat niet", (done) => {
        const token = jwt.sign({ userId: 1 }, jwtSecretKey);
        const mealId = -1
        chai
            .request(server)
            .delete(`/api/meal/${mealId}`)
            .set("Authorization", `Bearer ${token}`)
            .end((err, res) => {
                assert(err === null);
                let { data, message, status } = res.body;
                expect(status).to.equal(404);
                expect(message).to.equal("Meal niet gevonden");
                expect(data).to.be.an('object');
                expect(data).to.be.empty;
                done();
            });
    });

    it("TC-305-4 Maaltijd succesvol verwijderd", (done) => {
        const token = jwt.sign({ userId: 1 }, jwtSecretKey);
        const mealId = 1

        chai
            .request(server)
            .delete(`/api/meal/${mealId}`)
            .set("Authorization", `Bearer ${token}`)
            .end((err, res) => {
                assert(err === null);
                let { data, message, status } = res.body;
                expect(status).to.equal(200);
                expect(message).to.contain('Meal deleted with id ')
                expect(res.body.data).to.be.an('object');
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