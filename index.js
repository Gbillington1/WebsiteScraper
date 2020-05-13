const axios = require('axios');
const cheerio = require('cheerio');
var $;

const url = "http://hugopakula.com";

//use axios get html of url 
axios.get(url)
    .then(response => {
        console.log(response.data);
    })
    .catch (error => {
        console.error(error);
    })

