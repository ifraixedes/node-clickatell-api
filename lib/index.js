'use strict';

module.exports = function (user, password) {
  var httpClient;

  return {
    http: function (apiId, options) {
      if (!httpClient) {
        httpClient = require('./http')(apiId, user, password, options);
      } 

      return httpClient;
    }
  };
};
