var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var clickatell = require('../index');

chai.use(chaiAsPromised);
require('mocha-as-promised')();

describe('An HTTP Clickatell client', function () {

  var user = 'TYPE Y0UR USER';
  var password = 'TYPE YOUR PASSWORD';
  var apiId  = 'TYPE YOUR HTTP API ID';

  chai.should();

  describe('which sends a message', function () {
    var ckClient = clickatell(user, password);
    var promise = ckClient.http(apiId, {secured: true}).sendMessage('447777888999', 'It is a test sms from nodejs clickatell-api module');

    it('with correct crendentials should receive the message id', function () {
      return promise.should.eventually.have.property('ID');
    });
  });

  describe('which sends a message to two numbers', function () {
    var ckClient = clickatell(user, password);
    var promise = ckClient.http(apiId, {secured: true}).sendMessage('447777888999,442222111000', 'It is a test sms from nodejs clickatell-api module');

    it('should receive the message ids', function () {
      return promise.should.eventually.have.property('ID');
    });

   it('should receive the associated numbers to the ids', function () {
     return promise.should.eventually.have.property('To');
   });
  });

  describe('which sends a message', function () {
    var ckClient = clickatell(user, password);
    var promise = ckClient.http('invalid', {secured: true}).sendMessage('447777888999', 'It is a test sms from nodejs clickatell-api module');

    it('with incorrect crendentials should received an authentencation error', function () {
      return promise.should.be.rejectedWith(Error, 'Invalid or missing api_id');
    });
  });

  describe('which query a message ', function () {
    var msgId = 'e85c2287255279da171b4c1c935aff40';
    var ckClient = clickatell(user, password);
    var promise = ckClient.http(apiId, {secured: true}).queryMessage(msgId);

    it('should receive the same message ID', function () {
      return promise.should.eventually.have.property('ID').to.equal(msgId);
    });

    it('should receive the status', function () {
      return promise.should.eventually.have.property('Status');
    });
  });

  describe('which delete a message that has been delivered', function () {
    var msgId = 'EAEEEBD696F0CB21A99684100BA8F3A2';
    var ckClient = clickatell(user, password);
    var promise = ckClient.http(apiId, {secured: true}).deleteMessage(msgId);

    it('should receive the same message ID', function () {
      return promise.should.eventually.have.property('ID').to.equal(msgId);
    });

    it('should receive the status with 004 code', function () {
      return promise.should.eventually.have.property('Status').to.equal('004');
    });
  });

  describe('which request the account balance', function () {
    var ckClient = clickatell(user, password);
    var promise = ckClient.http(apiId, {secured: true}).getBalance();

    it('should receive the credits', function () {
      return promise.should.be.eventually.have.property('Credit');
    });
  });

  describe('which request the route coverage for an accepted number', function () {
    var msisdn = '447591385477';
    var ckClient = clickatell(user, password);
    var promise = ckClient.http(apiId, {secured: true}).routeCoverage(msisdn);

    it('should receive an OK message', function () {
      return promise.should.eventually.have.property('OK');
    });

    it('should receive the Charge to send a message to it', function () {
      return promise.should.eventually.have.property('Charge');
    });
  });
});
