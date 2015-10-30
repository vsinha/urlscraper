var http = require('http');
var fs = require('fs');
var formidable = require('formidable');
var google = require('google');

google.resultsPerPage = 10

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
  var nextCounter = 0;

  console.log('processing form');

  form.parse(req, function (err, fields, files) {
    console.log("received form query: " + fields['query']);

    google(fields['query'], function(error, next, links) {
      console.log('google response');
    
      if (error) console.error(error)
      
      res.writeHead(200, {
        'content-type': 'text/plain'
      });

      for (var i = 0; i < links.length; ++i) {
        var urlstring = links[i].link;

        if (urlstring) {
          console.log(urlstring);

          if (nextCounter <= 10) {
            res.write(urlstring);
            res.write('\n');
          } 

          nextCounter += 1;
          console.log ("counter = " + nextCounter);
        }

      }

      if (nextCounter < 10) {
        console.log("calling next");
        if (next) next()
      } else {
        console.log('ending response');
        res.end();
      }

    });
  });
}

var port = process.env.PORT || 1185;

server.listen(port);
console.log("server listening on " + port);
