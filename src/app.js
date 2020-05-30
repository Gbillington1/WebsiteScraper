const express = require('express');
const app = express();
const port = parseInt(process.env.EXPOSED_PORT);
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const { Client } = require('pg');
const scrapes = require('./models/scrapes');

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

// make the frontend data with data that is passed in
function makeFrontend(data) {
    let frontendData = {};

    if (data.title) {
        frontendData.title = data.title;
    }

    if (data.description) {
        frontendData.description = data.description;
    }

    if (data.image) {
        frontendData.image = data.image;
    }

    if (data.favicon) {
        frontendData.favicon = data.favicon;
    }
    
    return frontendData;
}

function makeScrape(scrapeUrl, res) {
    var pattern = /^((http|https|ftp):\/\/)/;
    var DBdata = {};
    //use axios get html of url
    axios.get(scrapeUrl, DBdata)
        .then(function (response) {

            // Load our data into cheerio for DOM parsing
            const $ = cheerio.load(response.data);

            //find all meta tags with the property of ":og", and log them out in an object
            $('meta[property^="og:"]').each(function () {
                switch ($(this).attr("property")) {
                    case 'og:title':

                        DBdata.title = $(this).attr("content");

                        break;
                    case 'og:description':

                        DBdata.description = $(this).attr("content");

                        break;
                    case 'og:image':

                        DBdata.image = $(this).attr('content');

                        // add '/' to the beginning of the link if there isn't one && if image is a relative link
                        if (!(DBdata.image.charAt(0) == '/') && !(pattern.test(DBdata.image))) {
                            DBdata.image = '/' + DBdata.image;
                        }

                        // make the path absolute if it is relative
                        if (!pattern.test(DBdata.image)) {
                            DBdata.image = scrapeUrl + DBdata.image;
                        }
                        break;
                }
            });

            if (typeof DBdata.title === 'undefined') {
                $('head title').each(function () {

                    //if title hasn't been assigned yet
                    if (typeof DBdata.title === 'undefined') {
                        // There should only be one <title> tag, use the first as our title value
                        DBdata.title = $(this).text();
                    }

                });
            }

            //populate the description
            if (typeof DBdata.description === 'undefined') {
                $('p').each(function () {

                    if (typeof DBdata.description === 'undefined') {
                        DBdata.description = $(this).text();
                    }
                })

                if (typeof DBdata.description === 'undefined') {
                    $('h2').each(function () {

                        if (typeof DBdata.description === 'undefined') {
                            DBdata.description = $(this).text();
                        }

                    })
                }

            }

            // populate favicon
            if (typeof DBdata.favicon === 'undefined') {
                //changing from 'head link' to 'head link[rel]' fixed the issue I texted you about, any idea why?
                $('head link[rel]').each(function () {

                    // get link tag that has rel='icon'
                    if ($(this).attr('rel') === 'icon' &&
                        typeof DBdata.favicon === 'undefined') {

                        DBdata.favicon = $(this).attr('href');

                        // add '/' to the beginning of the path if there isn't one
                        if (!(DBdata.favicon.charAt(0) == '/') && !(pattern.test(DBdata.favicon))) {
                            DBdata.favicon = '/' + DBdata.favicon;
                        }

                        // make the path absolute if it is relative
                        if (!pattern.test(DBdata.favicon)) {
                            DBdata.favicon = scrapeUrl + DBdata.favicon;
                        }

                    }

                })
            };

            // add the data to the DB
            scrapes.addScrape(client, scrapeUrl, DBdata)

            return DBdata;
        })
        // take valuable data out of DBdata and make a frontendData object
        .then((DBdata) => {

            var frontendData = makeFrontend(DBdata);

            res.send(frontendData);
        })
        .catch(function (error) {
            console.log(error);
        })
}

//recieve post request
app.post('/scrape', function (req, res) {
    //save URL
    var pattern = /^((http|https|ftp):\/\/)/;
    var scrapeUrl = req.body.url;

    //if url is relative => add 'http://'
    if (!pattern.test(scrapeUrl)) {
        scrapeUrl = "http://" + scrapeUrl;
    }

    // if url ends with '/', remove it 
    if (scrapeUrl.charAt(scrapeUrl.length - 1) === '/') {
        scrapeUrl = scrapeUrl.substring(0, scrapeUrl.length - 1);
    }

    // pull data of scrape url from DB
    scrapes.getScrape(client, scrapeUrl).then(function (rows, error) {
        if (typeof error !== "undefined") {
            res.send({ 'error': true });

            return;
        }

        // if the url hasn't been scraped before
        if (rows.length === 0) {

            makeScrape(scrapeUrl, res);

            return;

            // if the url has been scraped before
        } else {
            // get the most recent date that the url was scraped (in MM/DD/YYYY format)
            var lastModified;
            if (!rows[0].last_modified == 'null') {
                lastModified = rows[0].last_modified.toLocaleDateString()
            } else {
                lastModified = rows[0].created_at.toLocaleDateString()
            }

            // get today's date
            var currentDate = new Date();
            // get current month (month of today's date)
            var month = currentDate.getMonth();
            // set the month of currentDate to one month ago
            currentDate.setMonth(currentDate.getMonth() - 1);
            // if one month ago is still the current month
            while (currentDate.getMonth() === month) {
                currentDate.setDate(currentDate.getDate() - 1);
            }

            // set oneMonthAgo to the date 1 month ago
            var oneMonthAgo = currentDate.toLocaleDateString()

            // if the url was scraped longer than 1 month ago, scrape again
            if (lastModified < oneMonthAgo) {

                makeScrape(scrapeUrl, res);

                // if the url was scraped less than a month ago
            } else {
                // delete data that the user doesn't care about
                let dataForFrontend = makeFrontend(rows[0]);
                // send data to frontend
                res.send(dataForFrontend);
            }
        }
    }).catch(function (err) {
        console.error(err);
    });


});

// listen for connection on localhost
app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))