var http = require('http');
var fs = require('fs');
var formidable = require('formidable');
var util = require('util');
var google = require('google');

google.resultsPerPage = 10
var nextCounter = 0

var server = http.createServer(function (req, res) {
  if (req.method.toLowerCase() == 'get') {
    displayForm(res);
  } else if (req.method.toLowerCase() == 'post') {
    processAllFieldsOfTheForm(req, res);
  }

});

function displayForm(res) {
  fs.readFile('form.html', function (err, data) {
    res.writeHead(200, {
      'Content-Type': 'text/html',
      'Content-Length': data.length
    });
    res.write(data);
    res.end();
  });
}

function processAllFieldsOfTheForm(req, res) {
  var form = new formidable.IncomingForm();

  form.parse(req, function (err, fields, files) {

    google(fields['query'], function(err, next, links) {
      if (err) { 
        res.write(err);
        res.end();
      }


      //Store the data from the fields in your data store.
      //The data store could be a file or database or any other store based
      //on your application.
      res.writeHead(200, {
        'content-type': 'text/plain'
      });

      for (var i = 0; i < links.length; ++i) {
        var urlstring = links[i].link;
        console.log(urlstring);
        res.write(urlstring);
        res.write('\n');
      }

      if (nextCounter < 4) {
        nextCounter += 1
        if (next) next()
      }

      res.end();
    });
  });
}

server.listen(1185);
console.log("server listening on 1185");
