'use strict';

var isArray = require('util').isArray;
var queryStringify = require('querystring').stringify;
var Q = require('q');
var _extend = require('lodash').extend;
var errRespRegExp = /^(?:ERR: ([\d]{3}), ([\w\d ,.:]*))/;

function parseResponseBody(strRespBody, deferred) {
  var successRegExp;
  var respObj;
  var lastProp;
  var match;
  var swappedProp;
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
        swappedProp = true;
        lastProp = match[1];

        if ((respObj[lastProp]) && (!isArray(respObj[lastProp]))) {
          respObj[lastProp] = [respObj[lastProp]];
        }

      } else if (match[2]) {
        if (respObj[lastProp]) {
          if (isArray(respObj[lastProp])) {
            if (swappedProp) {
              respObj[lastProp].push(match[2]);
              swappedProp = false;
            } else {
              respObj[lastProp][respObj[lastProp].length - 1] += ' ' + match[2];
            }
          } else {
            respObj[lastProp] += ' ' + match[2];
          }
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

  if (!httpOpts.headers)  {
    httpOpts.headers = {};
  }

  httpOpts.headers['User-Agent'] = 'NodeJS / clickatell-api node module';

  if (0 < dataToSend.length) {
    if ('POST' === httpOpts.method) {
      // Content-Type: application/x-www-form-urlencoded is required not to receive 'ERR: 001, Authentication failed'
      httpOpts.headers['Content-Length'] = dataToSend.length;
      httpOpts.headers['Content-Type'] = 'application/x-www-form-urlencoded; charset=utf-8';
    } else {
      httpOpts.path += '?' + dataToSend;
    }
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

  if ('POST' === httpOpts.method) {
    req.end(dataToSend, 'utf8');
  } else {
    req.end();
  }

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
      function (to, text, from, feat, options) {
        var httpOpts;
        var params;

        httpOpts = _extend({ path: '/http/sendmsg' }, httpReqOpts);
        params = _extend({
          to: to,
          text: text,
          from: from,
          req_feat: feat
        }, requiredParams);

        if (options) {
          params = _extend(params, options);
        }

        return send(reqSender, httpOpts, params);
      },

    queryMessage:
      function (apiMsgId) {
        var httpOpts;
        var params;

        httpOpts = _extend({ path: '/http/querymsg' }, httpReqOpts);
        params = _extend({
          apimsgid: apiMsgId
        }, requiredParams);

        return send(reqSender, httpOpts, params);
      },

    deleteMessage:
      function (apiMsgId) {
        var httpOpts;
        var params;

        httpOpts = _extend({ path: '/http/delmsg' }, httpReqOpts);
        params = _extend({
          apimsgid: apiMsgId
        }, requiredParams);

        return send(reqSender, httpOpts, params);
      },

    getBalance:
      function () {
        var httpOpts;

        httpOpts = _extend({ path: '/http/getbalance' }, httpReqOpts);

        return send(reqSender, httpOpts, requiredParams);
      },

    routeCoverage:
      function (msisdn) {
        var httpOpts;
        var params;

        httpOpts = _extend({ path: '/utils/routeCoverage' }, httpReqOpts);
        params = _extend({
          msisdn: msisdn
        }, requiredParams);

        return send(reqSender, httpOpts, params);
      },


    getMessageChargeByCliId:
      function (climsgid) {
        var httpOpts;
        var params;

        httpOpts = _extend({ path: '/http/getmsgcharge' }, httpReqOpts);
        params = _extend({
          climsgid: climsgid
        }, requiredParams);

        return send(reqSender, httpOpts, params);
      },

    getMessageChargeByApiId:
      function (apimsgid) {
        var httpOpts;
        var params;

        httpOpts = _extend({ path: '/http/getmsgcharge' }, httpReqOpts);
        params = _extend({
          apimsgid: apimsgid
        }, requiredParams);

        return send(reqSender, httpOpts, params);
      },

    spendVoucher:
      function (token) {
        var httpOpts;
        var params;

        httpOpts = _extend({ path: '/http/token_pay' }, httpReqOpts);
        params = _extend({
          token: token
        }, requiredParams);

        return send(reqSender, httpOpts, params);
      },

    startBatch:
      function (template, options) {
        var httpOpts;
        var params;

        httpOpts = _extend({ path: '/http_batch/startbatch' }, httpReqOpts);
        params = _extend({
          template: template
        }, requiredParams);

        if (options) {
          params = _extend(params, options);
        }

        return send(reqSender, httpOpts, params);
      },

    sendItem:
      function (batchId, to, fields) {
        var httpOpts;
        var params;

        httpOpts = _extend({ path: '/http_batch/senditem' }, httpReqOpts);
        params = _extend({
          batch_id: batchId,
          to: to
        }, requiredParams);

        if (fields) {
          params = _extend(params, fields);
        }

        return send(reqSender, httpOpts, params);
      },

    quickSend:
      function (batchId, to) {
        var httpOpts;
        var params;

        httpOpts = _extend({ path: '/http_batch/quicksend' }, httpReqOpts);
        params = _extend({
          batch_id: batchId,
          to: to
        }, requiredParams);

        return send(reqSender, httpOpts, params);
      },

    endBatch:
      function (batchId) {
        var httpOpts;
        var params;

        httpOpts = _extend({ path: '/http_batch/endbatch' }, httpReqOpts);
        params = _extend({
          batch_id: batchId
        }, requiredParams);

        return send(reqSender, httpOpts, params);
      }
  };
};
