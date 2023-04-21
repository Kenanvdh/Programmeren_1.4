const chai = require('chai')
const chaihttp = require('chai-http')
const server = require('../../index')

chai.should()
chai.use(chaihttp)
const expect = chai.expect;
const assert = require('assert');

describe('User overview', function () {
    it('TC-202-1 - Useroverview shown', (done) => {
        // Voer de test uit
        chai
            .request(server)
            .get('/api/user')
            .end((err, res) => {
                assert(err === null);
                let { data, message, status } = res.body;
                expect(res).to.have.status(200);
                expect(message).to.equal('user lijst')
                expect(res.body.data).to.be.an('array')
                expect(res.body.data.length).to.be.at.least(2)
                done();
            });
    });
})
