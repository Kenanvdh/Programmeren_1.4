process.env.DB_DATABASE =
    process.env.DB_DATABASE || 'shareamealtest' || 'shareameal';
require('tracer').setLevel('debug');

const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../index');
const assert = require('assert');
const logger = require('../../src/util/utils').logger;
// require('dotenv').config()
const dbconnection = require('../../src/util/mysql-db');
// const jwt = require('jsonwebtoken')
// const { jwtSecretKey, logger } = require('../../src/config/config')

chai.should();
chai.use(chaiHttp);

/**
 * Db queries to clear and fill the test database before each test.
 *
 * LET OP: om via de mysql2 package meerdere queries in één keer uit te kunnen voeren,
 * moet je de optie 'multipleStatements: true' in de database config hebben staan.
 */
const CLEAR_MEAL_TABLE = 'DELETE IGNORE FROM `meal`;';
const CLEAR_PARTICIPANTS_TABLE = 'DELETE IGNORE FROM `meal_participants_user`;';
const CLEAR_USERS_TABLE = 'DELETE IGNORE FROM `user`;';
const CLEAR_DB =
    CLEAR_MEAL_TABLE + CLEAR_PARTICIPANTS_TABLE + CLEAR_USERS_TABLE;

/**
 * Voeg een user toe aan de database. Deze user heeft id 1.
 * Deze id kun je als foreign key gebruiken in de andere queries, bv insert meal.
 */
const INSERT_USER =
    'INSERT INTO `user` (`id`, `firstName`, `lastName`, `emailAdress`, `password`, `street`, `city` ) VALUES' +
    '(1, "first", "last", "name@server.nl", "secret", "street", "city");';


describe('Users API', () => {
    before((done) => {
        logger.debug(
            'before: hier zorg je eventueel dat de precondities correct zijn'
        );
        logger.debug('before done');
        done();
    });

    describe('UC-202 [Opvragen users]', () => {
        beforeEach((done) => {
            logger.debug('beforeEach called');
            // maak de testdatabase leeg zodat we onze testen kunnen uitvoeren.
            dbconnection.getConnection(function (err, connection) {
                if (err) {
                    done(err);
                    throw err; // no connection
                }
                // Use the connection
                connection.query(
                    CLEAR_DB + INSERT_USER,
                    function (error, results, fields) {
                        if (error) {
                            done(error);
                            throw error; // not connected!
                        }
                        logger.debug('beforeEach done');
                        // When done with the connection, release it.
                        dbconnection.releaseConnection(connection);
                        // Let op dat je done() pas aanroept als de query callback eindigt!
                        done();
                    }
                );
            });
        });
        it('TC-202-1 - Useroverview shown', (done) => {
            // Voer de test uit
            chai
                .request(server)
                .get('/api/user')
                .end((err, res) => {
                    assert(err === null);
                    let { data, message, status } = res.body;
                    expect(res).to.have.status(200);
                    expect(message).to.equal('User getAll endpoint')
                    expect(res.body.data).to.be.an('array')
                    expect(res.body.data.length).to.be.at.least(2)
                    done();
                })
        })
        it('TC-201-1- Server should return valid error on empty necessary inputfield', (done) => {
            chai
                .request(server)
                .post('/api/user')
                .end((err, res) => {
                    assert(err === null)
                    expect(res).to.have.status(400);
                    expect(res.body.data).to.be.an('object');
                    expect(res.body.data).to.be.empty;
                    expect(res.body.message).to.contain('is invalid!');
                    done();
                });
        });
        it('TC-201-2- Server should return valid error on invalid email adress', (done) => {
            const invalidEmail = 'invalid-email';
            chai
                .request(server)
                .post('/api/user')
                .send({ firstName: 'Jelle', lastName: 'van Pol', emailAdress: invalidEmail, password: 'Password' })
                .end((err, res) => {
                    assert(err === null)
                    expect(res).to.have.status(400);
                    expect(res.body.message).to.equal('email (string) is invalid!');
                    done();
                });
        });
        it('TC-201-3- Server should return valid error on invalid password', (done) => {
            const invalidPassword = 'invalid-password';
            chai
                .request(server)
                .post('/api/user')
                .send({ firstName: 'Jelle', lastName: 'van Pol', emailAdress: 'Test@ziggo.nl', password: invalidPassword, phoneNumber: '06 12345678' })
                .end((err, res) => {
                    assert(err === null)
                    expect(res).to.have.status(400);
                    expect(res.body.message).to.equal('Invalid password format!');
                    done();
                });
        });
        it('TC-201-4- Server should return valid error on existing user', (done) => {
            const newUser = {
                firstName: 'Jelle',
                lastName: 'van Pol',
                email: 'Jellevanpol@ziggo.nl',
                password: 'Password1!',
                phoneNumber: '0638681055',
                active: true
            }

            chai
                .request(server)
                .post('/api/user')
                .send(newUser)
                .end((err, res) => {
                    assert(err === null)
                    expect(res).to.have.status(403);
                    expect(res.body.message).to.equal('User already registered');
                    done();
                });
        });

    })
})
