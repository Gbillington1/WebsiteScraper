const express = require('express')
const app = express()
const port = 3000
const fs = require('fs');

app.get('/', function (req, res) {
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
    });
});

app.get('/scrape', function(req, res) {
    res.send(req.query.url);
});

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))