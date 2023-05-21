process.env["DB_DATABASE"] = process.env.DB_DATABASE || "shareamealtest";

const chai = require('chai')
const chaihttp = require('chai-http')
const server = require('../../index')

chai.should()
chai.use(chaihttp)

describe('Server-info', function () {
    it('TC Server info', (done) => {
        chai
            .request(server)
            .get('/api/info')
            .end((err, res) => {
                res.body.should.be.an('object')
                res.body.should.has.property('status').to.be.equal(201)
                res.body.should.has.property('message')
                res.body.should.has.property('data')
                let { data, message } = res.body
                data.should.be.an('object')
                data.should.has.property('studentName').to.be.equal('Kenan')
                data.should.has.property('studentNumber').to.be.equal(2197280)
                done()
            });
    });
})