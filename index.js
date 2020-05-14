const axios = require('axios');
const cheerio = require('cheerio');
const http = require('http');
const fs = require('fs');

//create node server, and serve it an html file
var server = http.createServer(function(req, res) {
    console.log("request received!");
    fs.readFile("./index.html", function(err, data) {
        if (err) {
            res.writeHead(404);
            res.write("Not found");
            res.end();
        } else {
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.write(data);
            res.end();
        }
    })
})

server.listen(3000);

//does nothing
$("#submit").click(function() {
    console.log($("#url").val())
})

const url = "http://hugopakula.com";

//use axios get html of url 
axios.get(url)
    .then(function(response) {
        getData(response.data)
    })
    .catch(function(error) {
        console.error(error);
    })

//parse html with cheerio
function getData(html) {
    const $ = cheerio.load(html);
    //find all meta tags with the property of ":og", and log them out in an object
    $('meta[property^="og:"]').each(function() {
        console.log($(this).attr("property") + ": " + $(this).attr("content"));
    })
}

