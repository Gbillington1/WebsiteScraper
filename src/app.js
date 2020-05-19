const express = require('express');
const app = express();
const port = parseInt(process.env.EXPOSED_PORT);
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const { Client } = require('pg');
const scrapes = require('./models/scrapes');

// ??
app.use(express.urlencoded({ extended: true }));

//connect to DB 
const client = new Client({
    connectionString: "postgres://root:pass@postgres:5432/scraper"
});

client
    .connect()
    .then(() => console.log('connected'))
    .catch(err => console.error('error', err.stack));

//serve html page
app.get('/', function (req, res) {
    fs.readFile("./index.html", function (err, data) {
        if (err) {
            res.writeHead(404);
            res.write("Not found");
            res.end();
        } else {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.write(data);
            res.end();
        }
    });
});

app.post('/scrape', function (req, res) {
    //save URL
    var pattern = /^((http|https|ftp):\/\/)/;
    var scrapeUrl = req.body.url;
    //if url doesn't match pattern, add http:// to the url
    if (!pattern.test(scrapeUrl)) {
        scrapeUrl = "http://" + scrapeUrl;
    }

    scrapes.getScrape(client, scrapeUrl, function (rows, error) {
        if (typeof error !== "undefined") {
            res.send({ 'error': true });

            return;
        }

        // if there are no rows in the db (for this url?) => scrape
        if (rows.length === 0) {
            // There are no crawls for the provided URL yet
            // TODO: Crawl the url here
            // save the crawl data in the database
            
            //use axios get html of url
            axios.get(scrapeUrl)
                .then(function (response) {
                    var urlData = {};

                    // Load our data into cheerio for DOM parsing
                    const $ = cheerio.load(response.data);
                    //find all meta tags with the property of ":og", and log them out in an object
                    $('meta[property^="og:"]').each(function () {
                        if (typeof urlData.ogData === 'undefined') {
                            urlData.ogData = {};
                        }

                        urlData.ogData[$(this).attr("property")] = $(this).attr("content");
                    });

                    $('head title').each(function () {
                        // There should only be one <title> tag, use the first as our title value
                        if (typeof urlData.title === 'undefined') {
                            urlData.title = $(this).text();
                        }
                    });

                    $('h1').each(function (i) {

                        if (typeof urlData.h1 === 'undefined') {
                            urlData.h1 = {};
                        }

                        //adds all h1's to urlData
                        urlData.h1[i] = $(this).text();
                    })
                    $('h2').each(function (i) {

                        if (typeof urlData.h2 === 'undefined') {
                            urlData.h2 = {};
                        }

                        //adds all h1's to urlData
                        urlData.h2[i] = $(this).text();
                    })
                    
                    // send data in JSON
                    // I want to send it to the DB, not to the page
                    // client.addScrape();
                })
                .catch(function (error) {
                    console.log(error);
                })
            return;
        }

        console.log(rows);

        // There is a crawl
        // TODO: Return the crawl data in the same format
        
    });


});

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))