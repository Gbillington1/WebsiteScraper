function getScrape(client, url) {
    // TODO: Rewrite to use promises vs callback
    return new Promise(function (resolve, reject) {
        client.query('SELECT * FROM crawls where raw_url = $1', [url], function (err, response) {
            if (err) {
                reject(err)
            } else {
                resolve(response.rows)
            }
        })
    })
}

// TODO: Add addScrape
function addScrape(client, url, data) {

    client.query('INSERT INTO crawls (raw_url, title, description, image, favicon) VALUES ($1, $2, $3, $4, $5)', [url, data.title, data.description, data.image, data.favicon])

}

module.exports = {
    'getScrape': getScrape,
    'addScrape': addScrape
};