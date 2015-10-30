var http = require('http'); 
var google = require('google');

google.resultsPerPage = 20;
// techincally somewhat hackish, some percent of results will be 'null', so
// if we want 10 non-null results we have to account for these null responses.
// 20 seems to be enough, future versions should use a promise-based system
// and re-ask google for results as necessary.

var doGetResponse = function(res) {
    form = '<!doctype html> \
            <html lang="en"> \
            <head> \
                <meta charset="UTF-8">  \
                <title>URL scraper</title> \
            </head> \
            <body> \
              <form name="myForm" action="/" method="post">\
                  <input type="text" name="query"> \
                  <input type="submit" value="Submit"> \
                  <span id="result"></span> \
              </form> \
            </body> \
            </html>';

  //respond
  res.setHeader('Content-Type', 'text/html');
  res.writeHead(200);
  res.end(form);
};

var getLinks = function(query, cb) {
  var linksHtmlString = "";
  var numberValidLinksFound = 0;

  // ask google for our results
  google(query, function(error, next, searchResults) {
    
    for (var i = 0; i < searchResults.length; ++i) {
      var newlink = searchResults[i].link;

      if (newlink != null) {
        linksHtmlString = linksHtmlString.concat(searchResults[i].link);
        linksHtmlString = linksHtmlString.concat("<br>");
        numberValidLinksFound += 1;
      }

      // when we get 10 that aren't null, return
      if (numberValidLinksFound >= 10) {
        break;
      }
    }

    // return what we've got
    cb(linksHtmlString);
  });
};

// Create a function to handle every HTTP request
function handler(req, res){
  if(req.method == "GET"){ 
    doGetResponse(res);

  } else if(req.method == 'POST') {
    //read form data
    req.on('data', function(chunk) {

      //grab form data as string
      var formdata = chunk.toString();
      var query = formdata.split("=")[1];

      // get the links and then send response back to the client
      getLinks(query, function(linksHtmlString) {

        //fill in the result and form values
        form = '<!doctype html> \
                <html lang="en"> \
                <head> \
                  <meta charset="UTF-8">  \
                  <title>Form Calculator Add Example</title> \
                </head> \
                <body> \
                <form name="myForm" action="/" method="post">\
                    <input type="text" name="A" value="'+query+'"> \
                    <input type="submit" value="Submit"> \
                    <br> \
                    <span id="result">'+linksHtmlString+'</span> \
                </form> \
                </body> \
                </html>';

        //respond
        res.setHeader('Content-Type', 'text/html');
        res.writeHead(200);
        res.end(form);
      });
    });

  } else {
    res.writeHead(200);
    res.end();
  };
};

// creat the server and listen on the right port
var port = process.env.PORT || 8000;
http.createServer(handler).listen(port, function(err){
  if(err){
    console.log('Error starting http server');
  } else {
    console.log("Server running at http://127.0.0.1:" + port);
  };
});