const chai = require('chai')
const chaihttp = require('chai-http')
const server = require('../../index')

chai.should()
chai.use(chaihttp)
const expect = chai.expect;
const assert = require('assert');

describe('User id', function () {
    it('TC-204-3 - User shown', (done) => {
        // Voer de test uit
        const userId = 2;

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