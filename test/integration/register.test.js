// const chai = require('chai')
// const chaihttp = require('chai-http')
// const server = require('../../index') 

// chai.should()
// chai.use(chaihttp)
// const expect = chai.expect;
// const assert = require('assert');

// describe('Register', function () {
//     // it('TC-201-1- Server should return valid error on empty necessary input', (done) => {
//     //     chai
//     //         .request(server)
//     //         .post('/api/register')
//     //         .end((err, res) => {
//     //             expect(res.body.data).to.be.an('object')
//     //             expect(res.body.data).to.be.empty
//     //             expect(res).to.have.status(400)
//     //             expect(res.body.message).to.equal('All fields are required!')
//     //             done()
//     //         });
//     // });
//     // it('TC-201-2- Server should return valid error on wrong formatted email', (done) => {
//     //     const invalidEmail = 'invalid-email';
//     //     chai
//     //         .request(server)
//     //         .post('/api/register')
//     //         .send({firstName: 'Kenan', lastName: 'van der Heijden', email: invalidEmail, password: 'yes'})
//     //         .end((err, res) => {
//     //             expect(res).to.have.status(400)
//     //             expect(res.body.message).to.equal('Invalid email format!')
//     //             done()
//     //         });
//     // });
//     // it('TC-201-3- Server should return valid error on wrong formatted password', (done) => {
//     //     const invalidPassword = 'invalid-password';
//     //     chai
//     //         .request(server)
//     //         .post('/api/register')
//     //         .send({firstName: 'Kenan', lastName: 'van der Heijden', email: 'kenanvdh@ziggo.nl', password: invalidPassword})
//     //         .end((err, res) => {
//     //             expect(res).to.have.status(400)
//     //             expect(res.body.message).to.equal('Invalid password!')
//     //             done()
//     //         });
//     // });
//     //  it('TC-201-4- Server should return valid error on existing user', (done) => {
//     //     const existingUser = database.users[0];
//     //     chai
//     //       .request(server)
//     //       .post('/api/register')
//     //       .send({
//     //         firstName: existingUser.firstname,
//     //         lastName: existingUser.lastname,
//     //         email: existingUser.email,
//     //         password: existingUser.password
//     //       })
//     //       .end((err, res) => {
//     //         expect(res).to.have.status(403);
//     //         expect(res.body.message).to.equal('User already exists!');
//     //         done();
//     //       });
//     //   });
//     // it('TC-201-5- Server should return succesfully registered message', (done) => {
//     //     const user ={
//     //         firstName: 'Kenan', 
//     //         lastName: 'van der Heijden', 
//     //         email: 'kenanvdh@ziggo.nl', 
//     //         password: 'Yesssss5!'
//     //     }
    
//     //     chai
//     //     .request(server)
//     //     .post('/api/register')
//     //     .send(user)
//     //     .end((err, res) => {
//     //         assert(err === null);

//     //         res.body.should.be.an('object');
//     //         let { data, message, status } = res.body;
    
//     //         status.should.equal(200);
//     //         message.should.be.a('string').that.contains('User registered');
//     //         data.should.be.an('object');
//     //         data.should.include({ id: 2 });
//     //         done()
//     //     });
//     // });
//     it('TC-201-5 - User succesvol geregistreerd', (done) => {
//         // nieuwe user waarmee we testen
//     const newUser = {
//         firstName: 'Hendrik',
//         lastName: 'van Dam',
//         emailAddress: 'hvd@server.nl',
//         password: 'Welkom01!'
//       };
  
//       // Voer de test uit
//       chai
//         .request(server)
//         .post('/api/register')
//         .send(newUser)
//         .end((err, res) => {
//           assert(err === null);
  
//           res.body.should.be.an('object');
//           let { data, message, status } = res.body;
  
//           status.should.equal(201);
//           message.should.be.a('string').that.contains('toegevoegd');
//           data.should.be.an('object');
  
//           // OPDRACHT!
//           // Bekijk zelf de API reference op https://www.chaijs.com/api/bdd/
//           // Daar zie je welke chained functions je nog meer kunt gebruiken.
//           data.should.include({ id: 2 });
//           data.should.not.include({ id: 0 });
//           data.id.should.equal(2);
//           data.firstName.should.equal('Hendrik');
  
//           done();
//           });
//       });
// })