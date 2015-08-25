# connect-fulcrum-webhook

A connect middleware for processing [Fulcrum webhook](http://fulcrumapp.com/developers/overview/webhooks/) payloads.

This middleware lets you add multiple fulcrum-webhook-processing hooks into your connect-powered (Express) web framework. It removes boilerplate code to listen for POST requests with specific payload data (`record.create`, `form.update`, etc.) and lets you focus on simply processing the payload with whatever business logic you need.

## Installation

`npm install connect-fulcrum-webhook`

## Usage

Use in any connect-powered node web framework. The example below uses express and simulates sending a text message when a record is created or updated.

```javascript
var express = require('express');
var fulcrumMiddleware = require('connect-fulcrum-webhook');

var app = express();

function payloadProcessor (payload, done) {
  // Do stuff with payload like update records in a database,
  // send text messages to field staff, email supervisors when
  // task marked complete, etc.

  // After you've processed the payload call done() with no arguments to signal
  // that the webhook has been processed. Call done(), passing an error to return
  // a 500 response to the webhook request, signaling that the request should be
  // tried again later.
  sendTextMessage('Record id ' + payload.data.id + ' has been updated!', function (error) {
    if (error) {
      console.log('sendTextMessage failed with: ', error);
      done(error);
    } else {
      done();
    }
  })
}

var fulcrumMiddlewareConfig = {
  actions: ['record.create', 'record.update'],
  processor: payloadProcessor
};

app.use('/fulcrum', fulcrumMiddleware(fulcrumMiddlewareConfig));

app.listen(5000, function () {
  console.log('Listening on port 5000');
});
```

This example shows how you might perform several different actions based on what type of webhook was received, record or form changes in this case.

```javascript
var express = require('express');
var fulcrumMiddleware = require('connect-fulcrum-webhook');

var app = express();

// Process records
function recordProcessor (payload) {
  doRecordProcessingStuff(payload, done);
}
var recordConfig = {
  actions: ['record.create', 'record.update', 'record.delete'],
  processor: recordProcessor
};
app.use('/fulcrum', fulcrumMiddleware(recordConfig));

// Process forms
function formProcessor (payload) {
  doFormProcessingStuff(payload, done);
}
var formConfig = {
  actions: ['form.create', 'form.update', 'form.delete'],
  processor: formProcessor
};
app.use('/fulcrum', fulcrumMiddleware(formConfig));

app.listen(5000, function () {
  console.log('Listening on port 5000');
});
```
