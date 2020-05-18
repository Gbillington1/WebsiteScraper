const express = require('express');
const app = express();
const port = parseInt(process.env.EXPOSED_PORT);
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const { Client } = require('pg');
const scrapes = require('./models/scrapes');

app.use(express.urlencoded({ extended: true }));

const client = new Client({
    connectionString: "postgres://root:pass@postgres:5432/scraper"
});
client.connect();

//serve html page
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

app.post('/scrape', function(req, res) {
    //save URL
    var pattern = /^((http|https|ftp):\/\/)/;
    var scrapeUrl = req.body.url;
    //if url doesn't match pattern, add http:// to the url
    if (!pattern.test(scrapeUrl)) {
        scrapeUrl = "http://" + scrapeUrl;
    }

    scrapes.getScrape(client, scrapeUrl, function(rows, error) {
        if(typeof error !== "undefined") {
            res.send({'error': true});

            return;
        }

        if(rows.length === 0) {
            // There are no crawls for the provided URL yet
            // TODO: Crawl the url here
            //  save the crawl data in the database

            return;
        }

        console.log(rows);

        // There is a crawl
        // TODO: Return the crawl data in the same format
    });

    //use axios get html of url
    axios.get(scrapeUrl)
        .then(function(response) {
            var urlData = {};

            // Load our data into cheerio for DOM parsing
            const $ = cheerio.load(response.data);
            //find all meta tags with the property of ":og", and log them out in an object
            $('meta[property^="og:"]').each(function() {
                if(typeof urlData.ogData === 'undefined') {
                    urlData.ogData = {};
                }

                urlData.ogData[$(this).attr("property")] = $(this).attr("content");
            });

            $('head title').each(function() {
                // There should only be one <title> tag, use the first as our title value
                if(typeof urlData.title === 'undefined') {
                    urlData.title = $(this).text();
                }
            });

            // TODO: Add <h1>/<h2> tags to urlData object
            $('h1').each(function(i) {

                if (typeof urlData.h1 === 'undefined') {
                    urlData.h1 = {};
                }

                //adds all h1's to urlData
                urlData.h1[i] = $(this).text();
            })
            $('h2').each(function(i) {

                if (typeof urlData.h2 === 'undefined') {
                    urlData.h2 = {};
                }

                //adds all h1's to urlData
                urlData.h2[i] = $(this).text();
            })
            // By putting our data into JSON, we can decode it in the AJAX response on the frontend by using:
            // JSON.parse(responseData)
            // TODO: implement JSON.parse() on frontend to display the urlData object nicely
            res.send(JSON.stringify(urlData));
        })
        .catch(function(error) {
            console.log(error);
        })
});

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))