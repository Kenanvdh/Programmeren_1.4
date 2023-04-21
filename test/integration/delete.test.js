const chai = require('chai')
const chaihttp = require('chai-http')
const server = require('../../index')

chai.should()
chai.use(chaihttp)
const expect = chai.expect;
const assert = require('assert');

describe('User delete', function () {
    it('TC-206-4 - User deleted', (done) => {
        // Voer de test uit
        const userId = 2;

        chai
            .request(server)
            .delete(`/api/user/${userId}`)
            .end((err, res) => {
                assert(err === null);
                let { data, message, status } = res.body;

                expect(status).to.equal(200);
                expect(message).to.equal('User met ID ' + userId + ' deleted')

                done();
            });
    });
})