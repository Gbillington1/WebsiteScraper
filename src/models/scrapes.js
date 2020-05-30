// returns all data that match scrapeUrl
function getScrape(client, url) {
    return new Promise(function (resolve, reject) {
        // get data where url == url and has been scraped in the last 28 days
        client.query('SELECT * FROM crawls where raw_url = $1 AND created_at > current_date - interval \'28\' day;', [url], function (err, response) {
            if (err) {
                reject(err)
            } else {
                resolve(response.rows)
            }
        })
    })
}

// adds data to DB
function addScrape(client, url, data) {

    client.query('INSERT INTO crawls (raw_url, title, description, image, favicon) VALUES ($1, $2, $3, $4, $5)', [url, data.title, data.description, data.image, data.favicon])

}

// updates row (rather than making a new row) in DB
function updateScrape(client, url, data) {
    client.query('UPDATE crawls SET title = $1, description = $2, image = $3, favicon = $4 WHERE raw_url = $5', [data.title, data.description, data.image, data.favicon, url])
}

module.exports = {
    'getScrape': getScrape,
    'addScrape': addScrape,
    'updateScrape': updateScrape
};