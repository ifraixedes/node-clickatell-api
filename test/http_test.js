
var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var clickatell = require('../index');

chai.use(chaiAsPromised);
require('mocha-as-promised')();

describe('An HTTP Clickatell client', function () {

  var user = 'HACKATHON66';
  var password = 'fRgjjSm3E';
  var apiId  = '3445673';
  var ckHttp;

  chai.should();
/*
  before(function () {
    var ckClient = clickatell(user, password);
    ckHttp = ckClient.http(apiId);
  });
*/

  describe('that sends a message', function () {
    before(function () {
      var ckClient = clickatell(user, password);
      ckHttp = ckClient.http(apiId);
    });

    it('with correct crendentaials should receive the message id', function () {
//      var promise = ckHttp.sendMessage('447591477385', 'It is a test sms from node');
      var promise = ckHttp.sendMessage('447591477385', 'test node');

      return promise.should.eventually.have.property('ID');
    });
  });

  /*
  describe('that sends a message with incorrect crendtials', function () {
    var promise = ckHttp.sendMessage('445591477385', 'It is a test sms from node-clickatell-api');

    return promise.should.be.rejected;

  });
  */
});
