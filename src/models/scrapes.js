function getScrape(client, url, callback) {
    // TODO: Rewrite to use promises vs callback

    try {
        client.query('SELECT * FROM crawls where raw_url = $1', [url], function (err, result) {
            if(err) {
                console.log(err);
                callback(null, err);

                return;
            }

            callback(result.rows);
        });
    } catch(e) {
        console.log(e);
        callback(null, e);
    }
}

// TODO: Add addScrape
function addScrape(client, url, data, callback) {
    client.query('INSERT INTO crawls (raw_url, title, description, image, favicon) VALUES ($1, $2, $3, $4, $5)', [url, data.title, data.description, data.image, data.favicon])
        .then((res) => {
            callback(res.rowCount);
        })
        .catch(err => {
            console.error(err);
            callback(null, err);
        })  
}

module.exports = {
    'getScrape': getScrape,
    'addScrape': addScrape
};