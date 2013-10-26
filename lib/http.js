'use strict';

var queryStringify = require('querystring').stringify;
var Q = require('q');
var _extend = require('lodash').extend;
var errRespRegExp = /^(?:ERR: ([\d]{3}), ([\w\d ,.:]*))/;

function parseResponseBody(strRespBody, deferred) {
  var successRegExp;
  var respObj;
  var lastProp;
  var match;
  var error = errRespRegExp.exec(strRespBody);

  if (error) {
    respObj = new Error(error[2]);
    respObj.code = error[1];

    deferred.reject(respObj);
  } else {

    successRegExp = /\b([\w]+):|([\w\d,.]+)/g;
    respObj = {};

    while ((match = successRegExp.exec(strRespBody)) !== null) {
      if (match[1]) {
        lastProp = match[1];

      } else if (match[2]) {
        if (respObj[lastProp]) {
          respObj[lastProp] += ' ' + match[2];
        } else {
          respObj[lastProp] = match[2];
        }
      }
    }

    deferred.resolve(respObj);
  }
}

function send(reqSender, httpOpts, params) {    
  var deferred = Q.defer();
  var dataToSend = queryStringify(params);
  var req;

  if (dataToSend.length > 0) {
     if (!httpOpts.headers)  {
       httpOpts.headers = {};
     }

     // Required to send the Content-Type header = application/x-www-form-urlencoded
      httpOpts.headers['Accept'] = 'text/plain';
      httpOpts.headers['Content-Length'] = dataToSend.length; 
      httpOpts.headers['Content-Type'] = 'application/x-www-form-urlencoded; charset=utf-8';
      httpOpts.headers['User-Agent'] = 'NodeJS / clickatell-api node module';
  }

  req = reqSender(httpOpts, function (res) {
    var buffersDataList = [];

    res.on('data', function (chunk) {
      buffersDataList.push(chunk);
    });

    res.on('end', function () {
      var resDataBuffer = Buffer.concat(buffersDataList);

      parseResponseBody(resDataBuffer.toString('utf8'), deferred);
    });

  });

  req.on('error', function (err) {
    deferred.reject(err);
  });

  req.end(dataToSend, 'utf8');

  return deferred.promise;
}

module.exports = function (apiId, user, password, options) {

  var reqSender;
  var httpReqOpts = {
    host: 'api.clickatell.com',
    method: 'POST'
  };
  var requiredParams = {
    api_id: apiId,
    user: user,
    password: password
  };

  if (options && (options.secured)) {
    if ('object' === typeof options.secured) {
      // Avoid that options.secured values overwrite defined http options
      reqSender = ['pfx', 'key', 'passphrase', 'cert', 'ca', 'ciphers', 'rejectUnauthorized', 'secureProtocol'];

      reqSender.forEach(function (secOpt) {
        if (options.secured[secOpt]) {
          httpOpts[secOpt] = options.secured[secOpt]; 
        }
      });
    }

    reqSender = require('https').request;
  } else {
    reqSender = require('http').request;
  }

  return {
    sendMessage: 
      function (to, text, options) {
        var httpOpts;
        var params;
        
        httpOpts = _extend({ path: '/http/sendmsg' }, httpReqOpts);
        params = _extend({
          to: to,
          text: text
        }, requiredParams);        

        if (options) {
          params = _extend(params, options);
        }

        return send(reqSender, httpOpts, params);
      },

      queryMessage: 
        function () {
        }
  };
};
