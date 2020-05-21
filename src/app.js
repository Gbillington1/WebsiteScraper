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

app.post('/scrape', function (req, res) {
    //save URL
    var pattern = /^((http|https|ftp):\/\/)/;
    var scrapeUrl = req.body.url;
    //if url doesn't match pattern, add http:// to the url
    if (!pattern.test(scrapeUrl)) {
        scrapeUrl = "http://" + scrapeUrl;
    }

    scrapes.getScrape(client, scrapeUrl).then(function (rows, error) {
        if (typeof error !== "undefined") {
            res.send({ 'error': true });

            return;
        }

        // if there are no rows in the db => scrape
        if (rows.length === 0) {

            //use axios get html of url
            axios.get(scrapeUrl)
                .then(function (response) {
                    var DBdata = {};

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

                                DBdata.image = $(this).attr("content");

                                break;
                        }
                    });

                    if (typeof DBdata.title === 'undefined') {
                        $('head title').each(function () {
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

                    if (typeof DBdata.favicon === 'undefined') {
                        //changing from 'head link' to 'head link[rel]' fixed the issue I texted you about, any idea why?
                        $('head link[rel]').each(function () {

                            if ($(this).attr('rel') === 'icon' &&
                                typeof DBdata.favicon === 'undefined') {

                                DBdata.favicon = $(this).attr('href');

                            }

                        })
                    }
                    // add data to DB
                    scrapes.addScrape(client, scrapeUrl, DBdata)
                    delete DBdata.crawl_id;
                    delete DBdata.raw_url;
                    delete DBdata.created_at;
                    res.send(DBdata);

                })
                .catch(function (error) {
                    console.log(error);
                })
            return;
        } else {
            var dateCreated = rows[0].created_at.toLocaleDateString()

            var currentDate = new Date();
            var month = currentDate.getMonth();
            currentDate.setMonth(currentDate.getMonth() - 1);
            while (currentDate.getMonth() === month) {
                currentDate.setDate(currentDate.setDate() - 1);
            }

            var oneMonthAgo = currentDate.toLocaleDateString()

            if (dateCreated < oneMonthAgo) {
                console.log('scraping')
                // BUG: this code adds a new row, but I actually want to update the current row => write and update function in scrapes.js??

                // find a way to only run axios once, repetitive code is a no-go

                //use axios get html of url
                axios.get(scrapeUrl)
                    .then(function (response) {
                        var DBdata = {};

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

                                    DBdata.image = $(this).attr("content");

                                    break;
                            }
                        });

                        if (typeof DBdata.title === 'undefined') {
                            $('head title').each(function () {
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

                        if (typeof DBdata.favicon === 'undefined') {
                            //changing from 'head link' to 'head link[rel]' fixed the issue I texted you about, any idea why?
                            $('head link[rel]').each(function () {

                                if ($(this).attr('rel') === 'icon' &&
                                    typeof DBdata.favicon === 'undefined') {

                                    DBdata.favicon = $(this).attr('href');

                                }

                            })
                        }
                        // add data to DB
                        scrapes.addScrape(client, scrapeUrl, DBdata)
                        delete DBdata.crawl_id;
                        delete DBdata.raw_url;
                        delete DBdata.created_at;
                        res.send(DBdata);

                    })
                    .catch(function (error) {
                        console.log(error);
                    })
                return;
            } else {
                console.log('too early to scrape')
            }

            // TODO: remove key from exsiting object
            delete rows[0].crawl_id;
            delete rows[0].raw_url;
            delete rows[0].created_at;

            // There is a crawl
            // TODO: Return the crawl data in the same format
            res.send(rows[0]);
        }


    }).catch(function (err) {
        console.error(err);
    });


});

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))