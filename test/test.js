/* jshint expr:true */
var supertest = require('supertest');
var expect = require('chai').expect;

var server = supertest('http://localhost:3003/api/drones');

describe('Server health response', function () {
  it('should return 200 OK', function (done) {
    server.get('/health')
      .end(function (err, res) {
        if (err) {
          throw err;
        }
        expect(res.statusCode).to.equal(200);
        expect(res.body.status).to.equal('OK');
        done();
      });
  });
});
