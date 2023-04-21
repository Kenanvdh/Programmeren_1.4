const chai = require('chai')
const chaihttp = require('chai-http')
const server = require('../../index')

chai.should()
chai.use(chaihttp)
const expect = chai.expect;
const assert = require('assert');

describe('User profile', function () {
    it('TC-203-2 - Profile shown', (done) => {
        // Voer de test uit
        chai
            .request(server)
            .get('/api/user/profile')
            .end((err, res) => {
                assert(err === null);
                let { data, message, status } = res.body;
                expect(status).to.equal(200);
                expect(message).to.equal('user profiel')
                expect(data).to.be.an('object')
                expect(data).to.have.property('id')
                expect(data).to.have.property('name')
                expect(data).to.have.property('email')
                expect(data).to.have.property('password')
                done();
            });
    });
})