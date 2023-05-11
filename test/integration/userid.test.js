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

    describe('UC-204 [Opvragen usergegevens bij ID]', () => {
        //
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
        it('TC-204-2- Should return error on non-existant user with the specified ID', (done) => {
            const userId = -1
            chai
                .request(server)
                .get(`/api/user/${userId}`)
                .end((err, res) => {
                    assert(err === null)
                    let { status, message, data } = res.body
                    expect(status).to.equal(404)
                    expect(message).to.equal('User not found')
                    expect(data).to.be.an('object')  
                    done()
                })
        });

        it('TC-204-3 - User shown', (done) => {
            // Voer de test uit
            const userId = 1;
            chai
                .request(server)
                .get(`/api/user/${userId}`)
                .end((err, res) => {
                    assert(err === null);

                    let { data, message, status } = res.body;

                    expect(status).to.equal(200);
                    expect(message).to.equal('User endpoint')

                    expect(data).to.be.an('object')
                    expect(data.id).to.equal(userId)

                    done();
                });
        });
    })
})