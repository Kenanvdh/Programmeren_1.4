process.env["DB_DATABASE"] = process.env.DB_DATABASE || "shareamealtest";

const chai = require('chai')
const chaihttp = require('chai-http')
const server = require('../../index')

chai.should()
const assert = require("assert");
const expect = chai.expect;

chai.use(chaihttp)

describe('Server-info', function () {
    it('TC Server info', (done) => {
        chai
            .request(server)
            .get('/api/info')
            .end((err, res) => {
                assert(err === null);
                let { data, message, status } = res.body;
                expect('status').to.be.equal(200)
                expect('message').to.equal('Server info-endpoint')
                res.body.should.has.property('data')
                data.should.be.an('object')
                data.should.has.property('studentName').to.be.equal('Kenan')
                data.should.has.property('studentNumber').to.be.equal(2197280)
                done()
            });
    });
})