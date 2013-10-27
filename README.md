# clickatell-api
This module try to be a node module which wraps the [Clickatell](http://www.clickatell.com)'s API, how it is offered for other languages.

## How to install

I've supposed that you have installed NodeJS and npm, so

```js
npm install clickatell-api
```

## How to use

To use this module, you must have a Clickatell account and the API IDs for the API that you would to use, although so far the module only offer http/s, so you must only need one, :D

Then, let's start

```js
var clickatell = require('clickatell-api');

var cktClient = clickatell('YOUR USER', 'YOUR PASSWORD');
var cktHttp = cktClient.http('YOUR HTTP API ID');

var promise = httpClient.sendMessage('447777888999', 'This is a sms from node-clickatell-api :P');

promise.then(
  function (respObj) {
    console.info('Awesome, it successed');
    console.info('The id of that message is:' + respObj.ID);
  },

  function (err) {
    console.error('Sucks, something was wrong');

    if (err.code) {
      // Yes, the library create JS Error from Clickatell error messages
      // and add the message as usual, but it also populates the error
      // under code, however the errors are not always from Clickatell,
      // so check the property
      console.error('Clickatell report an error with code: ' + err.code);
    }

    console.error('Error message:' + err.message);
  }
);
```

but "I need https", no worries, just pass and options object with the parameter ```secured``` and it'll use https

```js

// All the code is the same an expcetion of this
var ckHttp = cktClient.http('YOUR HTTP API ID', {secured: true});

```

but actually the ```secured``` options parameter may be an object with the security parameters that node ```https.request``` accepts, if you don't need them so it use the defaults, then pass true, to let clickatell-api that you want to use https.

## What API's methods, so far, it provides

So far, as mentioned, the module provides only the HTTP/S API and from it, it provides the next methods:
* sendMessage (/http/sendmsg)
* queryMessage (/http/querymsg)
* deleteMessage (/http/delmsg)
* getBalance (/http/getbalance)
* routeCoverage (/utils/routeCoverage)
* getMessageChargeByCliId (/http/getmsgcharge - with climsgid)
* getMessageChargeByApiId (/http/getmsgcharge - with apimsgid)
* spendVourcher (/http/token_pay)
* startBatch (/http_batch/startbatch)
* sendItem (/http_batch/senditem)
* quicksend (/http_batch/quicksend)
* endBatch (/http_batch/endbatch)

## Sugar
The Clickatell HTTP API doesn't send JSON data, basically it sends the response in plain text, moreover the errors are sent as a HTTP 200 response with the word 'ERR:'.

First of all, how you'll have realised the methods return a promise, so it uses promises, concretely [Q promise](https://github.com/kriskowal/q).
Secondly, this tiny module parse the response and return the response as an object when the request is successful and the promise is resolved, otherwise an instance of Error is returned rejecting the promise.

Then, bear in mind that, you know that you should receive an object with the fields specified in the text plain responses (e.g. fieldName: Value), regarding that they will be case-sensitive as they are sent by Clickatell.
However, in some responses, Clickatell response with a list of field value, as kind of on JSON array, but more ugly, plain text, and this module is not smart enough to return an array of objects, so it returns an
array of values for each field, and the position of one element of the array of one filed should be associated with element in the same position of the array of the another field.

## Launch the test
To launch the tests is as pretty much straightforward as install the module, so just install the dev dependencies and launch the test:

```js
npm test
```

## What does it need?
1. Create a task to pass the parameters for tests (user, password, api id).
2. To implement the rest of the methods of the HTTPs API (they should be quite straightforward).
3. To implement the test for the all methods of HTTPs and add more to test it more thorough.
4. To implement the other APIs.
5. Create a demo application
6. Create a github page for the project

## Why I've developed it
I've started this project in a Hackathon and so far I don't know if I will spend time in the future enhancing and providing the whole Clickatell's API, however if somebody is interested in it, then fork it or contribute sending pull requests.

## LICENSE
Just MIT, in details in LICENSE file
