function getRequestBody (req, callback) {
  if (req.body) {
    // Lots of apps use body-parser, so just use that if
    // the request has already been inflated.
    callback(null, req.body);
  } else {
    // Require this module just-in-time in the case
    // we don't need it at all.
    var getRawBody = require('raw-body');

    getRawBody(req, function (error, text) {
      if (error) { callback(error); }
      var body;

      try {
        body = JSON.parse(text);
      } catch (err) {
        callback(new Error('No body could be parsed.'));
      }

      callback(null, body);
    });
  }
}

module.exports = function (config) {
  if (!config.actions) { throw new Error('An actions array must be passed.') }
  if (!config.processor) { throw new Error('A processor must be passed.') }

  function middleware (req, res, next) {
    if (req.method !== 'POST') {
      return next();
    }

    getRequestBody(req, function (error, body) {
      if (error) {
        console.log('Error parsing body: ', error);
        return res.status(500).send(error);
      }

      if (config.actions.indexOf(body.type) < 0) {
        console.log('Webhook ignored because received type, "' + body.type + '", is not one of "' + config.actions.join(', ') + '".');
        return res.send('ok');
      }

      config.processor(body, function (error) {
        if (error) {
          return res.status(500).send(error);
        }

        res.send('ok');
      });
    });
  }

  return middleware;
};
