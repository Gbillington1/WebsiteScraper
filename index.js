const axios = require('axios');
const cheerio = require('cheerio');

const url = "http://hugopakula.com";

//use axios get html of url 
axios.get(url)
    .then(response => {
        console.log(response.data)
        getData(response.data)
    })
    .catch (error => {
        console.error(error);
    })

//parse html with cheerio
let getData = html => {
    data = [];
    const $ = cheerio.load(html);
    //find all meta tags with the property of ":og", and log them out in an object. (is this an object? Or does it just look like one...)
    $('meta[property^="og:"]').each(function(i) {
        console.log($(this).attr("property") + ": " + $(this).attr("content"));
    })
}

